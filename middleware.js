import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Tập hợp các loại Bot quét link của nền tảng
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
  // 2. BỎ QUA FILE HỆ THỐNG
  // ==========================================
  if (
    pathname.startsWith('/api/') || 
    pathname.startsWith('/_next') || 
    pathname === '/' || 
    pathname === '/login' || 
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // ==========================================
  // 3. XỬ LÝ CHUYỂN HƯỚNG & LỌC BOT (CLOAKING)
  // ==========================================
  const slug = pathname.slice(1);
  let targetUrl = null;

  try {
    targetUrl = await kv.get(slug);

    if (!targetUrl) {
      const { data } = await supabase.from('links').select('original_url').eq('slug', slug).single();
      if (data?.original_url) {
        targetUrl = data.original_url;
        // Lưu cache 1 tiếng để đợt sau khách vào ko cần gọi Database
        await kv.set(slug, targetUrl, { ex: 3600 });
      }
    }

    if (targetUrl) {
      const userAgent = request.headers.get('user-agent') || 'Unknown';
      const ip = request.headers.get('x-forwarded-for') || request.ip || 'Unknown';
      const referrer = request.headers.get('referer') || 'Direct (Truy cập thẳng)';

      // Kiểm tra xem thằng đang click là Người hay Bot
      const isBot = BOT_AGENTS.some(bot => userAgent.toLowerCase().includes(bot));

      if (isBot) {
        // NẾU LÀ BOT QUÉT CỦA MẠNG XÃ HỘI:
        // Đánh lừa nó bằng cách hiển thị trang chủ (rất sạch sẽ) thay vì link vay tiền
        // VÀ KHÔNG GHI LOG để tránh làm rác bảng thống kê của sếp
        return NextResponse.rewrite(new URL('/', request.url));
      }

      // NẾU LÀ NGƯỜI THẬT: 
      // Ghi log vào Supabase ngầm (không làm chậm tốc độ)
      event.waitUntil(
        supabase.from('click_logs').insert([{ slug, referrer, user_agent: userAgent, ip_address: ip }])
      );

      // Đá văng khách sang link Affiliate để mút hoa hồng
      return NextResponse.redirect(new URL(targetUrl));
    }
  } catch (e) {
    console.error("Lỗi Middleware:", e);
  }

  return NextResponse.next();
}
