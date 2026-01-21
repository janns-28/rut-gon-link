import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { createClient } from '@supabase/supabase-js'

// Khởi tạo Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const slug = pathname.slice(1);

  // 1. Bỏ qua các file hệ thống
  if (!slug || slug.startsWith('_next') || slug.startsWith('api') || slug === 'favicon.ico' || slug === 'dashboard' || slug === 'login') {
    return NextResponse.next();
  }

  try {
    // 2. CHECK REDIS (CACHE) TRƯỚC
    const cachedUrl = await kv.get(slug);
    
    if (cachedUrl) {
      return NextResponse.redirect(new URL(cachedUrl));
    }

    // 3. NẾU KHÔNG CÓ TRONG CACHE -> HỎI SUPABASE
    const { data, error } = await supabase
      .from('links')
      .select('original_url')
      .eq('slug', slug)
      .single();

    if (data && data.original_url) {
      const targetUrl = data.original_url;

      // 4. LƯU NGƯỢC VÀO REDIS (Cache 1 tiếng)
      await kv.set(slug, targetUrl, { ex: 3600 });

      return NextResponse.redirect(new URL(targetUrl));
    }

  } catch (error) {
    console.error('Lỗi Middleware:', error);
  }

  return NextResponse.next();
}
