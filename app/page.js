'use client';
import React, { useEffect, useRef } from 'react';

export default function Tet2026Ultimate() {
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

    class FireworkParticle {
      constructor(x, y, color) {
        this.x = x; this.y = y; this.color = color;
        this.velocity = { x: (Math.random() - 0.5) * 10, y: (Math.random() - 0.5) * 10 };
        this.alpha = 1; this.friction = 0.96; this.gravity = 0.15;
      }
      draw() {
        ctx.save(); ctx.globalAlpha = this.alpha;
        ctx.beginPath(); ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15; ctx.shadowColor = this.color;
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
      // Màu đỏ nhung sang trọng chuẩn ảnh mẫu
      ctx.fillStyle = 'rgba(165, 29, 29, 0.2)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        if (p.alpha > 0) { p.update(); p.draw(); }
        else { particles.splice(i, 1); }
      });
      if (Math.random() < 0.05) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.5;
        const color = `hsl(${Math.random() * 40 + 40}, 100%, 60%)`;
        for (let i = 0; i < 50; i++) particles.push(new FireworkParticle(x, y, color));
      }
    };

    window.addEventListener('resize', resize);
    resize(); animate();
    // Tự động phát nhạc nếu trình duyệt cho phép
    audioRef.current?.play().catch(() => {});
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div className="tet-wrapper">
      <canvas ref={canvasRef} className="fireworks-canvas" />
      <audio ref={audioRef} loop src="https://cdn.pixabay.com/audio/2024/01/15/audio_5b35c02b3c.mp3" />

      {/* Trang trí tia sáng rực rỡ góc trên (Giống ảnh mẫu) */}
      <div className="sparkle-top">❂</div>

      {/* Nhành mai vàng uốn lượn nghệ thuật (Vẽ bằng SVG chi tiết) */}
      <div className="mai-branch">
        <svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,400 Q100,280 250,350 T500,220" fill="none" stroke="#4a3121" strokeWidth="10" strokeLinecap="round" />
          <path d="M150,330 Q220,200 380,260" fill="none" stroke="#4a3121" strokeWidth="6" />
          {/* Hoa mai vàng nở rộ */}
          {[
            {x:150, y:330, r:22}, {x:380, y:260, r:28}, {x:250, y:350, r:20},
            {x:480, y:230, r:25}, {x:100, y:370, r:18}
          ].map((f, i) => (
            <g key={i}>
              <circle cx={f.x} cy={f.y} r={f.r} fill="#ffcc00" filter="drop-shadow(0 0 8px gold)" />
              <circle cx={f.x} cy={f.y} r={f.r/3} fill="#ff6600" />
            </g>
          ))}
        </svg>
      </div>

      <div className="content-container">
        {/* Chữ Chúc mừng bay bướm kiểu Dancing Script */}
        <h3 className="script-title">Chúc mừng</h3>

        {/* XUÂN BÍNH NGỌ + Ô số 20/26 chuẩn 100% layout ảnh mẫu */}
        <div className="main-header">
          <h1 className="year-title">XUÂN BÍNH NGỌ</h1>
          <div className="year-box">
            <span className="part">20</span>
            <div className="separator"></div>
            <span className="part">26</span>
          </div>
        </div>

        {/* Divider HAPPY NEW YEAR sang trọng */}
        <div className="divider-section">
          <div className="line-grad"></div>
          <span className="hny-label">HAPPY NEW YEAR</span>
          <div className="line-grad"></div>
        </div>

        {/* Lời chúc tinh tế đúng chuẩn mẫu */}
        <p className="blessing-text">
          Chúc Quý khách cùng gia đình một mùa xuân<br/>
          an khang, thịnh vượng, vạn sự như ý và thành công rực rỡ.
        </p>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Playfair+Display:wght@700;900&display=swap');
        
        body { margin: 0; background-color: #a51d1d; overflow: hidden; }
        
        .tet-wrapper {
          height: 100vh; width: 100vw; position: relative;
          display: flex; justify-content: center; align-items: center;
          background-color: #a51d1d;
          background-image: radial-gradient(circle, #8b1515 0%, #a51d1d 100%);
        }

        .fireworks-canvas { position: absolute; top: 0; left: 0; }

        .sparkle-top {
          position: absolute; top: 8%; left: 8%;
          color: #f9d479; font-size: 6rem; opacity: 0.3;
        }

        .mai-branch {
          position: absolute; bottom: -60px; left: -60px;
          width: 48vw; z-index: 5; pointer-events: none;
        }

        .content-container {
          position: relative; z-index: 10;
          text-align: center; color: #f9d479;
        }

        .script-title {
          font-family: 'Dancing Script', cursive;
          font-size: clamp(3.5rem, 8vw, 6.5rem);
          margin: 0; font-weight: 700; font-style: italic;
          margin-bottom: -20px; margin-left: -220px;
          text-shadow: 2px 2px 10px rgba(0,0,0,0.3);
        }

        .main-header {
          display: flex; align-items: center; justify-content: center; gap: 25px;
        }

        .year-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(3rem, 12vw, 9rem);
          margin: 0; font-weight: 900; letter-spacing: 3px;
          text-shadow: 4px 4px 15px rgba(0,0,0,0.4);
        }

        .year-box {
          border: 3px solid #f9d479; padding: 10px 18px; border-radius: 12px;
          display: flex; flex-direction: column; font-size: 2rem;
          font-weight: 900; line-height: 1.1; background: rgba(0,0,0,0.1);
          box-shadow: 0 0 20px rgba(249, 212, 121, 0.3);
        }

        .year-box .separator { height: 3px; background: #f9d479; margin: 4px 0; }

        .divider-section {
          display: flex; align-items: center; justify-content: center; margin: 45px 0;
        }

        .divider-section .line-grad { 
          height: 2px; width: 20vw; 
          background: linear-gradient(to right, transparent, #f9d479); 
        }
        .divider-section .line-grad:last-child {
          background: linear-gradient(to left, transparent, #f9d479); 
        }

        .divider-section .hny-label {
          margin: 0 30px; font-size: 1.4rem; letter-spacing: 8px;
          color: #fff; font-weight: bold;
        }

        .blessing-text {
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.2rem, 3.5vw, 1.8rem); color: #fff;
          font-style: italic; max-width: 1000px; margin: 0 auto;
          line-height: 1.8; opacity: 0.95;
          text-shadow: 1px 1px 5px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
}
