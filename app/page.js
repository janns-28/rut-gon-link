'use client';
import React, { useEffect, useRef, useState } from 'react';

export default function LunarNewYear() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Hàm bật/tắt nhạc
  const toggleMusic = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    // Tự động bật nhạc khi khách bấm vào màn hình lần đầu
    const handleFirstClick = () => {
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
      document.removeEventListener('click', handleFirstClick);
    };
    document.addEventListener('click', handleFirstClick);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = { x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 8 };
        this.alpha = 1;
        this.friction = 0.95;
      }
      draw() {
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
      update() {
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= 0.01;
      }
    }

    const createFirework = (x, y) => {
      const colors = ['#FFD700', '#FF4500', '#FF0000', '#FFFFFF', '#00FF00'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < 40; i++) particles.push(new Particle(x, y, color));
    };

    const animate = () => {
      requestAnimationFrame(animate);
      ctx.fillStyle = 'rgba(42, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        if (p.alpha > 0) {
          p.update();
          p.draw();
        } else {
          particles.splice(i, 1);
        }
      });
      if (Math.random() < 0.05) createFirework(Math.random() * canvas.width, Math.random() * canvas.height * 0.7);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();
    return () => {
      window.removeEventListener('resize', resize);
      document.removeEventListener('click', handleFirstClick);
    };
  }, [isPlaying]);

  return (
    <div style={{
      height: '100vh', width: '100vw', backgroundColor: '#2a0000',
      margin: 0, overflow: 'hidden', position: 'relative',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      fontFamily: '"Times New Roman", serif', cursor: 'pointer'
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      
      {/* Nhạc nền: Em để sẵn một link nhạc Xuân nhẹ nhàng */}
      <audio ref={audioRef} loop>
        <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" type="audio/mpeg" />
      </audio>

      {/* Nút điều khiển nhạc ở góc màn hình */}
      <div onClick={toggleMusic} style={{
        position: 'absolute', bottom: '30px', right: '30px', zIndex: 100,
        background: 'rgba(255, 215, 0, 0.2)', padding: '15px', borderRadius: '50%',
        border: '1px solid #FFD700', color: '#FFD700', fontSize: '20px',
        animation: isPlaying ? 'rotate 4s linear infinite' : 'none'
      }}>
        {isPlaying ? '🎵' : '🔇'}
      </div>

      <div style={{
        position: 'relative', zIndex: 10, textAlign: 'center', color: '#FFD700',
        padding: '50px', border: '2px solid #FFD700', backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '30px', boxShadow: '0 0 60px rgba(255, 0, 0, 0.5)',
        animation: 'zoomIn 1.5s ease-out'
      }}>
        <div style={{ fontSize: '1.2rem', letterSpacing: '10px' }}>CHÚC MỪNG NĂM MỚI</div>
        <h1 style={{
          fontSize: '120px', margin: '15px 0', fontWeight: '900',
          background: 'linear-gradient(to bottom, #FFD700, #B8860B)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>2026</h1>
        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>BÍNH NGỌ</div>
        <div style={{ margin: '25px auto', width: '150px', height: '1px', background: '#FFD700' }}></div>
        <p style={{ fontSize: '1.5rem', color: '#fff', fontStyle: 'italic' }}>
          Vạn Sự Như Ý • An Khang Thịnh Vượng
        </p>
      </div>

      <style jsx global>{`
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        body { margin: 0; background: #000; }
      `}</style>
    </div>
  );
}
