import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Hàm gửi tin nhắn
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
    
    // Check tin nhắn
    const message = body.message || body.edited_message;
    if (!message || !message.text) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const text = message.text.trim();

    // Logic tách chuỗi: "https://link.com slug"
    const parts = text.split(/\s+/);
    const url = parts[0];
    // Nếu không nhập slug thì random 5 ký tự
    const slug = parts[1] || Math.random().toString(36).substr(2, 5);

    // Validate link
    if (!url.startsWith('http')) {
      await sendMessage(chatId, '❌ Link phải có http:// hoặc https:// đại ca ơi!');
      return NextResponse.json({ ok: true });
    }

    // GHI VÀO SUPABASE
    const { error } = await supabase
      .from('links')
      .insert([{ slug: slug, original_url: url }]);

    if (error) {
        // Lỗi thường gặp: Trùng slug
        await sendMessage(chatId, `⚠️ Lỗi: Cái đuôi "${slug}" có người xài rồi. Chọn cái khác đi.`);
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
