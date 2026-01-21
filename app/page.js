'use client';
import React, { useEffect, useRef, useState } from 'react';

export default function Tet2026() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let fireworks = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor(x, y, color, velocity) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
        this.friction = 0.96;
        this.gravity = 0.15;
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
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
      const colors = ['#FFD700', '#FFA500', '#FF4500', '#FF0000', '#FFF'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < 60; i++) {
        const angle = (Math.PI * 2) / 60 * i;
        const speed = Math.random() * 6 + 2;
        particles.push(new Particle(x, y, color, {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed
        }));
      }
    };

    const animate = () => {
      requestAnimationFrame(animate);
      ctx.fillStyle = 'rgba(26, 0, 0, 0.15)'; // Nền đỏ sâu lắng
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        if (p.alpha > 0) {
          p.update();
          p.draw();
        } else {
          particles.splice(i, 1);
        }
      });

      if (Math.random() < 0.04) createFirework(Math.random() * canvas.width, Math.random() * canvas.height * 0.6);
    };

    const handleInteraction = () => {
      if (!isPlaying && audioRef.current) {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousedown', handleInteraction);
    resize();
    animate();
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousedown', handleInteraction);
    };
  }, [isPlaying]);

  return (
    <div style={{
      height: '100vh', width: '100vw', backgroundColor: '#1a0000',
      margin: 0, overflow: 'hidden', position: 'relative',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      fontFamily: '"Montserrat", sans-serif', cursor: 'crosshair'
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      
      {/* Nhạc Xuân không lời cực sang */}
      <audio ref={audioRef} loop>
        <source src="https://cdn.pixabay.com/audio/2022/10/14/audio_3334c9196b.mp3" type="audio/mpeg" />
      </audio>

      {/* Trang trí góc: Câu đối & Họa tiết mây */}
      <div className="decoration" style={{ top: '5%', left: '5%', animation: 'float 4s ease-in-out infinite' }}>🧧</div>
      <div className="decoration" style={{ top: '5%', right: '5%', animation: 'float 4s ease-in-out infinite reverse' }}>🧧</div>

      {/* Nội dung trung tâm */}
      <div style={{
        position: 'relative', zIndex: 10, textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(8px)',
        padding: '80px 100px', borderRadius: '40px',
        border: '1px solid rgba(255, 215, 0, 0.3)',
        boxShadow: '0 0 100px rgba(0,0,0,0.8)'
      }}>
        <p style={{ letterSpacing: '0.6em', fontSize: '1rem', color: '#FFD700', marginBottom: '20px', textTransform: 'uppercase' }}>
          Lunar New Year Celebration
        </p>
        
        <h1 style={{
          fontSize: '150px', margin: '0', fontWeight: '900',
          background: 'linear-gradient(to bottom, #FFD700 20%, #B8860B 80%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          lineHeight: '0.9', filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.5))'
        }}>
          2026
        </h1>

        <div style={{ fontSize: '2.5rem', color: '#fff', fontWeight: '200', marginTop: '10px', letterSpacing: '10px' }}>
          BÍNH NGỌ
        </div>

        <div style={{
          margin: '40px auto', width: '300px', height: '1px',
          background: 'linear-gradient(90deg, transparent, #FFD700, transparent)'
        }}></div>

        <p style={{
          fontSize: '1.8rem', color: '#f0f0f0', fontWeight: '300',
          fontStyle: 'italic', textShadow: '0 2px 10px rgba(0,0,0,0.5)'
        }}>
          Chúc Mừng Năm Mới
        </p>

        <div style={{ marginTop: '30px', color: '#888', fontSize: '0.9rem', letterSpacing: '2px' }}>
          {isPlaying ? 'SOUND ON • ENJOY THE MOMENT' : 'TAP ANYWHERE TO PLAY MUSIC'}
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@200;900&display=swap');
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .decoration { position: absolute; font-size: 60px; filter: drop-shadow(0 0 20px #ff0000); }
        body { margin: 0; background: #000; overflow: hidden; }
      `}</style>
    </div>
  );
}
