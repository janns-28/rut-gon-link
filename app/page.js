'use client';
import React, { useEffect, useRef } from 'react';

export default function LunarNewYear() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = {
          x: (Math.random() - 0.5) * 8,
          y: (Math.random() - 0.5) * 8
        };
        this.alpha = 1;
        this.friction = 0.95;
      }

      draw() {
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      update() {
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01;
      }
    }

    const createFirework = (x, y) => {
      const colors = ['#FFD700', '#FF4500', '#FF0000', '#FFFFFF', '#FF69B4'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < 40; i++) {
        particles.push(new Particle(x, y, color));
      }
    };

    const animate = () => {
      requestAnimationFrame(animate);
      ctx.fillStyle = 'rgba(42, 0, 0, 0.1)'; // Nền đỏ sẫm mờ dần tạo vệt
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        if (p.alpha > 0) {
          p.update();
          p.draw();
        } else {
          particles.splice(i, 1);
        }
      });

      if (Math.random() < 0.05) {
        createFirework(Math.random() * canvas.width, Math.random() * canvas.height * 0.7);
      }
    };

    window.addEventListener('resize', resize);
    resize();
    animate();
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      backgroundColor: '#2a0000',
      margin: 0,
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: '"EB Garamond", serif'
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />

      {/* Nội dung trang trọng */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        color: '#FFD700',
        padding: '60px',
        border: '4px double #FFD700',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: '20px',
        boxShadow: '0 0 50px rgba(139, 0, 0, 0.8)',
        animation: 'zoomIn 1.5s ease-out'
      }}>
        <div style={{ fontSize: '1.2rem', letterSpacing: '8px', opacity: 0.8 }}>CHÚC MỪNG NĂM MỚI</div>
        
        <h1 style={{
          fontSize: '120px',
          margin: '20px 0',
          fontWeight: '900',
          background: 'linear-gradient(180deg, #FFD700 0%, #B8860B 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.5))'
        }}>
          2026
        </h1>

        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '5px' }}>
          BÍNH NGỌ
        </div>

        <div style={{
          margin: '30px auto',
          width: '200px',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #FFD700, transparent)'
        }}></div>

        <p style={{
          fontSize: '1.5rem',
          fontStyle: 'italic',
          color: '#f0f0f0',
          lineHeight: '1.8'
        }}>
          Vạn Sự Như Ý • An Khang Thịnh Vượng<br/>
          Tấn Tài Tấn Lộc • Công Thành Danh Toại
        </p>
      </div>

      {/* Lồng đèn trang trí 2 bên */}
      <div className="lantern" style={{ left: '5%' }}>🧧</div>
      <div className="lantern" style={{ right: '5%' }}>🧧</div>

      <style jsx global>{`
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes swing {
          0% { transform: rotate(-10deg); }
          100% { transform: rotate(10deg); }
        }
        .lantern {
          position: absolute;
          top: 20px;
          font-size: 50px;
          animation: swing 2s ease-in-out infinite alternate;
          transform-origin: top center;
          text-shadow: 0 0 20px red;
        }
        body { margin: 0; background: #000; }
      `}</style>
    </div>
  );
}
