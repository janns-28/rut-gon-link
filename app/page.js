'use client';
import React, { useEffect, useRef } from 'react';

export default function Tet2026Premium() {
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

    class Firework {
      constructor(x, y, color) {
        this.x = x; this.y = y; this.color = color;
        this.velocity = { x: (Math.random() - 0.5) * 12, y: (Math.random() - 0.5) * 12 };
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
      ctx.fillStyle = 'rgba(130, 15, 15, 0.2)'; // Màu đỏ nhung sang trọng
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        if (p.alpha > 0) { p.update(); p.draw(); }
        else { particles.splice(i, 1); }
      });
      if (Math.random() < 0.04) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.5;
        const color = `hsl(${Math.random() * 40 + 40}, 100%, 60%)`;
        for (let i = 0; i < 60; i++) particles.push(new Firework(x, y, color));
      }
    };

    window.addEventListener('resize', resize);
    resize(); animate();
    audioRef.current?.play().catch(() => {});
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div style={{
      height: '100vh', width: '100vw', backgroundColor: '#820f0f',
      backgroundImage: 'url("https://www.transparenttextures.com/patterns/dark-matter.png")', // Vân mây chìm
      margin: 0, overflow: 'hidden', position: 'relative',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      fontFamily: '"Montserrat", sans-serif', color: '#f9d479'
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      <audio ref={audioRef} autoPlay loop src="https://cdn.pixabay.com/audio/2024/01/15/audio_5b35c02b3c.mp3" />

      {/* NHÀNH MAI NGHỆ THUẬT - VẼ CHI TIẾT */}
      <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '45vw', zIndex: 5, pointerEvents: 'none' }}>
        <svg viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,400 Q100,300 250,350 T500,250" fill="none" stroke="#4a3121" strokeWidth="10" strokeLinecap="round" />
          <path d="M150,320 Q200,200 350,250" fill="none" stroke="#4a3121" strokeWidth="6" />
          {/* Hoa mai 5 cánh */}
          {[
            {x:150, y:320, r:20}, {x:350, y:250, r:25}, {x:250, y:350, r:18},
            {x:450, y:280, r:22}, {x:100, y:360, r:15}
          ].map((h, i) => (
            <g key={i}>
              <circle cx={h.x} cy={h.y} r={h.r} fill="#ffcc00" filter="drop-shadow(0 0 5px gold)" />
              <circle cx={h.x} cy={h.y} r={h.r/3} fill="#ff6600" />
            </g>
          ))}
        </svg>
      </div>

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', animation: 'fadeIn 2s ease-in-out' }}>
        {/* Chữ "Chúc mừng" bay bướm */}
        <h3 style={{
          fontFamily: '"Dancing Script", cursive', fontSize: 'clamp(3rem, 7vw, 6rem)',
          margin: 0, fontWeight: '400', fontStyle: 'italic', marginBottom: '-10px',
          color: '#f9d479', transform: 'translateX(-10%)'
        }}>Chúc mừng</h3>

        {/* Cụm XUÂN BÍNH NGỌ + Ô số 20/26 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
          <h1 style={{
            fontSize: 'clamp(3rem, 12vw, 9rem)', fontWeight: '900', margin: 0,
            letterSpacing: '5px', textShadow: '4px 4px 10px rgba(0,0,0,0.5)'
          }}>
            XUÂN BÍNH NGỌ
          </h1>
          
          <div style={{
            border: '3px solid #f9d479', padding: '10px 15px', borderRadius: '12px',
            backgroundColor: 'rgba(165, 29, 29, 0.8)', boxShadow: '0 0 15px rgba(249, 212, 121, 0.4)',
            display: 'flex', flexDirection: 'column', fontSize: '2rem', fontWeight: '900', lineHeight: '1'
          }}>
            <span>20</span>
            <div style={{ height: '3px', background: '#f9d479', margin: '4px 0' }}></div>
            <span>26</span>
          </div>
        </div>

        {/* Divider: HAPPY NEW YEAR */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '40px 0' }}>
          <div style={{ height: '2px', width: '20vw', background: 'linear-gradient(to right, transparent, #f9d479)' }}></div>
          <span style={{ margin: '0 25px', letterSpacing: '8px', fontSize: '1.4rem', fontWeight: '700', color: '#fff' }}>HAPPY NEW YEAR</span>
          <div style={{ height: '2px', width: '20vw', background: 'linear-gradient(to left, transparent, #f9d479)' }}></div>
        </div>

        {/* Lời chúc Cinematic */}
        <p style={{
          fontSize: 'clamp(1.1rem, 3.5vw, 1.8rem)', color: '#fff', fontStyle: 'italic',
          maxWidth: '1000px', margin: '0 auto', lineHeight: '1.8', opacity: 0.9,
          textShadow: '1px 1px 3px rgba(0,0,0,0.3)'
        }}>
          Chúc Quý khách cùng gia đình một mùa xuân<br/>
          an khang, thịnh vượng, vạn sự như ý và thành công rực rỡ.
        </p>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Montserrat:wght@900&display=swap');
        @keyframes fadeIn
