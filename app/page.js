'use client';
import React, { useEffect, useRef, useState } from 'react';

export default function TetMasterpiece2026() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor(x, y, color, velocity) {
        this.x = x; this.y = y; this.color = color; this.velocity = velocity;
        this.alpha = 1; this.friction = 0.96; this.gravity = 0.12;
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10; ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }
      update() {
        this.velocity.x *= this.friction; this.velocity.y *= this.friction;
        this.velocity.y += this.gravity;
        this.x += this.velocity.x; this.y += this.velocity.y;
        this.alpha -= 0.01;
      }
    }

    const createFirework = (x, y) => {
      const colors = ['#FFD700', '#FFFFFF', '#FF4500', '#FFFF00'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < 60; i++) {
        const angle = (Math.PI * 2 / 60) * i;
        const speed = Math.random() * 7 + 3;
        particles.push(new Particle(x, y, color, { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed }));
      }
    };

    const animate = () => {
      requestAnimationFrame(animate);
      ctx.fillStyle = 'rgba(206, 31, 31, 0.2)'; // Màu đỏ Tết rực rỡ
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        if (p.alpha > 0) { p.update(); p.draw(); } 
        else { particles.splice(i, 1); }
      });
      if (Math.random() < 0.05) createFirework(Math.random() * canvas.width, Math.random() * canvas.height * 0.7);
    };

    window.addEventListener('resize', resize);
    resize(); animate();
    return () => window.removeEventListener('resize', resize);
  }, [started]);

  return (
    <div onClick={() => { setStarted(true); audioRef.current.play().catch(()=>{}); }} style={{
      height: '100vh', width: '100vw', backgroundColor: '#ce1f1f', // Đỏ rực rỡ may mắn
      margin: 0, overflow: 'hidden', position: 'relative',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      fontFamily: '"Lexend", sans-serif', cursor: 'pointer'
    }}>
      
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, opacity: started ? 1 : 0 }} />
      
      <audio ref={audioRef} loop>
        <source src="https://cdn.pixabay.com/audio/2024/01/15/audio_5b35c02b3c.mp3" type="audio/mpeg" />
      </audio>

      {/* NHÀNH MAI VÀNG GÓC TRÁI TRÊN */}
      <div style={{ position: 'absolute', top: '-20px', left: '-20px', width: '400px', transform: 'rotate(10deg)', zIndex: 5 }}>
        <img src="https://i.imgur.com/3Z8VvP3.png" alt="nhành mai" style={{ width: '100%', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }} />
      </div>

      {/* NHÀNH MAI VÀNG GÓC PHẢI DƯỚI */}
      <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '450px', transform: 'rotate(-10deg) scaleX(-1)', zIndex: 5 }}>
        <img src="https://i.imgur.com/3Z8VvP3.png" alt="nhành mai" style={{ width: '100%', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }} />
      </div>

      <div style={{
        position: 'relative', zIndex: 10, textAlign: 'center',
        padding: '60px', borderRadius: '30px',
        border: '5px double #FFD700', background: 'rgba(0,0,0,0.2)',
        backdropFilter: 'blur(5px)', animation: 'fadeIn 2s'
      }}>
        {!started ? (
          <div style={{ animation: 'pulse 1.5s infinite' }}>
            <h2 style={{ color: '#FFD700', fontSize: '2rem' }}>🧧 CHẠM ĐỂ NHẬN LỘC 🧧</h2>
          </div>
        ) : (
          <>
            <p style={{ color: '#FFD700', letterSpacing: '8px', fontSize: '1.2rem', marginBottom: '20px' }}>CHÚC MỪNG NĂM MỚI</p>
            <h1 style={{
              fontSize: 'clamp(6rem, 20vw, 12rem)', margin: 0, fontWeight: '900',
              color: '#FFD700', textShadow: '0 10px 30px rgba(0,0,0,0.5)',
              lineHeight: '0.9'
            }}>2026</h1>
            <div style={{ fontSize: '3rem', color: '#fff', marginTop: '20px', letterSpacing: '15px', fontWeight: 'bold' }}>BÍNH NGỌ</div>
            <div style={{ margin: '40px auto', width: '250px', height: '2px', background: '#FFD700' }}></div>
            <p style={{ fontSize: '1.8rem', color: '#FFF5E1', fontStyle: 'italic' }}>"Vạn Sự Như Ý • Tấn Tài Tấn Lộc"</p>
          </>
        )}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@300;900&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        body { margin: 0; background: #ce1f1f; overflow: hidden; }
      `}</style>
    </div>
  );
}
