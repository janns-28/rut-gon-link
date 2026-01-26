import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

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
    const text = message.text.trim();
    const parts = text.split(/\s+/);
    const url = parts[0];
    const slug = parts[1] || Math.random().toString(36).substr(2, 6);

    if (!url.startsWith('http')) {
      await sendMessage(chatId, '❌ Link phải có http:// hoặc https://');
      return NextResponse.json({ ok: true });
    }

    // GHI VÀO SUPABASE - Đảm bảo tên cột khớp hoàn toàn với hình image_d55c54.png
    const { error } = await supabase
      .from('links')
      .insert([{ 
        slug: slug, 
        original_url: url 
      }]);

    if (error) {
      // Nếu có lỗi, Bot sẽ nhắn tin báo lỗi cụ thể để mình biết đường sửa
      await sendMessage(chatId, `⚠️ Lỗi Database: ${error.message}`);
    } else {
      const domain = request.headers.get('host') || 'binhtienti.online';
      await sendMessage(chatId, `✅ Đã xong!\n👉 https://${domain}/${slug}`);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("LỖI TELEGRAM BOT:", e); // Thêm dòng này để in lỗi ra xem
    return NextResponse.json({ ok: true });
  }
}
