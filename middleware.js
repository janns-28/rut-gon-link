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
  // 1. CHỐT BẢO VỆ TRANG ADMIN (HTTP BASIC AUTH)
  // ==========================================
  if (pathname.startsWith('/admin')) {
    const basicAuth = request.headers.get('authorization');
    
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');
      
      // Tên đăng nhập và Mật khẩu
      const validUser = 'binhtienti';
      // Lấy pass từ Vercel, nếu chưa cài trên Vercel thì lấy tạm pass là 'chayso123'
      const validPass = process.env.ADMIN_PASSWORD || 'chayso123'; 
      
      if (user === validUser && pwd === validPass) {
        return NextResponse.next(); // Mật khẩu chuẩn -> Mở cổng cho sếp vào
      }
    }

    // Nếu chưa nhập hoặc nhập sai -> Bật hộp thoại bắt nhập lại
    return new NextResponse('Khu vực nội bộ! Vui lòng quay xe.', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Secure Admin Area"' }
    });
  }

  // ==========================================
  // 2. BỎ QUA FILE HỆ THỐNG & API 
  // ==========================================
  if (
    pathname.includes('/api/') || 
    pathname.startsWith('/_next') || 
    pathname === '/' || 
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
      const referrer = request.headers.get('referer') || 'Direct';
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
