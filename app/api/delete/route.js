import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { kv } from '@vercel/kv';

export async function POST(request) {
  try {
    const { slug } = await request.json();
    
    if (!slug) return NextResponse.json({ ok: false, error: 'Thiếu mã rút gọn' }, { status: 400 });

    // 1. Phang thẳng vào Supabase xóa dữ liệu
    const { error } = await supabase.from('links').delete().eq('slug', slug);
    if (error) throw error;

    // 2. Xóa luôn bộ nhớ đệm Vercel KV cho nó chết hẳn ngay lập tức
    await kv.del(slug);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Lỗi xóa link:", e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
