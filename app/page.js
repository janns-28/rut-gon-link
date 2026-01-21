'use client';
import React, { useEffect, useRef } from 'react';

export default function Tet2026ArtisticMai() {
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
        const y = Math.random() * canvas.height * 0.6;
        const color = `hsl(${Math.random() * 40 + 40}, 100%, 65%)`;
        for (let i = 0; i < 40; i++) particles.push(new Particle(x, y, color));
      }
    };

    window.addEventListener('resize', resize);
    resize(); animate();
    audioRef.current?.play().catch(() => {});
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div style={{
      height: '100vh', width: '100vw', backgroundColor: '#a51d1d',
      backgroundImage: 'radial-gradient(#800 1px, transparent 1px)',
      backgroundSize: '40px 40px', margin: 0, overflow: 'hidden', position: 'relative',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      fontFamily: '"Playfair Display", serif'
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      <audio ref={audioRef} loop src="https://cdn.pixabay.com/audio/2024/01/15/audio_5b35c02b3c.mp3" />

      {/* --- TUYỆT TÁC NHÀNH MAI SVG MỚI --- */}
      <div style={{ position: 'absolute', bottom: '-80px', left: '-50px', width: '50vw', zIndex: 5, pointerEvents: 'none', filter: 'drop-shadow(5px 10px 20px rgba(0,0,0,0.5))' }}>
        <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="flowerGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" style={{stopColor:'#fff7e6', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'#ffcc00', stopOpacity:1}} />
            </radialGradient>
            <linearGradient id="branchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:'#4a3121', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'#2e1e14', stopOpacity:1}} />
            </linearGradient>
          </defs>
          
          {/* Thân cây uốn lượn nghệ thuật */}
          <path d="M0,600 C150,450 250,550 400,400 C500,300 650,350 800,200" fill="none" stroke="url(#branchGrad)" strokeWidth="18" strokeLinecap="round" />
          <path d="M250,500 C300,400 3
