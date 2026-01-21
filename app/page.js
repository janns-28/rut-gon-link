'use client';
import React, { useEffect, useRef } from 'react';

export default function Tet2026Auto() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Tự động phát nhạc (Trình duyệt có thể chặn tiếng cho đến khi có tương tác đầu tiên)
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        console.log("Browser blocked autoplay. Click anywhere to hear sound.");
      });
    }

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
        this.velocity = { x: (Math.random() - 0.5) * 10, y: (Math.random() - 0.5) * 10 };
        this.alpha = 1; this.friction = 0.95; this.gravity = 0.1;
      }
      draw() {
        ctx.save(); ctx.globalAlpha = this.alpha;
        ctx.beginPath(); ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10; ctx.shadowColor = this.color;
        ctx.fill(); ctx.restore();
      }
      update() {
        this.velocity.x *= this.friction; this.velocity.y *= this.friction;
        this.velocity.y += this.gravity;
        this.x += this.velocity.x; this.y += this.velocity.y;
        this.alpha -= 0.01;
      }
    }

    const animate = () => {
      requestAnimationFrame(animate);
      ctx.fillStyle = 'rgba(180, 20, 20, 0.2)'; // Màu đỏ rực rỡ chuẩn Tết
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, i) => {
        if (p.alpha > 0) { p.update(); p.draw(); }
        else { particles.splice(i, 1); }
      });

      if (Math.random() < 0.06) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.7;
        const colors = ['#FFD700', '#FFFFFF', '#FF4500', '#FFFF00'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        for (let i = 0; i < 50; i++) particles.push(new Particle(x, y, color));
      }
    };

    window.addEventListener('resize', resize);
    resize(); animate();
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div style={{
      height: '100vh', width: '100vw', backgroundColor: '#b41414',
      margin: 0, overflow: 'hidden', position: 'relative',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      fontFamily: '"Playfair Display", serif', color: '#f9d479'
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      <audio ref={audioRef} autoPlay loop src="https://cdn.pixabay.com/audio/2024/01/15/audio_5b35c02b3c.mp3" />

      {/* Nhành Mai Vàng uốn lượn đúng như ảnh mẫu */}
      <div style={{ position: 'absolute', bottom: '-30px', left: '-60px', width: '40vw', zIndex: 5, pointerEvents: 'none' }}>
        <img src="https://i.imgur.com/3Z8VvP3.png" alt="mai" style={{ width: '100%', transform: 'rotate(10deg)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', animation: 'fadeIn 2.5s ease-out' }}>
        {/* Chữ "Chúc mừng" kiểu Script */}
        <h3 style={{
          fontFamily: '"Dancing Script", cursive', fontSize: 'clamp(3.5rem, 8vw, 6.5rem)',
          margin: 0, fontWeight: '400', color: '#f9d479'
        }}>Chúc mừng</h3>

        {/* XUÂN BÍNH NGỌ + Box 20/26 chuẩn layout ảnh */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '25px', marginTop: '-15px' }}>
          <h1 style={{ fontSize: 'clamp(3rem, 12vw, 9rem)', margin: 0, fontWeight: '900', letterSpacing: '4px' }}>
            XUÂN BÍNH NGỌ
          </h1>
          <div style={{
            border: '3px solid #f9d479', padding: '8px 12px', borderRadius: '10px',
            display: 'flex', flexDirection: 'column', fontSize: '1.8rem', fontWeight: '900', lineHeight: '1.1'
          }}>
            <span>20</span>
            <div style={{ height: '3px', background: '#f9d479', margin: '3px 0' }}></div>
            <span>26</span>
          </div>
        </div>

        {/* Divider Line: HAPPY NEW YEAR */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '40px 0' }}>
          <div style={{ height: '1.5px', width: '15vw', background: '#f9d479' }}></div>
          <div style={{ margin: '0 25px', fontSize: '1.3rem', letterSpacing: '6px', color: '#fff', fontWeight: 'bold' }}>
            HAPPY NEW YEAR
          </div>
          <div style={{ height: '1.5px', width: '15vw', background: '#f9d479' }}></div>
        </div>

        {/* Lời chúc chân thành đúng nội dung ảnh */}
        <p style={{
          fontSize: 'clamp(1.1rem, 3.5vw, 1.7rem)', color: '#fff', fontStyle: 'italic',
          maxWidth: '900px', margin: '0 auto', lineHeight: '1.8', opacity: 0.95
        }}>
          Chúc Quý khách cùng gia đình một mùa xuân<br/>
          an khang, thịnh vượng, vạn sự như ý và thành công rực rỡ.
        </p>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Playfair+Display:wght@900&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        body { margin: 0; background: #b41414; overflow: hidden; }
      `}</style>
    </div>
  );
}
