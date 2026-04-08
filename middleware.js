// FILE: middleware.js
import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { createClient } from '@supabase/supabase-js';

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const BOT_AGENTS = [
  'bot', 'spider', 'crawler', 'facebookexternalhit', 'slurp',
  'duckduckbot', 'tiktok', 'googlebot', 'bingbot', 'yandexbot', 'telegrambot'
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Ổ KHÓA TRANG ADMIN (Đã bảo mật hơn)
  if (pathname.startsWith('/admin')) {
    const adminSession = request.cookies.get('admin_session')?.value;
    const serverKey = process.env.ADMIN_PASSWORD;

    if (!serverKey || adminSession !== serverKey) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 2. BỎ QUA CÁC TRANG CƠ BẢN
  if (pathname.startsWith('/api/') || pathname === '/' || pathname === '/login' || pathname === '/top') {
    return NextResponse.next();
  }

  // 3. XỬ LÝ KHÁCH VÀ CHUYỂN HƯỚNG TỐC ĐỘ CAO
  const slug = pathname.slice(1);
  let targetUrl = null;

  try {
    // Ưu tiên đọc từ Cache (Redis/KV) cho lẹ
    targetUrl = await kv.get(slug);

    if (!targetUrl) {
      const { data } = await supabase.from('links').select('original_url').eq('slug', slug).single();
      if (data?.original_url) {
        targetUrl = data.original_url;
        await kv.set(slug, targetUrl, { ex: 3600 }); // Lưu cache 1 tiếng
      }
    }

    if (targetUrl) {
      const userAgent = request.headers.get('user-agent') || '';
      const ip = request.headers.get('x-forwarded-for') || request.ip || 'Unknown';
      const originalReferrer = request.headers.get('referer') || 'Direct';

      // Đá đít bọn Bot
      if (BOT_AGENTS.some(bot => userAgent.toLowerCase().includes(bot))) {
        return NextResponse.rewrite(new URL('/', request.url));
      }

      const source = request.nextUrl.searchParams.get('s') || request.nextUrl.searchParams.get('utm_source');
      const finalReferrer = source ? `[Nguồn: ${source}] ${originalReferrer}` : originalReferrer;
      const finalUrl = new URL(targetUrl);

      try {
        // Ghi sổ lấy ID (Thêm timeout ngầm để không bắt khách đợi quá lâu)
        const { data: logData } = await supabase
          .from('click_logs')
          .insert([{ slug, referrer: finalReferrer, user_agent: userAgent, ip_address: ip }])
          .select('id')
          .single();

        if (logData && logData.id) {
          finalUrl.searchParams.set('aff_sub1', logData.id);
        }
      } catch (dbError) {
        console.error("Lỗi ghi log (nhưng vẫn cho đi tiếp):", dbError);
        // NẾU LỖI DB, KHÔNG ĐƯỢC CHẶN KHÁCH, VẪN CHO REDIRECT ĐỂ CỨU CHUYỂN ĐỔI
      }

      return NextResponse.redirect(finalUrl);
    }
  } catch (e) {
    console.error("Lỗi Hệ thống:", e);
  }

  return NextResponse.next();
}
