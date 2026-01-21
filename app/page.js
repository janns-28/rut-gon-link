'use client';
import React, { useEffect, useRef, useState } from 'react';

export default function TetBinhNgo2026() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // --- PHÁO HOA ---
    class FireworkParticle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = { x: (Math.random() - 0.5) * 12, y: (Math.random() - 0.5) * 12 };
        this.alpha = 1;
        this.friction = 0.95;
        this.gravity = 0.2;
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }
      update() {
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.velocity.y += this.gravity;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.012;
      }
    }

    const createFirework = (x, y) => {
      const colors = ['#FFD700', '#FF4500', '#FF0000', '#FFFFFF', '#FF69B4'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < 50; i++) particles.push(new FireworkParticle(x, y, color));
    };

    const animate = () => {
      requestAnimationFrame(animate);
      ctx.fillStyle = 'rgba(20, 0, 0, 0.2)'; // Nền đỏ sẫm chiều sâu
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        if (p.alpha > 0) {
          p.update();
          p.draw();
        } else {
          particles.splice(i, 1);
        }
      });

      if (Math.random() < 0.05) createFirework(Math.random() * canvas.width, Math.random() * canvas.height * 0.6);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();
    return () => window.removeEventListener('resize', resize);
  }, []);

  const startTết = () => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <div onClick={startTết} style={{
      height: '100vh', width: '100vw', backgroundColor: '#1a0000',
      margin: 0, overflow: 'hidden', position: 'relative',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      fontFamily: '"Montserrat", sans-serif', cursor: 'pointer'
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      
      {/* Nhạc Xuân tuyển chọn */}
      <audio ref={audioRef} loop>
        <source src="https://cdn.pixabay.com/audio/2024/01/15/audio_5b35c02b3c.mp3" type="audio/mpeg" />
      </audio>

      {/* --- HIỆU ỨNG HOA MAI RƠI --- */}
      <div className="mai-container">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="mai-flower" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${Math.random() * 5 + 5}s`
          }}>🌼</div>
        ))}
      </div>

      {/* NỘI DUNG CHÍNH */}
      <div style={{
        position: 'relative', zIndex: 10, textAlign: 'center',
        background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(10px)',
        padding: '60px 80px', borderRadius: '50px',
        border: '2px solid rgba(255, 215, 0, 0.4)',
        boxShadow: '0 0 100px rgba(255, 0, 0, 0.3)'
      }}>
        <p style={{ letterSpacing: '0.8em', fontSize: '0.9rem', color: '#FFD700', marginBottom: '20px' }}>
          MỪNG XUÂN BÍNH NGỌ
        </p>
        
        <h1 style={{
          fontSize: 'clamp(5rem, 15vw, 10rem)', margin: '0', fontWeight: '900',
          background: 'linear-gradient(to bottom, #FFEFD5, #FFD700, #DAA520)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          lineHeight: '0.8', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.8))'
        }}>
          2026
        </h1>

        <div style={{ fontSize: '2.5rem', color: '#fff', fontWeight: '200', marginTop: '20px', letterSpacing: '8px' }}>
          AN KHANG THỊNH VƯỢNG
        </div>

        <div style={{
          margin: '30px auto', width: '200px', height: '2px',
          background: 'linear-gradient(90deg, transparent, #FFD700, transparent)'
        }}></div>

        <p style={{ fontSize: '1.4rem', color: '#FFD700', fontWeight: '300', fontStyle: 'italic' }}>
          {isPlaying ? '🌸 Nhạc Xuân Đang Phát...' : '🧧 Bấm vào màn hình để Khai Xuân!'}
        </p>
      </div>

      {/* LỒNG ĐÈN ĐUNG ĐƯA */}
      <div className="lantern-box" style={{ left: '50px' }}>🏮</div>
      <div className="lantern-box" style={{ right: '50px' }}>🏮</div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@900&display=swap');
        
        .mai-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
        .mai-flower {
          position: absolute; top: -50px; font-size: 25px;
          animation: fall linear infinite;
        }
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        @keyframes swing {
          0% { transform: rotate(-10deg); }
          100% { transform: rotate(10deg); }
        }
        .lantern-box {
          position: absolute; top: 0; font-size: 60px;
          animation: swing 2s ease-in-out infinite alternate;
          transform-origin: top center;
          filter: drop-shadow(0 0 20px #ff0000);
        }
        body { margin: 0; background: #000; overflow: hidden; }
      `}</style>
    </div>
  );
}
