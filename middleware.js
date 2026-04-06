import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function middleware(request, event) {
  const { pathname } = request.nextUrl;

  // ==========================================
  // 1. KIỂM TRA QUYỀN TRUY CẬP TRANG ADMIN
  // ==========================================
  if (pathname.startsWith('/admin')) {
    // Moi trong túi khách ra xem có thẻ "admin_session" không
    const session = request.cookies.get('admin_session');
    
    // Nếu không có thẻ hoặc thẻ sai -> Đá thẳng về trang Đăng Nhập
    if (!session || session.value !== 'true') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // ==========================================
  // 2. BỎ QUA FILE HỆ THỐNG & API & TRANG LOGIN
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
  // 3. XỬ LÝ CHUYỂN HƯỚNG & TRACKING CLICK
  // ==========================================
  const slug = pathname.slice(1);
  let targetUrl = null;

  try {
    targetUrl = await kv.get(slug);

    if (!targetUrl) {
      const { data } = await supabase.from('links').select('original_url').eq('slug', slug).single();
      if (data?.original_url) {
        targetUrl = data.original_url;
        await kv.set(slug, targetUrl, { ex: 3600 });
      }
    }

    if (targetUrl) {
      const referrer = request.headers.get('referer') || 'Direct (Truy cập thẳng)';
      const userAgent = request.headers.get('user-agent') || 'Unknown';
      const ip = request.headers.get('x-forwarded-for') || request.ip || 'Unknown';

      event.waitUntil(
        supabase.from('click_logs').insert([{ slug, referrer, user_agent: userAgent, ip_address: ip }])
      );

      return NextResponse.redirect(new URL(targetUrl));
    }
  } catch (e) {
    console.error("Lỗi Middleware:", e);
  }

  return NextResponse.next();
}
