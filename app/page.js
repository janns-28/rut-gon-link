'use client';
import React, { useEffect, useRef } from 'react';

export default function Tet2026Final() {
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
        this.alpha -= 0.01;
      }
    }

    const animate = () => {
      requestAnimationFrame(animate);
      // Nền đỏ đô chuẩn theo ảnh mẫu
      ctx.fillStyle = 'rgba(144, 20, 20, 0.2)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, i) => {
        if (p.alpha > 0) { p.update(); p.draw(); }
        else { particles.splice(i, 1); }
      });

      if (Math.random() < 0.05) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.5;
        const color = `hsl(${Math.random() * 50 + 40}, 100%, 60%)`;
        for (let i = 0; i < 40; i++) particles.push(new Particle(x, y, color));
      }
    };

    window.addEventListener('resize', resize);
    resize(); animate();
    // Tự động phát nhạc (nếu trình duyệt cho phép)
    audioRef.current?.play().catch(() => {});
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div style={{
      height: '100vh', width: '100vw', backgroundColor: '#901414',
      // Họa tiết chìm hexagonal nhẹ như trong ảnh mẫu
      backgroundImage: 'radial-gradient(#800 1px, transparent 1px)',
      backgroundSize: '40px 40px',
      margin: 0, overflow: 'hidden', position: 'relative',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      fontFamily: '"Playfair Display", serif'
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      <audio ref={audioRef} loop src="https://cdn.pixabay.com/audio/2024/01/15/audio_5b35c02b3c.mp3" />

      {/* Biểu tượng tia sáng Top-Left */}
      <div style={{ position: 'absolute', top: '10%', left: '10%', color: '#f5d682', fontSize: '4rem', opacity: 0.5 }}>❂</div>

      {/* NHÀNH MAI VÀNG (Góc dưới bên trái - Đúng như ảnh) */}
      <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '45vw', zIndex: 5 }}>
        <img src="https://i.imgur.com/3Z8VvP3.png" alt="nhành mai" style={{ width: '100%', filter: 'drop-shadow(5px 5px 15px rgba(0,0,0,0.5))' }} />
      </div>

      {/* KHUNG NỘI DUNG CHÍNH */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', color: '#f5d682' }}>
        
        {/* Chữ Chúc mừng bay bướm */}
        <div style={{
          fontFamily: '"Dancing Script", cursive', fontSize: 'clamp(3.5rem, 8vw, 6.5rem)',
          marginBottom: '-20px', marginLeft: '-15vw', fontStyle: 'italic'
        }}>
          Chúc mừng
        </div>

        {/* Cụm XUÂN BÍNH NGỌ + Ô số 20/26 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
          <h1 style={{
            fontSize: 'clamp(3.5rem, 10vw, 8rem)', fontWeight: '900',
            margin: 0, letterSpacing: '2px', textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            XUÂN BÍNH NGỌ
          </h1>
          
          {/* Ô số 20/26 đặc trưng */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            backgroundColor: '#c02020', border: '1px solid #f5d682',
            padding: '5px 15px', borderRadius: '4px', fontSize: '1.8rem', fontWeight: 'bold'
          }}>
            <span>20</span>
            <div style={{ width: '100%', height: '1.5px', background: '#f5d682', margin: '3px 0' }}></div>
            <span>26</span>
          </div>
        </div>

        {/* Thanh gạch HAPPY NEW YEAR */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '30px 0' }}>
          <div style={{ height: '1.5px', width: '20vw', background: '#f5d682' }}></div>
          <span style={{ margin: '0 20px', letterSpacing: '5px', fontSize: '1.2rem', fontWeight: 'bold' }}>HAPPY NEW YEAR</span>
          <div style={{ height: '1.5px', width: '20vw', background: '#f5d682' }}></div>
        </div>

        {/* Lời chúc bên dưới */}
        <p style={{
          fontSize: 'clamp(1rem, 3vw, 1.6rem)', color: '#fff',
          maxWidth: '850px', lineHeight: '1.6', margin: '0 auto',
          fontStyle: 'italic', opacity: 0.9
        }}>
          Chúc Quý khách cùng gia đình một mùa xuân<br/>
          an khang, thịnh vượng, vạn sự như ý và thành công rực rỡ.
        </p>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Playfair+Display:wght@700;900&display=swap');
        body { margin: 0; background-color: #901414; overflow: hidden; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
