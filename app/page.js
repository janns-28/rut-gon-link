'use client';
import React, { useEffect, useRef } from 'react';

export default function Tet2026FinalFix() {
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
        this.x = x; this.y = y; this.color = color;
        this.velocity = { x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 8 };
        this.alpha = 1; this.friction = 0.95;
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
        const y = Math.random() * canvas.height * 0.4;
        const color = `hsl(${Math.random() * 40 + 40}, 100%, 65%)`;
        for (let i = 0; i < 40; i++) particles.push(new Particle(x, y, color));
      }
    };

    window.addEventListener('resize', resize);
    resize(); animate();
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div className="tet-container">
      <canvas ref={canvasRef} className="fireworks" />
      
      {/* Icon tia sáng góc trên (Giống ảnh mẫu) */}
      <div className="sunburst">❂</div>

      {/* Nhành mai uốn lượn (Vẽ bằng SVG để luôn sắc nét) */}
      <div className="branch-container">
        <svg viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,400 Q150,250 300,320 T500,200" fill="none" stroke="#5d4037" strokeWidth="8" strokeLinecap="round" />
          <circle cx="150" cy="300" r="15" fill="#f9d479" />
          <circle cx="280" cy="320" r="18" fill="#f9d479" />
          <circle cx="450" cy="230" r="20" fill="#f9d479" />
          <circle cx="80" cy="360" r="12" fill="#f9d479" />
          <circle cx="220" cy="310" r="10" fill="#f9d479" />
        </svg>
      </div>

      <div className="main-content">
        <h3 className="script-text">Chúc mừng</h3>
        
        <div className="year-header">
          <h1 className="title-text">XUÂN BÍNH NGỌ</h1>
          <div className="box-2026">
            <span className="top">20</span>
            <div className="line"></div>
            <span className="bottom">26</span>
          </div>
        </div>

        <div className="divider">
          <div className="hr"></div>
          <span className="hny-text">HAPPY NEW YEAR</span>
          <div className="hr"></div>
        </div>

        <p className="wish-text">
          Chúc Quý khách cùng gia đình một mùa xuân<br/>
          an khang, thịnh vượng, vạn sự như ý và thành công rực rỡ.
        </p>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Playfair+Display:wght@700;900&display=swap');
        
        body { margin: 0; background-color: #a51d1d; overflow: hidden; }
        
        .tet-container {
          height: 100vh; width: 100vw; position: relative;
          display: flex; justify-content: center; align-items: center;
          background-color: #a51d1d;
          background-image: radial-gradient(#800 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .fireworks { position: absolute; top: 0; left: 0; }

        .sunburst {
          position: absolute; top: 10%; left: 8%;
          color: #f9d479; font-size: 5rem; opacity: 0.4;
        }

        .branch-container {
          position: absolute; bottom: -40px; left: -40px;
          width: 45vw; z-index: 5; pointer-events: none;
        }

        .main-content {
          position: relative; z-index: 10;
          text-align: center; color: #f9d479;
          animation: fadeIn 2s ease-out;
        }

        .script-text {
          font-family: 'Dancing Script', cursive;
          font-size: clamp(3rem, 8vw, 6rem);
          margin: 0; font-weight: 400; font-style: italic;
          margin-bottom: -15px; margin-left: -200px;
        }

        .year-header {
          display: flex; align-items: center; justify-content: center; gap: 20px;
        }

        .title-text {
          font-family: 'Playfair Display', serif;
          font-size: clamp(3rem, 11vw, 8.5rem);
          margin: 0; font-weight: 900; letter-spacing: 2px;
        }

        .box-2026 {
          border: 2px solid #f9d479; padding: 5px 12px; border-radius: 8px;
          display: flex; flex-direction: column; font-size: 1.6rem;
          font-weight: bold; line-height: 1.1; background: rgba(0,0,0,0.1);
        }

        .box-2026 .line { height: 2px; background: #f9d479; margin: 3px 0; }

        .divider {
          display: flex; align-items: center; justify-content: center; margin: 35px 0;
        }

        .divider .hr { height: 1.5px; width: 18vw; background: #f9d479; }
        .divider .hny-text {
          margin: 0 20px; font-size: 1.2rem; letter-spacing: 6px;
          color: #fff; font-weight: bold;
        }

        .wish-text {
          font-size: clamp(1rem, 3.2vw, 1.7rem); color: #fff;
          font-style: italic; max-width: 900px; margin: 0 auto;
          line-height: 1.7; opacity: 0.95;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
