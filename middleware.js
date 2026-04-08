import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Tập hợp các loại Bot kiểm duyệt của nền tảng để cho mù mắt
const BOT_AGENTS = [
  'bot', 'spider', 'crawler', 'facebookexternalhit', 'slurp',
  'duckduckbot', 'tiktok', 'googlebot', 'bingbot', 'yandexbot', 'telegrambot'
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // ==========================================
  // 1. KIỂM TRA QUYỀN TRUY CẬP TRANG ADMIN BẰNG SECRET KEY
  // ==========================================
  if (pathname.startsWith('/admin')) {
    const adminKey = request.cookies.get('admin_key')?.value;
    // Chìa khóa phải khớp với cấu hình trên Vercel mới cho vào
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // ==========================================
  // 2. BỎ QUA FILE HỆ THỐNG VÀ CÁC TRANG NỘI BỘ
  // ==========================================
  if (
    pathname.startsWith('/api/') || 
    pathname.startsWith('/_next') || 
    pathname === '/' || 
    pathname === '/login' ||
    pathname === '/top' || 
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // ==========================================
  // 3. XỬ LÝ LỌC BOT, BẮT NGUỒN VÀ NỐI DÂY HYPERLEAD
  // ==========================================
  const slug = pathname.slice(1);
  let targetUrl = null;

  try {
    // Tìm link đích trong KV trước cho lẹ
    targetUrl = await kv.get(slug);

    // Không có thì chui vào Database lấy ra
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

      // Kiểm tra Bot
      const isBot = BOT_AGENTS.some(bot => userAgent.toLowerCase().includes(bot));
      if (isBot) {
        // LÀ BOT: Đuổi về trang chủ, đéo đếm số
        return NextResponse.rewrite(new URL('/', request.url));
      }

      // MẮT THẦN DÒ NGUỒN (Lấy ?s=tiktok)
      const source = request.nextUrl.searchParams.get('s') || request.nextUrl.searchParams.get('utm_source');
      const finalReferrer = source ? `[Nguồn: ${source}] ${originalReferrer}` : originalReferrer;

      // ==========================================
      // KHÚC QUAN TRỌNG: GHI LOG & GẮN aff_sub1
      // ==========================================
      
      // BƯỚC A: Chờ Database ghi lại khách này và sinh ra cái ID
      const { data: logData, error } = await supabase
        .from('click_logs')
        .insert([{ 
          slug: slug, 
          referrer: finalReferrer, 
          user_agent: userAgent, 
          ip_address: ip 
        }])
        .select('id')
        .single();

      // BƯỚC B: Bẻ lái sang link đích (có thể là link app vay HyperLead hoặc trang /top)
      const finalUrl = new URL(targetUrl);
      
      // Nếu có ID log thì gắn thẻ định vị aff_sub1 vào đuôi link
      if (logData && logData.id) {
        finalUrl.searchParams.set('aff_sub1', logData.id);
      }

      // BƯỚC C: Đá văng khách đi kèm theo định vị
      return NextResponse.redirect(finalUrl);
    }
  } catch (e) {
    console.error("Lỗi Middleware:", e);
  }

  return NextResponse.next();
}
