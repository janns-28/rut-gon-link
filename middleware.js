import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Tập hợp Bot rác cần chặn
const BOT_AGENTS = [
  'bot', 'spider', 'crawler', 'facebookexternalhit', 'slurp',
  'duckduckbot', 'tiktok', 'googlebot', 'bingbot', 'yandexbot', 'telegrambot'
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // ==========================================
  // 1. BẢO VỆ TRANG ADMIN (KHÔNG CÓ CHÌA KHÓA LÀ ĐÁ VĂNG)
  // ==========================================
  if (pathname.startsWith('/admin')) {
    const adminKey = request.cookies.get('admin_key')?.value;
    const serverKey = process.env.ADMIN_SECRET_KEY;

    // Nếu trên Vercel chưa cài pass, hoặc khách không có vé -> Đuổi ra /login
    if (!serverKey || adminKey !== serverKey) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // ==========================================
  // 2. BỎ QUA CÁC TRANG KHÔNG CẦN CHUYỂN HƯỚNG
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
  // 3. XỬ LÝ KHÁCH VÀ GẮN ĐỊNH VỊ HYPERLEAD
  // ==========================================
  const slug = pathname.slice(1);
  let targetUrl = null;

  try {
    // Tìm link trong cache
    targetUrl = await kv.get(slug);

    // Không có thì móc trong Supabase
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
      const originalReferrer = request.headers.get('referer') || 'Direct (Trực tiếp)';

      // Kiểm tra Bot
      const isBot = BOT_AGENTS.some(bot => userAgent.toLowerCase().includes(bot));
      if (isBot) {
        return NextResponse.rewrite(new URL('/', request.url));
      }

      // Lưu lại nguồn (s=tiktok...)
      const source = request.nextUrl.searchParams.get('s') || request.nextUrl.searchParams.get('utm_source');
      const finalReferrer = source ? `[Nguồn: ${source}] ${originalReferrer}` : originalReferrer;

      // ==========================================
      // KHÚC ĂN TIỀN: GHI LOG & GẮN aff_sub1
      // ==========================================
      const { data: logData } = await supabase
        .from('click_logs')
        .insert([{ 
          slug: slug, 
          referrer: finalReferrer, 
          user_agent: userAgent, 
          ip_address: ip 
        }])
        .select('id')
        .single();

      const finalUrl = new URL(targetUrl);
      
      // Có ID là nhét ngay vào đuôi link
      if (logData && logData.id) {
        finalUrl.searchParams.set('aff_sub1', logData.id);
      }

      // Đá văng khách đi vay tiền
      return NextResponse.redirect(finalUrl);
    }
  } catch (e) {
    console.error("Lỗi Middleware:", e);
  }

  return NextResponse.next();
}
