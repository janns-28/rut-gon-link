import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// THÊM 'event' VÀO ĐÂY ĐỂ CHẠY TÁC VỤ NGẦM
export async function middleware(request, event) {
  const { pathname } = request.nextUrl;

  // BỎ QUA API, ADMIN VÀ CÁC TRANG HỆ THỐNG ĐỂ TRÁNH LỖI VÀ TRACKING NHẦM
  if (
    pathname.includes('/api/') || 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/_next') || 
    pathname === '/' || 
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const slug = pathname.slice(1);
  let targetUrl = null;

  try {
    // 1. Check bộ nhớ đệm Vercel KV trước
    targetUrl = await kv.get(slug);

    // 2. Nếu chưa có trong cache thì mới mò vào Database
    if (!targetUrl) {
      const { data } = await supabase
        .from('links')
        .select('original_url')
        .eq('slug', slug)
        .single();

      if (data?.original_url) {
        targetUrl = data.original_url;
        // Lưu lại vào Cache 1 tiếng
        await kv.set(slug, targetUrl, { ex: 3600 });
      }
    }

    // 3. NẾU TÌM THẤY LINK ĐÍCH -> TRACKING & CHUYỂN HƯỚNG
    if (targetUrl) {
      // --- BẮT ĐẦU THEO DÕI ---
      // Lấy nguồn khách đến (Từ FB, Tiktok, Web khác...)
      const referrer = request.headers.get('referer') || 'Direct (Truy cập trực tiếp)';
      // Lấy thông tin thiết bị (Android, iOS, Chrome, Safari...)
      const userAgent = request.headers.get('user-agent') || 'Unknown';
      // Lấy IP (để sau này chống click tặc nếu cần)
      const ip = request.headers.get('x-forwarded-for') || request.ip || 'Unknown';

      // Chạy ngầm việc insert vào Supabase (Tuyệt đối không dùng await ở đây)
      // Dùng event.waitUntil để Vercel không ngắt tác vụ ngầm này
      event.waitUntil(
        supabase.from('click_logs').insert([{
          slug: slug,
          referrer: referrer,
          user_agent: userAgent,
          ip_address: ip
        }])
      );
      // -------------------------

      // CHUYỂN HƯỚNG NGAY LẬP TỨC
      return NextResponse.redirect(new URL(targetUrl));
    }
  } catch (e) {
    console.error("Lỗi Middleware:", e);
  }

  // Nếu link chết hoặc không tồn tại thì cho qua (sẽ trả về 404)
  return NextResponse.next();
}
