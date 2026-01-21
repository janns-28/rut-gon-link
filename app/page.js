'use client';

import Link from 'next/link';

export default function Welcome() {
  return (
    <div className="wrapper">
      {/* Background Grid Effect */}
      <div className="grid-bg"></div>
      
      {/* Main Content */}
      <div className="content">
        <div className="badge">v2.0 Beta</div>
        
        <h1 className="hero-title">
          Link Manager <br />
          <span className="text-gradient">Professional.</span>
        </h1>
        
        <p className="description">
          Hệ thống quản lý liên kết tối giản. Nhanh hơn, mượt hơn và bảo mật hơn.
        </p>

        <div className="cta-group">
          <Link href="/dashboard" className="btn-primary">
            Truy cập hệ thống
          </Link>
          
          <a href="https://github.com" target="_blank" className="btn-secondary">
            Tìm hiểu thêm
          </a>
        </div>
      </div>

      <style jsx global>{`
        /* Reset cơ bản */
        :root {
          --bg: #050505;
          --text-main: #ffffff;
          --text-muted: #888888;
          --primary: #3b82f6;
          --grid: #222;
        }

        body {
          margin: 0;
          background-color: var(--bg);
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: var(--text-main);
        }

        .wrapper {
          position: relative;
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        /* Hiệu ứng lưới (Grid) ở nền - Nhìn rất Tech */
        .grid-bg {
          position: absolute;
          width: 100%;
          height: 100%;
          background-size: 50px 50px;
          background-image:
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
          z-index: 0;
          pointer-events: none;
        }

        .content {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 20px;
          max-width: 800px;
          animation: fadeUp 1s ease-out;
        }

        /* Badge nhỏ trên cùng */
        .badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ccc;
          font-size: 0.8rem;
          font-weight: 500;
          margin-bottom: 24px;
        }

        /* Title to, đẹp, có màu gradient */
        .hero-title {
          font-size: 4rem;
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: -0.04em;
          margin: 0 0 24px 0;
        }

        .text-gradient {
          background: linear-gradient(90deg, #fff, #999);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
        }

        .description {
          font-size: 1.25rem;
          color: var(--text-muted);
          max-width: 500px;
          margin: 0 auto 40px auto;
          line-height: 1.6;
        }

        /* Nút bấm hiện đại */
        .cta-group {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        .btn-primary {
          background: white;
          color: black;
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.2s, opacity 0.2s;
        }

        .btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: transparent;
          color: var(--text-muted);
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 500;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.1);
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          border-color: white;
          color: white;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
