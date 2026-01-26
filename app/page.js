import Link from 'next/link';

export default function Home() {
  return (
    <div className="container">
      <div className="card">
        <h1 className="title">🚀 Link Rút Gọn Của Tao</h1>
        <p className="subtitle">Hệ thống điều hướng siêu tốc</p>
        
        <div className="status-box">
          <span className="dot"></span>
          <span>System Operational</span>
        </div>

        <div className="footer">
          Powered by Vercel & Google Sheet
        </div>
      </div>

      {/* Phần CSS làm đẹp nằm ngay ở dưới đây */}
      <style jsx global>{`
        /* Reset mặc định */
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          overflow: hidden;
        }

        /* Nền động 7 màu */
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

        /* Cái thẻ Card hiệu ứng kính mờ */
        .card {
          background: rgba(255, 255, 255, 0.25);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          padding: 40px;
          text-align: center;
          color: white;
          max-width: 400px;
          width: 90%;
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0% { transform: translatey(0px); }
          50% { transform: translatey(-20px); }
          100% { transform: translatey(0px); }
        }

        .title {
          margin: 0;
          font-size: 2rem;
          font-weight: 700;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        .subtitle {
          margin-top: 10px;
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .status-box {
          margin-top: 30px;
          display: inline-flex;
          align-items: center;
          background: rgba(0,0,0,0.2);
          padding: 8px 15px;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .dot {
          height: 10px;
          width: 10px;
          background-color: #00ff88;
          border-radius: 50%;
          display: inline-block;
          margin-right: 8px;
          box-shadow: 0 0 10px #00ff88;
        }

        .footer {
          margin-top: 40px;
          font-size: 0.8rem;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}
