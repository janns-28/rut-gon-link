import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Nhờ file jsconfig.json mà dòng này sẽ chạy ngon

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: text })
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const message = body.message || body.edited_message;
    
    if (!message || !message.text) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const text = message.text.trim(); // Ví dụ: "https://google.com ggl"
    
    // Tách link và slug
    const parts = text.split(/\s+/);
    const url = parts[0];
    // Nếu không nhập slug thì random 6 ký tự
    const slug = parts[1] || Math.random().toString(36).substr(2, 6);

    // Kiểm tra link hợp lệ
    if (!url.startsWith('http')) {
      await sendMessage(chatId, '❌ Link đểu rồi! Phải có http:// hoặc https://');
      return NextResponse.json({ ok: true });
    }

    // GHI VÀO SUPABASE
    const { error } = await supabase
      .from('links')
      .insert([{ slug: slug, original_url: url }]);

    if (error) {
      await sendMessage(chatId, `⚠️ Lỗi: Slug "${slug}" đã có người dùng. Đổi cái khác đi!`);
    } else {
      const domain = request.headers.get('host');
      await sendMessage(chatId, `✅ Ngon lành!\n👉 https://${domain}/${slug}`);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: true });
  }
}
