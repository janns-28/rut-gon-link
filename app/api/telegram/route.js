import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { kv } from '@vercel/kv'; // Phải import thêm cái này để xóa Cache

// Nhớ bỏ Token vào file .env nhé, để lộ cứng ở đây nguy hiểm lắm
const TELEGRAM_TOKEN = '8299092137:AAE2QHihAeZeJx-yzPBigEsY2y2o2UC8sCI'; 

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
    const commandOrUrl = parts[0];

    // --- TÍNH NĂNG XÓA LINK ---
    if (commandOrUrl === '/xoa' || commandOrUrl === '/del') {
      const slugToDelete = parts[1];
      
      if (!slugToDelete) {
        await sendMessage(chatId, '❌ Ông phải nhập mã cần xóa. \nVD: /xoa abc12');
        return NextResponse.json({ ok: true });
      }

      // Bước 1: Xóa trong Database Supabase
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('slug', slugToDelete);

      if (error) {
        await sendMessage(chatId, `⚠️ Lỗi Database khi xóa: ${error.message}`);
      } else {
        // Bước 2: Ép Vercel KV xóa ngay bộ nhớ đệm, không cho nó sống thêm 1 tiếng
        await kv.del(slugToDelete);
        await sendMessage(chatId, `✅ Đã tiêu diệt gọn gàng link: ${slugToDelete}`);
      }
      return NextResponse.json({ ok: true });
    }
    // --------------------------

    // --- TÍNH NĂNG TẠO LINK (GIỮ NGUYÊN) ---
    const url = commandOrUrl;
    const slug = parts[1] || Math.random().toString(36).substr(2, 6);

    if (!url.startsWith('http')) {
      await sendMessage(chatId, '❌ Link phải có http:// hoặc https://');
      return NextResponse.json({ ok: true });
    }

    const { error } = await supabase
      .from('links')
      .insert([{ 
        slug: slug, 
        original_url: url 
      }]);

    if (error) {
      await sendMessage(chatId, `⚠️ Lỗi Database: ${error.message}`);
    } else {
      const domain = request.headers.get('host') || 'binhtienti.online';
      await sendMessage(chatId, `✅ Đã xong!\n👉 https://${domain}/${slug}`);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("LỖI TELEGRAM BOT:", e);
    return NextResponse.json({ ok: true });
  }
}
