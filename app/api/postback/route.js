import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Mày nhớ cấu hình biến môi trường TELEGRAM_TOKEN nhé
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN; 
// ĐIỀN CHAT ID CỦA MÀY VÀO ĐÂY (Vào Bot @userinfobot trên Tele lấy dãy số id)
const CHAT_ID = '123456789'; 

async function sendTingTing(text) {
  if (!TELEGRAM_TOKEN || !CHAT_ID) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text: text })
  });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // 1. Dịch mã từ HyperLead sang tiếng Việt
    const clickId = searchParams.get('aff_sub1'); // Đứa nào bấm? (ID trong Supabase)
    const statusCode = searchParams.get('conversion_status_code'); // 1: Done, 0: Chờ, -1: Tạch
    const payout = searchParams.get('conversion_publihser_payout'); // Bao nhiêu tiền?
    const offerId = searchParams.get('offer_id'); // Chiến dịch nào?
    const conversionId = searchParams.get('conversion_id'); // Mã đơn

    // Nếu không có clickId thì chịu, đéo biết cộng tiền cho ai
    if (!clickId) {
      return NextResponse.json({ error: 'Thiếu param aff_sub1' }, { status: 400 });
    }

    // 2. Phân loại trạng thái
    let dbStatus = 'pending';
    if (statusCode === '1') dbStatus = 'approved';
    else if (statusCode === '-1') dbStatus = 'rejected';
    else if (statusCode === '0') dbStatus = 'pending';

    // 3. Ghi sổ Nam Tào (Cập nhật Database Supabase)
    const { error } = await supabase
      .from('click_logs')
      .update({ 
        status: dbStatus, 
        commission: payout || 0 
      })
      .eq('id', clickId); // Khớp đúng với ID click ban đầu

    if (error) throw error;

    // 4. Máy đếm tiền nổ thông báo (Chỉ nổ khi Thành công = 1)
    if (statusCode === '1') {
      const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payout || 0);
      await sendTingTing(`💸 BÙM! HYPERLEAD TRẢ TIỀN!\n💰 Hoa hồng: ${money}\n📌 Chiến dịch: ${offerId}\n🛒 Mã đơn: ${conversionId}\n📍 ID Khách: ${clickId}`);
    }

    return NextResponse.json({ success: true, message: 'Ghi nhận Postback HyperLead thành công!' });

  } catch (e) {
    console.error("LỖI POSTBACK:", e);
    return NextResponse.json({ error: 'Server toang' }, { status: 500 });
  }
}
