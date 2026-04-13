import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

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
    
    const clickId = searchParams.get('aff_sub1');
    const statusCode = searchParams.get('conversion_status_code');
    const payout = searchParams.get('conversion_publihser_payout');
    const offerId = searchParams.get('offer_id');
    const conversionId = searchParams.get('conversion_id');

    if (!clickId) {
      return NextResponse.json({ error: 'Thiếu param aff_sub1' }, { status: 400 });
    }

    let dbStatus = 'pending';
    if (statusCode === '1') dbStatus = 'approved';
    else if (statusCode === '-1') dbStatus = 'rejected';
    else if (statusCode === '0') dbStatus = 'pending';

    // BỘ LỌC CHỐNG SPAM: KIỂM TRA TRẠNG THÁI HIỆN TẠI CỦA ĐƠN TRONG DB
    const { data: oldData } = await supabase
      .from('click_logs')
      .select('status')
      .eq('id', clickId)
      .single();

    if (oldData && oldData.status === 'approved') {
      // Đơn này đã duyệt và húp tiền cmnr, không báo lại nữa
      return NextResponse.json({ success: true, message: 'Đơn này đã ăn tiền rồi sếp ơi, khỏi báo lại!' });
    }

    // NẾU CHƯA DUYỆT THÌ MỚI GHI SỔ VÀ BÁO CÁO
    const { error } = await supabase
      .from('click_logs')
      .update({ status: dbStatus, payout: payout || 0 })
      .eq('id', clickId);

    if (error) throw error;

    // Chỉ bắn Telegram khi từ Chờ duyệt -> Duyệt thành công
    if (statusCode === '1') {
      const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payout || 0);
      await sendTingTing(`💸 BÙM! HYPERLEAD TRẢ TIỀN!\n💰 Hoa hồng: ${money}\n📌 Chiến dịch: ${offerId}\n🛒 Mã đơn: ${conversionId}\n📍 ID Khách: ${clickId}`);
    }

    return NextResponse.json({ success: true, message: 'Ghi nhận Postback thành công!' });
  } catch (e) {
    console.error("LỖI POSTBACK:", e);
    return NextResponse.json({ error: 'Server toang' }, { status: 500 });
  }
}
