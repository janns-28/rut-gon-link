'use client';
import React, { useEffect, useRef } from 'react';

export default function Tet2026Fix() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

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
        this.x = x; this.y = y; this.color = color;
        this.velocity = { x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 8 };
        this.alpha = 1;
        this.friction = 0.95;
      }
      draw() {
        ctx.save(); ctx.globalAlpha = this.alpha;
        ctx.beginPath(); ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color; ctx.fill(); ctx.restore();
      }
      update() {
        this.velocity.x *= this.friction; this.velocity.y *= this.friction;
        this.x += this.velocity.x; this.y += this.velocity.y;
        this.alpha -= 0.012;
      }
    }

    const animate = () => {
      requestAnimationFrame(animate);
      ctx.fillStyle = 'rgba(165, 29, 29, 0.2)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        if (p.alpha > 0) { p.update(); p.draw(); }
        else { particles.splice(i, 1); }
      });
      if (Math.random() < 0.05) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.6;
        const color = `hsl(${Math.random() * 40 + 40}, 100%, 65%)`;
        for (let i = 0; i < 40; i++) particles.push(new Particle(x, y, color));
      }
    };

    window.addEventListener('resize', resize);
    resize(); animate();
    audioRef.current?.play().catch(() => {});
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div style={{
      height: '100vh', width: '100vw', backgroundColor: '#a51d1d',
      backgroundImage: 'radial-gradient(#800 1px, transparent 1px)',
      backgroundSize: '40px 40px', margin: 0, overflow: 'hidden', position: 'relative',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      fontFamily: '"Playfair Display", serif'
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      <audio ref={audioRef} loop src="https://cdn.pixabay.com/audio/2024/01/15/audio_5b35c02b3c.mp3" />

      {/* Sparkle hiệu ứng góc trên bên trái */}
      <div style={{ position: 'absolute', top: '10%', left: '8%', color: '#f9d479', fontSize: '5rem', opacity: 0.4 }}>✶</div>

      {/* NHÀNH MAI VÀNG VẼ BẰNG SVG (Đảm bảo không bao giờ lỗi hiển thị) */}
      <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '35vw', zIndex: 5, pointerEvents: 'none' }}>
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,200 Q50,150 100,180 T200,140" fill="none" stroke="#5d4037" strokeWidth="4" />
          <circle cx="100" cy="180" r="5" fill="#f9d479" />
          <circle cx="120" cy="170" r="6" fill="#f9d479" />
          <circle cx="150" cy="155" r="5" fill="#f9d479" />
          <circle cx="80" cy="185" r="4" fill="#f9d479" />
        </svg>
      </div>

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', color: '#f9d479' }}>
        
        {/* Chữ "Chúc mừng" bay bướm */}
        <h3 style={{
          fontFamily: '"Dancing Script", cursive', fontSize: 'clamp(3rem, 8vw, 6rem)',
          margin: 0, fontWeight: '400', fontStyle: 'italic', marginBottom: '-15px',
          marginLeft: '-150px'
        }}>Chúc mừng</h3>

        {/* XUÂN BÍNH NGỌ + Ô số 20/26 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
          <h1 style={{ fontSize: 'clamp(3rem, 11vw, 8.5rem)', margin: 0, fontWeight: '900', letterSpacing: '2px' }}>
            XUÂN BÍNH NGỌ
          </h1>
          <div style={{
            border: '2px solid #f9d479', padding: '5px 12px', borderRadius: '6px',
            display: 'flex', flexDirection: 'column', fontSize: '1.6rem', fontWeight: 'bold', lineHeight: '1.1'
          }}>
            <span>20</span>
            <div style={{ height: '2px', background: '#f9d479', margin: '2px 0' }}></div>
            <span>26</span>
          </div>
        </div>

        {/* Divider: HAPPY NEW YEAR */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '35px 0' }}>
          <div style={{ height: '1px', width: '18vw', background: '#f9d479' }}></div>
          <div style={{ margin: '0 20px', fontSize: '1.2rem', letterSpacing: '6px', color: '#fff', fontWeight: 'bold' }}>HAPPY NEW YEAR</div>
          <div style={{ height: '1px', width: '18vw', background: '#f9d479' }}></div>
        </div>

        {/* Lời chúc y hệt ảnh mẫu */}
        <p style={{
          fontSize: 'clamp(1rem, 3.2vw, 1.6rem)', color: '#fff', fontStyle: 'italic',
          maxWidth: '900px', margin: '0 auto', lineHeight: '1.7', opacity: 0.95
        }}>
          Chúc Quý khách cùng gia đình một mùa xuân<br/>
          an khang, thịnh vượng, vạn sự như ý và thành công rực rỡ.
        </p>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Playfair+Display:wght@700;900&display=swap');
        body { margin: 0; background-color: #a51d1d; overflow: hidden; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
