// app/page.js
'use client';

import Link from 'next/link';

export default function Welcome() {
  return (
    <div className="container">
      {/* Glow effect */}
      <div className="glow"></div>
      
      <div className="content">
        <h1 className="title">Welcome.</h1>
        <Link href="/dashboard" className="btn">
          Enter System
        </Link>
      </div>

      <style jsx>{`
        .container {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          width: 100vw;
          position: relative;
        }

        .glow {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0) 70%);
          pointer-events: none;
        }

        .content {
          z-index: 10;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .title {
          font-size: 5rem;
          font-weight: 800;
          margin-bottom: 30px;
          letter-spacing: -3px;
          background: linear-gradient(to bottom, #fff, #666);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .btn {
          color: #999;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.2);
          padding: 12px 30px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 2px;
          transition: all 0.3s;
        }

        .btn:hover {
          color: #fff;
          border-color: #fff;
          background: rgba(255,255,255,0.05);
        }
      `}</style>
    </div>
  );
}
