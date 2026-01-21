'use client';
import React, { useEffect, useRef } from 'react';

export default function TetFinal() {
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
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      <div className="main-content" style={{ position: 'relative', zIndex: 10, textAlign: 'center', color: '#f9d479' }}>
        <h1 style={{ fontSize: '5rem', margin: 0 }}>XUÂN BÍNH NGỌ 2026</h1>
        <p style={{ fontSize: '1.5rem', color: '#fff' }}>Vạn Sự Như Ý • An Khang Thịnh Vượng</p>
      </div>
      <style jsx global>{`
        body { margin: 0; background-color: #a51d1d; overflow: hidden; font-family: sans-serif; }
        .tet-container { height: 100vh; width: 100vw; display: flex; justify-content: center; align-items: center; }
      `}</style>
    </div>
  );
}
