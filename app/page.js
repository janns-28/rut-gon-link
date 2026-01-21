'use client';
import React, { useEffect, useRef } from 'react';

export default function TetFinalFix() {
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
        ctx.beginPath(); ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color; ctx.fill(); ctx.restore();
      }
      update() { this.velocity.x *= this.friction; this.velocity.y *= this.friction; this.x += this.velocity.x; this.y += this.velocity.y; this.alpha -= 0.012; }
    }
    const animate = () => {
      requestAnimationFrame(animate);
      ctx.fillStyle = 'rgba(165, 29, 29, 0.2)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
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
        .main-content { position: relative; z-index: 10; text-align: center; color: #f9d479; }
        .script-text { font-family: 'Dancing Script', cursive; font-size: 4rem; margin: 0; margin-left: -150px; }
        .year-header { display: flex; align-items: center; gap: 20px; }
        .title-text { font-family: 'Playfair Display', serif; font-size: 6rem; margin: 0; }
        .box-2026 { border: 2px solid #f9d479; padding: 5px; border-radius: 5px; display: flex; flex-direction: column; font-weight: bold; }
        .box-2026 .line { height: 2px; background: #f9d479; margin: 2px 0; }
      `}</style>
    </div>
  );
}
