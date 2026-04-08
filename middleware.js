import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { createClient } from '@supabase/supabase-js'

export const config = {
  runtime: 'edge', // Bật chế độ siêu tốc độ Edge
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Tập hợp các loại Bot kiểm duyệt của nền tảng
const BOT_AGENTS = [
  'bot', 'spider', 'crawler', 'facebookexternalhit', 'slurp',
  'duckduckbot', 'tiktok', 'googlebot', 'bingbot', 'yandexbot', 'telegrambot'
];

export async function middleware(request, event) {
  const { pathname } = request.nextUrl;

  // ==========================================
  // 1. KIỂM TRA QUYỀN TRUY CẬP TRANG ADMIN
  // ==========================================
  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get('admin_session');
    if (!session || session.value !== 'true') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // ==========================================
  // 2. BỎ QUA FILE HỆ THỐNG VÀ CÁC TRANG CỦA MÀY
  // ==========================================
  if (
    pathname.startsWith('/api/') || 
    pathname.startsWith('/_next') || 
    pathname === '/' || 
    pathname === '/login' ||
    pathname === '/top' || // Bỏ qua trang phễu để nó tải bình thường
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // ==========================================
  // 3. XỬ LÝ CHUYỂN HƯỚNG & LỌC BOT & "MẮT THẦN"
  // ==========================================
  const slug = pathname.slice(1);
  let targetUrl = null;

  try {
    // Ưu tiên móc link từ bộ nhớ đệm Vercel KV cho lẹ
    targetUrl = await kv.get(slug);

    // Nếu không có thì mới chui vào Database Supabase lấy ra
    if (!targetUrl) {
      const { data } = await supabase.from('links').select('original_url').eq('slug', slug).single();
      if (data?.original_url) {
        targetUrl = data.original_url;
        await kv.set(slug, targetUrl, { ex: 3600 });
      }
    }

    if (targetUrl) {
      const userAgent = request.headers.get('user-agent') || 'Unknown';
      const ip = request.headers.get('x-forwarded-for') || request.ip || 'Unknown';
      const originalReferrer = request.headers.get('referer') || 'Direct (Truy cập thẳng)';

      // Kiểm tra xem là Bot hay là Người
      const isBot = BOT_AGENTS.some(bot => userAgent.toLowerCase().includes(bot));

      if (isBot) {
        // NẾU LÀ BOT QUÉT: Đuổi về trang chủ, mù mắt tuyệt đối, KHÔNG ghi log
        return NextResponse.rewrite(new URL('/', request.url));
      }

      // ==========================================
      // "MẮT THẦN" DÒ NGUỒN (UTM TRACKING)
      // ==========================================
      // Bắt cái đuôi ?s=... hoặc ?utm_source=... trên link
      const source = request.nextUrl.searchParams.get('s') || request.nextUrl.searchParams.get('utm_source');
      
      // Ghép cái nguồn vào chung với Referrer để báo cáo lên Admin cho sếp dễ đọc
      const finalReferrer = source ? `[Nguồn: ${source}] ${originalReferrer}` : originalReferrer;

      // NẾU LÀ NGƯỜI THẬT: Ghi log ngầm vào DB với cái Referrer đã được độ "mắt thần"
      event.waitUntil(
        supabase.from('click_logs').insert([{ 
          slug: slug, 
          referrer: finalReferrer, 
          user_agent: userAgent, 
          ip_address: ip 
        }])
      );

      // Đá văng khách sang link đích (có thể là app vay hoặc trang /top)
      return NextResponse.redirect(new URL(targetUrl));
    }
  } catch (e) {
    console.error("Lỗi Middleware:", e);
  }

  return NextResponse.next();
}
