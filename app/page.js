'use client';

import Link from 'next/link';

export default function Welcome() {
  return (
    <div className="wrapper">
      {/* Hiệu ứng ánh sáng nền (Glow) */}
      <div className="glow-bg"></div>
      
      <div className="content">
        <h1 className="title">Welcome.</h1>
        
        <div className="action-wrapper">
          <Link href="/dashboard" className="enter-btn">
            Enter System
          </Link>
        </div>
      </div>

      <style jsx global>{`
        /* Reset */
        :root {
          --bg: #000000;
          --text: #ffffff;
        }

        body {
          margin: 0;
          background-color: var(--bg);
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          color: var(--text);
          overflow: hidden; /* Chặn cuộn trang */
        }

        .wrapper {
          position: relative;
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Điểm sáng mờ phía sau chữ để tạo chiều sâu */
        .glow-bg {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0) 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 0;
        }

        .content {
          z-index: 10;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        /* Chữ Welcome to đùng, siêu đậm */
        .title {
          font-size: 6rem; /* Cực to */
          font-weight: 800;
          margin: 0;
          letter-spacing: -4px; /* Các chữ dính sát nhau cho ngầu */
          background: linear-gradient(to bottom, #fff, #666);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: fadeIn 1.5s ease-out;
        }

        .action-wrapper {
          margin-top: 40px;
          opacity: 0;
          animation: slideUp 1s ease-out 0.8s forwards; /* Xuất hiện trễ hơn chữ Welcome */
        }

        /* Nút bấm đơn giản nhất có thể */
        .enter-btn {
          color: #888;
          text-decoration: none;
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          padding: 10px 20px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .enter-btn:hover {
          color: #fff;
          border-color: #fff;
          background: rgba(255,255,255,0.05);
          box-shadow: 0 0 20px rgba(255,255,255,0.2);
        }

        /* Animation khi load trang */
        @keyframes fadeIn {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .title {
            font-size: 3.5rem;
            letter-spacing: -2px;
          }
        }
      `}</style>
    </div>
  );
}
