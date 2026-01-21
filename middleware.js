import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { createClient } from '@supabase/supabase-js'

// Setup Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // --- DÒNG QUAN TRỌNG NHẤT ---
  // Nếu là yêu cầu đến API hoặc hệ thống thì cho qua luôn, không kiểm tra link rút gọn
  if (
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') || 
    pathname === '/favicon.ico' || 
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  const slug = pathname.slice(1);

  try {
    // 1. KIỂM TRA REDIS (CACHE)
    const cachedUrl = await kv.get(slug);
    if (cachedUrl) {
      return NextResponse.redirect(new URL(cachedUrl));
    }

    // 2. KIỂM TRA SUPABASE
    const { data } = await supabase
      .from('links')
      .select('original_url')
      .eq('slug', slug)
      .single();

    if (data && data.original_url) {
      // 3. LƯU LẠI VÀO REDIS
      await kv.set(slug, data.original_url, { ex: 3600 });
      return NextResponse.redirect(new URL(data.original_url));
    }
  } catch (error) {
    console.error('Middleware error:', error);
  }

  return NextResponse.next();
}
