import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { kv } from '@vercel/kv';

// Vẫn để token ở đây, nhớ khóa Private cái kho Github như tao dặn nhé!
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
    const commandOrUrl = parts[0].toLowerCase(); // Đưa về chữ thường hết cho dễ bắt lệnh

    // ==============================================
    // 1. TÍNH NĂNG BẺ LÁI SMART LINK (CẬP NHẬT LINK)
    // ==============================================
    if (commandOrUrl === '/sua' || commandOrUrl === '/edit') {
      const slugToUpdate = parts[1];
      const newUrl = parts[2];

      if (!slugToUpdate || !newUrl) {
        await sendMessage(chatId, '❌ Lệnh sai. Cú pháp chuẩn: \n/sua <mã_link> <link_mới>\nVD: /sua vay-nhanh https://jeff-app-moi.com');
        return NextResponse.json({ ok: true });
      }

      if (!newUrl.startsWith('http')) {
        await sendMessage(chatId, '❌ Link mới phải có http:// hoặc https://');
        return NextResponse.json({ ok: true });
      }

      // Cập nhật Database
      const { data, error } = await supabase
        .from('links')
        .update({ original_url: newUrl })
        .eq('slug', slugToUpdate)
        .select();

      if (error) {
        await sendMessage(chatId, `⚠️ Lỗi Database khi sửa: ${error.message}`);
      } else if (data.length === 0) {
        await sendMessage(chatId, `⚠️ Không tìm thấy link nào có mã: ${slugToUpdate}`);
      } else {
        // Cập nhật đè lên Vercel KV để khách bấm phát ăn link mới ngay!
        await kv.set(slugToUpdate, newUrl, { ex: 3600 });
        const domain = request.headers.get('host') || 'binhtienti.online';
        await sendMessage(chatId, `✅ Đã bẻ lái thần tốc!\n👉 https://${domain}/${slugToUpdate}\n🔗 Đang trỏ về: ${newUrl}`);
      }
      return NextResponse.json({ ok: true });
    }

    // ==============================================
    // 2. TÍNH NĂNG DỌN RÁC (XÓA LINK)
    // ==============================================
    if (commandOrUrl === '/xoa' || commandOrUrl === '/del') {
      const slugToDelete = parts[1];
      
      if (!slugToDelete) {
        await sendMessage(chatId, '❌ Ông phải nhập mã cần xóa. \nVD: /xoa abc12');
        return NextResponse.json({ ok: true });
      }

      const { error } = await supabase.from('links').delete().eq('slug', slugToDelete);

      if (error) {
        await sendMessage(chatId, `⚠️ Lỗi Database khi xóa: ${error.message}`);
      } else {
        await kv.del(slugToDelete);
        await sendMessage(chatId, `✅ Đã tiêu diệt gọn gàng link: ${slugToDelete}`);
      }
      return NextResponse.json({ ok: true });
    }

    // ==============================================
    // 3. TÍNH NĂNG TẠO LINK MỚI
    // ==============================================
    const url = commandOrUrl;
    // Bỏ qua nếu tin nhắn không phải là link
    if (!url.startsWith('http')) {
      return NextResponse.json({ ok: true }); 
    }

    const slug = parts[1] || Math.random().toString(36).substr(2, 6);

    const { error } = await supabase.from('links').insert([{ slug: slug, original_url: url }]);

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
