// app/page.js
'use client';

import Link from 'next/link';

export default function Welcome() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh', /* Chiếm trọn màn hình */
      width: '100vw',
      background: '#000000',
      position: 'relative'
    }}>
      
      {/* Hiệu ứng nền mờ (Glow) */}
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0) 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }}></div>

      {/* Nội dung chính */}
      <div style={{ zIndex: 10, textAlign: 'center' }}>
        <h1 style={{
          fontSize: '4rem', /* Chỉnh nhỏ lại xíu cho mobile đỡ vỡ */
          fontWeight: '800',
          margin: '0 0 20px 0',
          color: 'white',
          letterSpacing: '-2px',
          fontFamily: 'sans-serif'
        }}>
          Welcome.
        </h1>

        <Link href="/dashboard" style={{
          display: 'inline-block',
          color: '#cccccc',
          textDecoration: 'none',
          border: '1px solid #333',
          padding: '12px 30px',
          borderRadius: '5px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          fontSize: '0.9rem',
          transition: '0.3s',
          backgroundColor: 'rgba(255,255,255,0.05)'
        }}>
          ENTER SYSTEM
        </Link>
      </div>
    </div>
  );
}
