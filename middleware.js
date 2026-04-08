import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Danh sách Bot cần đuổi cổ
const BOT_AGENTS = [
  'bot', 'spider', 'crawler', 'facebookexternalhit', 'slurp',
  'duckduckbot', 'tiktok', 'googlebot', 'bingbot', 'yandexbot', 'telegrambot'
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // ==========================================
  // 1. Ổ KHÓA CỦA MÀY: BẢO VỆ TRANG ADMIN
  // ==========================================
  if (pathname.startsWith('/admin')) {
    const adminKey = request.cookies.get('admin_key')?.value;
    // Không có chìa khóa hoặc sai chìa -> Đá văng ra trang Login
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // ==========================================
  // 2. BỎ QUA CÁC TRANG HỆ THỐNG KHÔNG CẦN BẺ LÁI
  // ==========================================
  if (
    pathname.startsWith('/api/') || 
    pathname.startsWith('/_next') || 
    pathname === '/' || 
    pathname === '/login' || // Cho phép vào trang login
    pathname === '/top' || 
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // ==========================================
  // 3. XỬ LÝ KHÁCH BẤM LINK VÀ NHÉT ĐỊNH VỊ HYPERLEAD
  // ==========================================
  const slug = pathname.slice(1);
  let targetUrl = null;

  try {
    // Tìm link đích trong KV (cache) cho nhanh
    targetUrl = await kv.get(slug);

    // Nếu rớt cache thì vào Database móc ra
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

      // Kiểm tra xem có phải thằng Bot đang soi link không
      const isBot = BOT_AGENTS.some(bot => userAgent.toLowerCase().includes(bot));
      if (isBot) {
        // Đuổi mẹ về trang chủ, đéo đếm click
        return NextResponse.rewrite(new URL('/', request.url));
      }

      // Lưu lại nguồn khách (Tiktok, Facebook...)
      const source = request.nextUrl.searchParams.get('s') || request.nextUrl.searchParams.get('utm_source');
      const finalReferrer = source ? `[Nguồn: ${source}] ${originalReferrer}` : originalReferrer;

      // --- KHÚC QUAN TRỌNG: Ghi log và tạo thẻ định vị aff_sub1 ---
      
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
      
      // Nhét ID khách vào đuôi link để HyperLead biết đường trả tiền
      if (logData && logData.id) {
        finalUrl.searchParams.set('aff_sub1', logData.id);
      }

      // Đá văng khách đi vay
      return NextResponse.redirect(finalUrl);
    }
  } catch (e) {
    console.error("Lỗi mẹ nó rồi:", e);
  }

  return NextResponse.next();
}
