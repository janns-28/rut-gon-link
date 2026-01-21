'use client';
import React, { useEffect, useRef } from 'react';

export default function Tet2026FinalFix() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    class Particle {
      constructor(x, y, color) {
        this.x = x; this.y = y; this.color = color;
        this.velocity = { x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 8 };
        this.alpha = 1; this.friction = 0.95;
      }
      draw() {
        ctx.save(); ctx.globalAlpha = this.alpha;
        ctx.beginPath(); ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = this.color; ctx.shadowBlur = 10; ctx.shadowColor = this.color;
        ctx.fill(); ctx.restore();
      }
      update() {
        this.velocity.x *= this.friction; this.velocity.y *= this.friction;
        this.x += this.velocity.x; this.y += this.velocity.y;
        this.alpha -= 0.01;
      }
    }
    const animate = () => {
      requestAnimationFrame(animate);
      ctx.fillStyle = 'rgba(165, 29, 29, 0.2)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => { if (p.alpha > 0) { p.update(); p.draw(); } else { particles.splice(i, 1); } });
      if (Math.random() < 0.05) {
        const x = Math.random() * canvas.width; const y = Math.random() * canvas.height * 0.4;
        const color = `hsl(${Math.random() * 40 + 40}, 100%, 65%)`;
        for (let i = 0; i < 40; i++) particles.push(new Particle(x, y, color));
      }
    };
    window.addEventListener('resize', resize); resize(); animate();
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div className="tet-container">
      <canvas ref={canvasRef} className="fireworks" />
      <div className="mai-branch">
        <svg viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,300 Q150,150 300,200 T500,100" fill="none" stroke="#5d4037" strokeWidth="10" strokeLinecap="round" />
          <circle cx="150" cy="180" r="18" fill="#f9d479" />
          <circle cx="300" cy="200" r="22" fill="#f9d479" />
          <circle cx="480" cy="110" r="25" fill="#f9d479" />
        </svg>
      </div>
      <div className="main-content">
        <h3 className="script-text">Chúc mừng</h3>
        <div className="year-header">
          <h1 className="title-text">XUÂN BÍNH NGỌ</h1>
          <div className="box-2026"><span>20</span><div className="line"></div><span>26</span></div>
        </div>
        <p className="wish-text">Chúc Quý khách cùng gia đình một mùa xuân an khang, thịnh vượng!</p>
      </div>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Playfair+Display:wght@900&display=swap');
        body { margin: 0; background-color: #a51d1d; overflow: hidden; }
        .tet-container { height: 100vh; width: 100vw; display: flex; justify-content: center; align-items: center; position: relative; }
        .fireworks { position: absolute; top: 0; left: 0; }
        .mai-branch { position: absolute; bottom: -20px; left: -20px; width: 40vw; z-index: 5; opacity: 0.9; }
        .main-content { position: relative; z-index: 10; text-align: center; color: #f9d479; }
        .script-text { font-family: 'Dancing Script', cursive; font-size: 5rem; margin: 0; margin-left: -200px; margin-bottom: -15px; }
        .year-header { display: flex; align-items: center; justify-content: center; gap: 20px; }
        .title-text { font-family: 'Playfair Display', serif; font-size: clamp(3rem, 10vw, 8rem); margin: 0; font-weight: 900; }
        .box-2026 { border: 2px solid #f9d479; padding: 5px 12px; border-radius: 8px; display: flex; flex-direction: column; font-size: 1.8rem; font-weight: bold; line-height: 1.1; }
        .box-2026 .line { height: 2px; background: #f9d479; margin: 3px 0; }
        .wish-text { color: #fff; font-style: italic; font-size: 1.6rem; margin-top: 35px; opacity: 0.9; }
      `}</style>
    </div>
  );
}
