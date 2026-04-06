'use client';
import React, { useState, useEffect } from 'react';

// Thành phần con chỉ hiện số, để xử lý việc "không nhảy"
const TimeDisplay = ({ value, label }) => {
  // Chỉ render số khi 'value' không phải là null (tức là đã chạy useEffect trên client)
  const isReady = value !== null;
  
  return (
    <div className="time-box">
      <span className="number">
        {isReady ? String(value).padStart(label === 'NGÀY' ? 1 : 2, '0') : '--'}
      </span>
      <span className="label">{label}</span>
      <style jsx>{`
        .time-box { display: flex; flex-direction: column; align-items: center; min-width: 80px; }
        .number {
          font-size: clamp(2rem, 6vw, 4rem);
          font-weight: 800;
          font-variant-numeric: tabular-nums;
          color: #f8fafc;
          /* Hiệu ứng fadeIn nhẹ khi số hiện ra */
          animation: ${isReady ? 'none' : 'fadeIn 0.5s ease-out'};
        }
        .label { font-size: 0.75rem; color: #64748b; font-weight: 700; letter-spacing: 2px; margin-top: 8px; }
        @media (max-width: 600px) { .time-box { min-width: 60px; } }
      `}</style>
    </div>
  );
};

export default function CountdownPage() {
  // BẮT ĐẦU VỚI NULL (Thay vì 0) -> Để báo cho Server biết là đừng render gì hết
  const [timeLeft, setTimeLeft] = useState({
    days: null, hours: null, minutes: null, seconds: null
  });

  // Mốc thời gian mục tiêu (Tết Dương Lịch 2027)
  const targetDate = new Date('January 1, 2027 00:00:00').getTime();

  useEffect(() => {
    // Hàm tính toán thời gian
    const calculateTime = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) return null;

      return {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      };
    };

    // Chạy lần đầu ngay lập tức trên máy khách (Client)
    const initialTime = calculateTime();
    if (initialTime) setTimeLeft(initialTime);

    // Chạy interval mỗi giây
    const timer = setInterval(() => {
      const currentTime = calculateTime();
      if (currentTime) {
        setTimeLeft(currentTime);
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="countdown-wrapper">
      <div className="content">
        <h2 className="subtitle">HỆ THỐNG ĐANG KHỞI TẠO</h2>
        <h1 className="title">SẮP RA MẮT</h1>
        
        <div className="timer-container">
          <TimeDisplay value={timeLeft.days} label="NGÀY" />
          <div className="separator">:</div>
          <TimeDisplay value={timeLeft.hours} label="GIỜ" />
          <div className="separator">:</div>
          <TimeDisplay value={timeLeft.minutes} label="PHÚT" />
          <div className="separator">:</div>
          <TimeDisplay value={timeLeft.seconds} label="GIÂY" />
        </div>

        <p className="description">
          Dự án chiến dịch Affiliate mới đang được chuẩn bị.<br/>
          Vui lòng quay lại sau khi đồng hồ về số 0.
        </p>
      </div>

      <style jsx global>{`
        body {
          margin: 0; padding: 0;
          background-color: #0f1115; /* Nền đen ngay lập tức */
          color: #fff;
          font-family: 'Inter', system-ui, sans-serif;
          overflow: hidden;
        }
        .countdown-wrapper {
          height: 100vh; width: 100vw;
          display: flex; justify-content: center; align-items: center;
          background: radial-gradient(circle at center, #1e1b4b 0%, #0f1115 100%);
        }
        .content { text-align: center; }
        .subtitle { font-size: 0.9rem; letter-spacing: 4px; color: #818cf8; margin-bottom: 10px; font-weight: 600; }
        .title {
          font-size: clamp(2.5rem, 8vw, 5rem); font-weight: 900; margin: 0 0 40px 0;
          background: linear-gradient(to bottom, #fff 30%, #94a3b8 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .timer-container { display: flex; justify-content: center; align-items: center; gap: 15px; margin-bottom: 40px; }
        .separator { font-size: 2.5rem; font-weight: 300; color: #334155; margin-bottom: 30px; }
        .description { font-size: 1.1rem; color: #94a3b8; line-height: 1.6; font-style: italic; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        @media (max-width: 600px) {
          .timer-container { gap: 8px; }
          .separator { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  );
}
