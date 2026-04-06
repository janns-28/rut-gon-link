'use client';
import React, { useState, useEffect } from 'react';

// 1. Danh sách ngày lễ đầy đủ (Dương lịch) - Giữ nguyên
const HOLIDAYS = {
  '01-01': 'Tết Dương Lịch - Khởi đầu rực rỡ!',
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

// 2. Kho câu nói hài hước - Giữ nguyên
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

// Thành phần con xử lý việc hiện số và FOUC
const SafeNumber = ({ value, type = 'clock' }) => {
  const isClock = type === 'clock';
  const isLabel = label => label === 'NGÀY';
  
  return (
    <span className={`number ${isClock ? 'big' : 'small'} ${type}`}>
      {String(value).padStart(type === 'NGÀY' ? 1 : 2, '0')}
      <style jsx>{`
        .number {
          /* DÙNG FONT POPSINS LÀM FONT SỐ CHO MỀM MẠI */
          font-family: 'Poppins', 'Inter', sans-serif;
          font-variant-numeric: tabular-nums;
          font-weight: 800;
          color: #f8fafc;
        }
        .number.big { font-size: clamp(4rem, 15vw, 12rem); letter-spacing: -6px; animation: fadeInClock 0.8s ease-out; filter: drop-shadow(0 0 20px rgba(255,255,255,0.08)); }
        .number.small { font-size: clamp(2rem, 6vw, 5rem); color: #cbd5e1; }
        .number.countdown { font-weight: 700; color: #cbd5e1; }
        
        @keyframes fadeInClock { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </span>
  );
};

export default function SofterProfessionalClock() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());
  const [quote, setQuote] = useState('');

  useEffect(() => {
    // IMPORT FONT POPSINS TRỰC TIẾP TRONG COMPONENT
    const poppinsLink = document.createElement('link');
    poppinsLink.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800;900&display=swap';
    poppinsLink.rel = 'stylesheet';
    document.head.appendChild(poppinsLink);

    setMounted(true);
    // Chọn câu hài hước
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    setQuote(FUNNY_QUOTES[dayOfYear % FUNNY_QUOTES.length]);

    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return <div style={{ backgroundColor: '#0f1115', minHeight: '100vh' }}></div>;

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
      <div className="ambient-content">
        
        {/* Phần 1: Ngày tháng năm */}
        <p className="date-str">
          {now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
        
        {/* Phần 2: Đồng hồ GIỜ PHÚT GIÂY (Mềm Mại) */}
        <div className="main-clock-display">
          <SafeNumber value={now.getHours()} type="clock" />
          <span className="separator-pulse">:</span>
          <SafeNumber value={now.getMinutes()} type="clock" />
          <span className="separator-pulse">:</span>
          <SafeNumber value={now.getSeconds()} type="clock" />
        </div>

        {/* Phần 3: Lễ hoặc Câu Hài Hước */}
        <div className="info-area">
          {todayHoliday ? (
            <div className="holiday-display active">✨ {todayHoliday} ✨</div>
          ) : (
            <div className="funny-display">💬 {quote}</div>
          )}
        </div>

        <div className="ambient-divider"></div>

        {/* Phần 4: Đếm ngược cuối năm (Mềm Mại) */}
        <div className="countdown-area">
          <p className="countdown-label">ĐẾM NGƯỢC ĐẾN NĂM MỚI {now.getFullYear() + 1}</p>
          <div className="timer-grid">
            <div className="unit"><SafeNumber value={d} type="countdown" /><span className="lab">NGÀY</span></div>
            <div className="sep">:</div>
            <div className="unit"><SafeNumber value={h} type="countdown" /><span className="lab">GIỜ</span></div>
            <div className="sep">:</div>
            <div className="unit"><SafeNumber value={m} type="countdown" /><span className="lab">PHÚT</span></div>
            <div className="sep">:</div>
            <div className="unit"><SafeNumber value={s} type="countdown" /><span className="lab">GIÂY</span></div>
          </div>
        </div>

      </div>

      <style jsx global>{`
        body {
          margin: 0; padding: 0;
          background-color: #0f1115; /* */
          color: #fff;
          font-family: 'Inter', system-ui, sans-serif;
          overflow: hidden;
        }

        .main-wrapper {
          height: 100vh; width: 100vw;
          display: flex; justify-content: center; align-items: center;
          background: #0f1115;
          background: radial-gradient(circle at center, #1e1b4b 0%, #0f1115 100%);
        }

        .ambient-content { text-align: center; }

        .date-str {
          color: #818cf8; letter-spacing: 4px; font-weight: 700;
          text-transform: uppercase; font-size: clamp(0.9rem, 1.5vw, 1.2rem); margin: 0 0 20px 0;
        }

        .main-clock-display {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          margin: 20px 0;
        }

        .separator-pulse {
          font-size: clamp(3rem, 10vw, 8rem); font-weight: 300; color: #475569;
          margin-bottom: 30px; animation: pulse 1.5s infinite;
        }

        .info-area { margin: 30px 0 60px 0; min-height: 40px; display: flex; justify-content: center; }
        .holiday-display { font-size: 1.5rem; font-weight: 700; color: #fbbf24; text-shadow: 0 0 20px rgba(251, 191, 36, 0.4); animation: fadeIn 1s; }
        .funny-display { font-size: 1.3rem; font-weight: 500; color: #94a3b8; font-style: italic; animation: fadeIn 1s; }

        .ambient-divider { height: 1px; width: 120px; background: #334155; margin: 40px auto; }

        .countdown-area { animation: fadeInCountdown 1s ease-out 0.5s; animation-fill-mode: both; }
        .countdown-label { font-size: clamp(0.7rem, 1vw, 0.9rem); color: #64748b; font-weight: 800; letter-spacing: 5px; margin-bottom: 25px; }
        
        .timer-grid { display: flex; align-items: center; justify-content: center; gap: 30px; }
        .unit { display: flex; flex-direction: column; min-width: 80px; }
        .lab { font-size: clamp(0.6rem, 0.8vw, 0.8rem); color: #64748b; font-weight: 800; margin-top: 8px; letter-spacing: 2px; }
        .sep { font-size: 2rem; font-weight: 300; color: #1e293b; padding-bottom: 30px; }

        @keyframes pulse { 0% { opacity: 0.3; } 50% { opacity: 1; } 100% { opacity: 0.3; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInCountdown { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 600px) {
          .timer-grid { gap: 10px; }
          .unit { min-width: 50px; }
          .sep { font-size: 1.2rem; }
        }
      `}</style>
    </div>
  );
}
