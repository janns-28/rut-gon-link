'use client';
import React, { useState, useEffect } from 'react';

export default function CountdownPage() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  // Mốc thời gian mục tiêu (Ông có thể sửa ngày này tùy ý)
  const targetDate = new Date('January 1, 2027 00:00:00').getTime();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(timer);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
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
          <div className="time-box">
            <span className="number">{timeLeft.days}</span>
            <span className="label">NGÀY</span>
          </div>
          <div className="separator">:</div>
          <div className="time-box">
            <span className="number">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="label">GIỜ</span>
          </div>
          <div className="separator">:</div>
          <div className="time-box">
            <span className="number">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="label">PHÚT</span>
          </div>
          <div className="separator">:</div>
          <div className="time-box">
            <span className="number">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="label">GIÂY</span>
          </div>
        </div>

        <p className="description">
          Dự án chiến dịch Affiliate mới đang được chuẩn bị.<br/>
          Vui lòng quay lại sau khi đồng hồ về số 0.
        </p>
      </div>

      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          background-color: #0f1115; /* Khớp với globals.css của ông */
          color: #fff;
          font-family: 'Inter', system-ui, sans-serif;
          overflow: hidden;
        }

        .countdown-wrapper {
          height: 100vh;
          width: 100vw;
          display: flex;
          justify-content: center;
          align-items: center;
          background: radial-gradient(circle at center, #1e1b4b 0%, #0f1115 100%);
        }

        .content {
          text-align: center;
          animation: fadeIn 1.5s ease-out;
        }

        .subtitle {
          font-size: 0.9rem;
          letter-spacing: 4px;
          color: #818cf8;
          margin-bottom: 10px;
          font-weight: 600;
        }

        .title {
          font-size: clamp(2.5rem, 8vw, 5rem);
          font-weight: 900;
          margin: 0 0 40px 0;
          background: linear-gradient(to bottom, #fff 30%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .timer-container {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 15px;
          margin-bottom: 40px;
        }

        .time-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 80px;
        }

        .number {
          font-size: clamp(2rem, 6vw, 4rem);
          font-weight: 800;
          font-variant-numeric: tabular-nums;
          color: #f8fafc;
        }

        .label {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 700;
          letter-spacing: 2px;
          margin-top: 8px;
        }

        .separator {
          font-size: 2.5rem;
          font-weight: 300;
          color: #334155;
          margin-bottom: 30px;
        }

        .description {
          font-size: 1.1rem;
          color: #94a3b8;
          line-height: 1.6;
          font-style: italic;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 600px) {
          .timer-container { gap: 8px; }
          .time-box { min-width: 60px; }
          .separator { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  );
}
