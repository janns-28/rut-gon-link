// app/page.js
'use client';

import Link from 'next/link';

export default function Welcome() {
  return (
    // Tao dùng thẻ main bọc nội dung, style trực tiếp
    <main style={{
      textAlign: 'center',
      position: 'relative',
      zIndex: 1
    }}>
      {/* Hiệu ứng đốm sáng nền (Vẽ bằng div thuần) */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none',
        zIndex: -1
      }}></div>

      {/* Tiêu đề */}
      <h1 style={{
        fontSize: '5rem',
        fontWeight: '800',
        margin: '0 0 40px 0',
        letterSpacing: '-3px',
        color: 'white', // Fallback nếu gradient lỗi
        background: '-webkit-linear-gradient(#fff, #666)', // Gradient cho webkit
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        Welcome.
      </h1>

      {/* Nút bấm */}
      <Link href="/dashboard" style={{
        display: 'inline-block',
        color: '#aaaaaa',
        textDecoration: 'none',
        border: '1px solid rgba(255,255,255,0.2)',
        padding: '15px 40px',
        borderRadius: '50px',
        textTransform: 'uppercase',
        letterSpacing: '3px',
        fontSize: '0.9rem',
        transition: '0.2s',
        backgroundColor: 'transparent'
      }} 
      // Thêm chút hiệu ứng hover bằng JS inline đơn giản
      onMouseOver={(e) => {
        e.currentTarget.style.color = 'white';
        e.currentTarget.style.borderColor = 'white';
        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.color = '#aaaaaa';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
      >
        Enter System
      </Link>
    </main>
  );
}
