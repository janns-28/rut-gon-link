'use client';
import React, { useState, useEffect } from 'react';

// Danh sách các ngày lễ cố định (Dương lịch)
const HOLIDAYS = {
  '01-01': 'Tết Dương Lịch',
  '14-02': 'Lễ Tình Nhân (Valentine)',
  '08-03': 'Quốc Tế Phụ Nữ',
  '30-04': 'Giải Phóng Miền Nam',
  '01-05': 'Quốc Tế Lao Động',
  '19-05': 'Ngày Sinh Chủ Tịch Hồ Chí Minh',
  '01-06': 'Quốc Tế Thiếu Nhi',
  '02-09': 'Quốc Khánh Việt Nam',
  '20-10': 'Ngày Phụ Nữ Việt Nam',
  '20-11': 'Ngày Nhà Giáo Việt Nam',
  '22-12': 'Ngày Thành Lập Quân Đội NDVN',
  '24-12': 'Lễ Giáng Sinh (Christmas)',
  '25-12': 'Lễ Giáng Sinh (Christmas)',
  '31-12': 'Đêm Giao Thừa'
};

export default function ClockAndCountdown() {
  const [isReady, setIsReady] = useState(false);
  const [now, setNow] = useState(new Date());
  const [holiday, setHoliday] = useState('');

  useEffect(() => {
    setIsReady(true);
    const timer = setInterval(() => {
      const currentTime = new Date();
      setNow(currentTime);
      
      // Kiểm tra ngày lễ
      const dayMonth = `${String(currentTime.getDate()).padStart(2, '0')}-${String(currentTime.getMonth() + 1).padStart(2, '0')}`;
      setHoliday(HOLIDAYS[dayMonth] || '');
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Tính toán đếm ngược đến năm mới
  const currentYear = now.getFullYear();
  const nextYear = currentYear + 1;
  const targetDate = new Date(`January 1, ${nextYear} 00:00:00`).getTime();
  const distance = targetDate - now.getTime();

  const timeLeft = {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000)
  };

  // Nếu chưa sẵn sàng (đang render ở server) thì hiện màn hình trống đen để không bị nhảy
  if (!isReady) return <div style={{ backgroundColor: '#0f1115', minHeight: '100vh' }}></div>;

  return (
    <div className="wrapper">
      <div className="container">
        {/* Phần 1: Ngày tháng năm & Giờ hiện tại */}
        <div className="current-info">
          <p className="date-str">
            {now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
          <h1 className="clock">
            {now.toLocaleTimeString('vi-VN', { hour12: false })}
          </h1>
        </div>

        {/* Phần 2: Thông báo ngày lễ (Nếu có) */}
        <div className={`holiday-box ${holiday ? 'active' : ''}`}>
          {holiday ? `✨ Hôm nay là: ${holiday} ✨` : 'Chúc bạn một ngày tốt lành'}
        </div>

        <div className="divider"></div>

        {/* Phần 3: Đếm ngược cuối năm */}
        <div className="countdown-section">
          <p className="countdown-title">ĐẾM NGƯỢC ĐẾN NĂM {nextYear}</p>
          <div className="timer-grid">
            <div className="unit">
              <span className="val">{timeLeft.days}</span>
              <span className="lab">NGÀY</span>
            </div>
            <div className="sep">:</div>
            <div className="unit">
              <span className="val">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="lab">GIỜ</span>
            </div>
            <div className="sep">:</div>
            <div className="unit">
              <span className="val">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="lab">PHÚT</span>
            </div>
            <div className="sep">:</div>
            <div className="unit">
              <span className="val">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="lab">GIÂY</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .wrapper {
          height: 100vh; width: 100vw;
          display: flex; justify-content: center; align-items: center;
          background: #0f1115; /* Khớp với globals.css */
          color: #fff;
          font-family: 'Inter', sans-serif;
        }
        .container { text-align: center; animation: fadeIn 1s ease-in-out; }
        
        .date-str { color: #818cf8; letter-spacing: 2px; font-size: 1.1rem; text-transform: uppercase; margin-bottom: 10px; }
        .clock { font-size: clamp(4rem, 10vw, 8rem); margin: 0; font-weight: 900; letter-spacing: -2px; color: #f8fafc; }
        
        .holiday-box { 
          margin: 30px 0; font-size: 1.4rem; font-weight: 500; color: #94a3b8; 
          transition: all 0.5s;
        }
        .holiday-box.active { color: #fbbf24; text-shadow: 0 0 20px rgba(251, 191, 36, 0.4); font-weight: 700; }

        .divider { height: 1px; width: 100px; background: #334155; margin: 40px auto; }

        .countdown-title { font-size: 0.8rem; letter-spacing: 5px; color: #64748b; margin-bottom: 20px; }
        .timer-grid { display: flex; align-items: center; justify-content: center; gap: 20px; }
        .unit { display: flex; flex-direction: column; min-width: 70px; }
        .val { font-size: 2.5rem; font-weight: 700; color: #cbd5e1; }
        .lab { font-size: 0.7rem; color: #475569; margin-top: 5px; font-weight: 800; }
        .sep { font-size: 2rem; color: #1e293b; padding-bottom: 25px; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        @media (max-width: 600px) {
          .timer-grid { gap: 10px; }
          .unit { min-width: 50px; }
          .val { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  );
}
