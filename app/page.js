'use client';
import React, { useEffect, useRef } from 'react';

export default function Tet2026Masterpiece() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    class Particle {
      constructor(x, y, color) {
        this.x = x; this.y = y; this.color = color;
        this.velocity = { x: (Math.random() - 0.5) * 12, y: (Math.random() - 0.5) * 12 };
        this.alpha = 1; this.friction = 0.96; this.gravity = 0.15;
      }
      draw() {
        ctx.save(); ctx.globalAlpha = this.alpha; ctx.beginPath();
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = this.color; ctx.shadowBlur = 15; ctx.shadowColor = this.color;
        ctx.fill(); ctx.restore();
      }
      update() {
        this.velocity.x *= this.friction; this.velocity.y *= this.friction;
        this.velocity.y += this.gravity; this.x += this.velocity.x; this.y += this.velocity.y;
        this.alpha -= 0.01;
      }
    }
    const animate = () => {
      requestAnimationFrame(animate);
      ctx.fillStyle = 'rgba(112, 1, 5, 0.15)'; // Đỏ nhung sâu lắng
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => { if (p.alpha > 0) { p.update(); p.draw(); } else { particles.splice(i, 1); } });
      if (Math.random() < 0.06) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.5;
        const color = `hsl(${Math.random() * 60 + 30}, 100%, 60%)`;
        for (let i = 0; i < 60; i++) particles.push(new Particle(x, y, color));
      }
    };
    window.addEventListener('resize', resize); resize(); animate();
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div className="tet-box">
      <canvas ref={canvasRef} className="fireworks" />
      <audio ref={audioRef} autoPlay loop src="https://cdn.pixabay.com/audio/2024/01/15/audio_5b35c02b3c.mp3" />
      
      {/* Nhành Mai Vàng nghệ thuật framing màn hình */}
      <div className="mai-left">
        <svg viewBox="0 0 500 500"><path d="M0,500 C100,400 300,450 500,300" fill="none" stroke="#4a3121" strokeWidth="12" strokeLinecap="round" />
        <circle cx="150" cy="420" r="25" fill="#ffd700" /><circle cx="350" cy="380" r="30" fill="#ffd700" />
        <circle cx="480" cy="300" r="20" fill="#ffd700" /></svg>
      </div>

      <div className="glass-card">
        <h3 className="chuc-mung">Chúc mừng</h3>
        <div className="header-flex">
          <h1 className="xbn">XUÂN BÍNH NGỌ</h1>
          <div className="year-box">
            <span>20</span><div className="div-line"></div><span>26</span>
          </div>
        </div>
        <div className="hny-divider">
          <div className="gold-line"></div><span className="hny">HAPPY NEW YEAR</span><div className="gold-line"></div>
        </div>
        <p className="wish">Chúc Quý khách cùng gia đình một mùa xuân<br/>an khang, thịnh vượng, vạn sự như ý và thành công rực rỡ.</p>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Playfair+Display:wght@900&family=Montserrat:wght@400;700&display=swap');
        body { margin: 0; background: #700105; overflow: hidden; font-family: 'Montserrat', sans-serif; }
        .tet-box { height: 100vh; width: 100vw; display: flex; justify-content: center; align-items: center; position: relative; background: radial-gradient(circle, #b31217 0%, #700105 100%); }
        .fireworks { position: absolute; top: 0; left: 0; }
        .mai-left { position: absolute; bottom: -50px; left: -50px; width: 45vw; z-index: 5; opacity: 0.9; }
        .glass-card { position: relative; z-index: 10; padding: 60px; background: rgba(0, 0, 0, 0.25); backdrop-filter: blur(15px); border-radius: 40px; border: 1px solid rgba(255, 215, 0, 0.3); text-align: center; color: #ffd700; box-shadow: 0 25px 50px rgba(0,0,0,0.5); }
        .chuc-mung { font-family: 'Dancing Script', cursive; font-size: 5rem; margin: 0; margin-bottom: -20px; margin-left: -200px; text-shadow: 0 0 20px rgba(255, 215, 0, 0.5); }
        .header-flex { display: flex; align-items: center; justify-content: center; gap: 30px; }
        .xbn { font-family: 'Playfair Display', serif; font-size: 8rem; margin: 0; letter-spacing: 5px; }
        .year-box { border: 3px solid #ffd700; padding: 10px 15px; border-radius: 12px; font-size: 2.2rem; font-weight: 900; line-height: 1; }
        .div-line { height: 3px; background: #ffd700; margin: 4px 0; }
        .hny-divider { display: flex; align-items: center; gap: 20px; margin: 40px 0; }
        .gold-line { flex: 1; height: 1.5px; background: linear-gradient(to right, transparent, #ffd700, transparent); }
        .hny { font-size: 1.5rem; color: #fff; letter-spacing: 8px; font-weight: bold; }
        .wish { color: #fff; font-size: 1.8rem; font-style: italic; line-height: 1.8; opacity: 0.95; }
      `}</style>
    </div>
  );
}
