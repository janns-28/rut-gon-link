import { NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // ƯU TIÊN SỐ 1: BỎ QUA TẤT CẢ API VÀ HỆ THỐNG
  if (
    pathname.includes('/api/') || 
    pathname.startsWith('/_next') || 
    pathname === '/' || 
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const slug = pathname.slice(1);

  try {
    const cachedUrl = await kv.get(slug);
    if (cachedUrl) return NextResponse.redirect(new URL(cachedUrl));

    const { data } = await supabase
      .from('links')
      .select('original_url')
      .eq('slug', slug)
      .single();

    if (data?.original_url) {
      await kv.set(slug, data.original_url, { ex: 3600 });
      return NextResponse.redirect(new URL(data.original_url));
    }
  } catch (e) {
    console.error(e);
  }

  return NextResponse.next();
}
