// app/page.js
'use client';

import Link from 'next/link';

export default function Welcome() {
  return (
    <div className="container">
      <div className="glow"></div>
      
      <div className="content">
        <h1 className="title">Welcome.</h1>
        <Link href="/dashboard" className="btn">
          Enter System
        </Link>
      </div>

      <style jsx>{`
        .container {
          position: relative;
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .glow {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0) 70%);
          transform: translate(-50%, -50%);
          top: 50%;
          left: 50%;
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
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 5rem;
          font-weight: 800;
          margin-bottom: 2rem;
          letter-spacing: -2px;
          background: linear-gradient(to bottom, #fff, #666);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .btn {
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          color: #999;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 2px;
          border: 1px solid rgba(255,255,255,0.2);
          padding: 12px 30px;
          border-radius: 4px;
          transition: all 0.3s;
        }

        .btn:hover {
          color: #fff;
          border-color: #fff;
          background: rgba(255,255,255,0.1);
        }
      `}</style>
    </div>
  );
}
