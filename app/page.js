'use client';

import Link from 'next/link';

export default function Welcome() {
  return (
    <div className="container">
      <div className="card">
        {/* Phần Title chào mừng */}
        <h1 className="title">✨ Welcome Aboard!</h1>
        <p className="subtitle">
          Chào mừng bạn đã đến với không gian của tao. <br/>
          Sẵn sàng khám phá chưa?
        </p>
        
        {/* Nút bấm chuyển hướng (CTA) */}
        <div className="action-area">
          <Link href="/dashboard" className="btn-start">
             Bắt đầu ngay 🚀
          </Link>
        </div>

        <div className="footer">
          © 2024 Design by Me
        </div>
      </div>

      <style jsx global>{`
        /* Reset mặc định */
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          overflow: hidden;
        }

        /* Nền động 7 màu giữ nguyên vì đẹp */
        .container {
          height: 100vh;
          width: 100vw;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
          background-size: 400% 400%;
          animation: gradient 15s ease infinite;
        }

        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Thẻ Card hiệu ứng kính mờ */
        .card {
          background: rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          padding: 50px 40px;
          text-align: center;
          color: white;
          max-width: 450px;
          width: 90%;
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0% { transform: translatey(0px); }
          50% { transform: translatey(-15px); }
          100% { transform: translatey(0px); }
        }

        .title {
          margin: 0;
          font-size: 2.5rem;
          font-weight: 800;
          letter-spacing: -1px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        .subtitle {
          margin-top: 15px;
          font-size: 1.1rem;
          line-height: 1.6;
          opacity: 0.9;
          font-weight: 300;
        }

        /* Style cho nút bấm mới */
        .action-area {
          margin-top: 40px;
        }

        .btn-start {
          background: white;
          color: #e73c7e;
          padding: 12px 30px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 700;
          font-size: 1rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          display: inline-block;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .btn-start:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
          background: #fff;
          color: #23a6d5;
        }

        .footer {
          margin-top: 50px;
          font-size: 0.75rem;
          opacity: 0.6;
          letter-spacing: 1px;
        }
      `}</style>
    </div>
  );
}
