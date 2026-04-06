'use client';
import React, { useState, useEffect } from 'react';

// 1. Danh sách ngày lễ đầy đủ (Dương lịch)
const HOLIDAYS = {
  '01-01': 'Tết Dương Lịch - Khởi đầu mới rực rỡ!',
  '14-02': 'Lễ Tình Nhân - Nay có ai tặng quà chưa ní?',
  '27-02': 'Ngày Thầy Thuốc Việt Nam',
  '08-03': 'Quốc Tế Phụ Nữ - Nhớ nịnh vợ/người yêu nha.',
  '14-03': 'Valentine Trắng - Trả nợ tình xa.',
  '20-03': 'Ngày Quốc Tế Hạnh Phúc - Cười lên cái coi!',
  '26-03': 'Ngày Thành Lập Đoàn TNCS Hồ Chí Minh',
  '01-04': 'Cá Tháng Tư - Coi chừng bị lừa nha sếp.',
  '30-04': 'Giải Phóng Miền Nam - Nghỉ lễ thôi!',
  '01-05': 'Quốc Tế Lao Động - Lao động là vinh quang.',
  '07-05': 'Chiến Thắng Điện Biên Phủ',
  '15-05': 'Ngày Thành Lập Đội TNTP Hồ Chí Minh',
  '19-05': 'Ngày Sinh Chủ Tịch Hồ Chí Minh',
  '01-06': 'Quốc Tế Thiếu Nhi - Ai cũng có tâm hồn trẻ thơ.',
  '21-06': 'Ngày Báo Chí Cách Mạng Việt Nam',
  '28-06': 'Ngày Gia Đình Việt Nam',
  '27-07': 'Ngày Thương Binh Liệt Sĩ',
  '19-08': 'Ngày Cách Mạng Tháng Tám',
  '02-09': 'Quốc Khánh Việt Nam - Rợp trời cờ hoa!',
  '01-10': 'Ngày Quốc Tế Người Cao Tuổi',
  '10-10': 'Ngày Giải Phóng Thủ Đô',
  '13-10': 'Ngày Doanh Nhân Việt Nam',
  '20-10': 'Ngày Phụ Nữ Việt Nam - Tôn vinh phái đẹp.',
  '31-10': 'Lễ Hội Halloween - Có kẹo hay bị ghẹo?',
  '09-11': 'Ngày Pháp Luật Việt Nam',
  '19-11': 'Ngày Quốc Tế Nam Giới - Có ai nhớ tới anh em mình không?',
  '20-11': 'Ngày Nhà Giáo Việt Nam - Tri ân thầy cô.',
  '01-12': 'Ngày Thế Giới Phòng Chống AIDS',
  '19-12': 'Ngày Toàn Quốc Kháng Chiến',
  '22-12': 'Ngày Thành Lập Quân Đội NDVN',
  '24-12': 'Đêm Giáng Sinh - Giáng sinh an lành!',
  '25-12': 'Lễ Giáng Sinh',
  '31-12': 'Đêm Giao Thừa - Chuẩn bị quẩy thôi!'
};

// 2. Kho câu nói hài hước cho ngày thường
const FUNNY_QUOTES = [
  "Nay không có lễ gì đâu, đi làm tiếp đi ní.",
  "Ngày bình thường, tim vẫn đập nhưng ví không tăng.",
  "Không lễ lộc gì hết, bớt ảo tưởng đi.",
  "Nay là ngày Quốc tế... những người đẹp trai như bạn.",
  "Chưa tới cuối tuần đâu, đừng có mà mơ.",
  "Ngày này năm xưa không có gì xảy ra, ngày này năm nay cũng vậy.",
  "Hôm nay là một ngày tuyệt vời để... ngủ tiếp.",
  "Đừng nhìn đồng hồ nữa, việc vẫn còn đó thôi.",
  "Nay là ngày gì? Là ngày bạn phải cố gắng hơn hôm qua.",
  "Thông báo: Hôm nay là ngày đẹp trời để tiêu tiền.",
  "Lịch báo: Hôm nay bạn vẫn chưa trúng số."
];

export default function ProfessionalClock() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setMounted(true);
    // Chọn câu nói hài hước dựa trên ngày (để mỗi ngày 1 câu khác nhau nhưng cố định trong ngày đó)
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    setQuote(FUNNY_QUOTES[dayOfYear % FUNNY_QUOTES.length]);

    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  // Tính toán đếm ngược
  const target = new Date(`January 1, ${now.getFullYear() + 1} 00:00:00`).getTime();
  const diff = target - now.getTime();
  
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);

  const dayMonth = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const todayHoliday = HOLIDAYS[dayMonth];

  return (
    <main className="main-wrapper">
      <div className="glass-card">
        {/* Header: Ngày tháng */}
        <div className="header-zone">
          <p className="date-display">
            {now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Center: Đồng hồ lớn */}
        <div className="clock-zone">
          <h1 className="main-clock">
            {now.toLocaleTimeString('vi-VN', { hour12: false })}
          </h1>
        </div>

        {/* Message: Lễ hoặc Câu hài hước */}
        <div className="message-zone">
          <div className={`message-pill ${todayHoliday ? 'holiday' : ''}`}>
            {todayHoliday ? (
              <span className="holiday-text">✨ {todayHoliday} ✨</span>
            ) : (
              <span className="funny-text">💬 {quote}</span>
            )}
          </div>
        </div>

        {/* Footer: Grid đếm ngược */}
        <div className="countdown-zone">
          <p className="countdown-label">HÀNH TRÌNH ĐẾN NĂM {now.getFullYear() + 1}</p>
          <div className="grid-timer">
            <div className="timer-item">
              <span className="v">{d}</span>
              <span className="l">NGÀY</span>
            </div>
            <div className="timer-item">
              <span className="v">{String(h).padStart(2, '0')}</span>
              <span className="l">GIỜ</span>
            </div>
            <div className="timer-item">
              <span className="v">{String(m).padStart(2, '0')}</span>
              <span className="l">PHÚT</span>
            </div>
            <div className="timer-item">
              <span className="v">{String(s).padStart(2, '0')}</span>
              <span className="l">GIÂY</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .main-wrapper {
          height: 100vh; width: 100vw;
          background-color: #0f1115; /* */
          background-image: 
            radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
            radial-gradient(at 50% 0%, hsla(225,39%,30%,0.3) 0, transparent 50%);
          display: flex; justify-content: center; align-items: center;
          color: #fff; font-family: 'Inter', sans-serif; overflow: hidden;
        }

        .glass-card {
          width: 90%; max-width: 800px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 40px;
          padding: 60px 40px;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .date-display {
          color: #6366f1; font-weight: 600; letter-spacing: 2px;
          text-transform: uppercase; font-size: 0.9rem; margin: 0;
        }

        .main-clock {
          font-size: clamp(4rem, 15vw, 10rem);
          font-weight: 900; line-height: 1; margin: 20px 0;
          letter-spacing: -5px; color: #f8fafc;
          filter: drop-shadow(0 0 30px rgba(255,255,255,0.1));
        }

        .message-zone { margin: 30px 0 50px 0; min-height: 60px; display: flex; justify-content: center; }
        
        .message-pill {
          background: rgba(255,255,255,0.05);
          padding: 12px 24px; border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.1);
          max-width: 80%; transition: all 0.3s;
        }

        .message-pill.holiday {
          background: rgba(99, 102, 241, 0.1);
          border-color: rgba(99, 102, 241, 0.3);
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
        }

        .holiday-text { color: #818cf8; font-weight: 700; font-size: 1.2rem; }
        .funny-text { color: #94a3b8; font-style: italic; font-size: 1.1rem; }

        .countdown-label {
          font-size: 0.75rem; color: #475569; font-weight: 800;
          letter-spacing: 4px; margin-bottom: 25px;
        }

        .grid-timer { display: flex; justify-content: center; gap: 40px; }
        
        .timer-item { display: flex; flex-direction: column; align-items: center; }
        
        .v { font-size: 2.5rem; font-weight: 800; color: #cbd5e1; font-variant-numeric: tabular-nums; }
        
        .l { font-size: 0.65rem; color: #64748b; font-weight: 700; margin-top: 8px; letter-spacing: 2px; }

        @media (max-width: 640px) {
          .glass-card { padding: 40px 20px; }
          .grid-timer { gap: 15px; }
          .v { font-size: 1.5rem; }
          .l { font-size: 0.5rem; }
        }
      `}</style>
    </main>
  );
}
