import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Tui trỏ thẳng vào một kho JSON chứa các câu nói "khịa" gắt trên mạng
    // (Đây là ví dụ, ông có thể tự tạo một Gist trên Github để quản lý list này)
    const res = await fetch('https://raw.githubusercontent.com/binhtienti/quotes-khiya/main/data.json', {
      next: { revalidate: 0 } // Bắt nó luôn lấy câu mới, không dùng cache cũ
    });

    // Nếu cái link trên có vấn đề (do mạng), tui dự phòng sẵn 10 câu gắt ở đây
    const backupQuotes = [
      "Lương 5 triệu mà tiêu như 50 triệu, đó là một loại năng lượng tích cực.",
      "Thanh xuân như một tách trà, cày xong đống camp hết bà thanh xuân.",
      "Người ta giàu vì biết tiết kiệm, mình nghèo vì biết... hưởng thụ quá sớm.",
      "Đừng nhìn đồng hồ nữa, nợ vẫn còn đó chứ có mất đi đâu.",
      "Thông báo: Hôm nay bạn vẫn chưa giàu, đi làm tiếp đi ní."
    ];

    if (!res.ok) {
      const randomBackup = backupQuotes[Math.floor(Math.random() * backupQuotes.length)];
      return NextResponse.json({ quote: randomBackup });
    }

    const data = await res.json();
    const randomQuote = data[Math.floor(Math.random() * data.length)];
    
    return NextResponse.json({ quote: randomQuote });
  } catch (error) {
    return NextResponse.json({ quote: "Mạng lag quá, không khịa nổi. Cày tiếp đi ní!" });
  }
}
