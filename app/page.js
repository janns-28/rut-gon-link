'use client';
import React, { useEffect, useRef, useState } from 'react';

export default function Tet2026Perfect() {
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
      ctx.fillStyle = 'rgba(165, 29, 29, 0.2)'; // Màu đỏ đô chuẩn ảnh
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        if (p.alpha > 0) { p.update(); p.draw(); }
        else { particles.splice(i, 1); }
      });
      if (Math.random() < 0.05) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.7;
        const color = `hsl(${Math.random() * 60 + 40}, 100%, 60%)`;
        for (let i = 0; i < 40; i++) particles.push(new Particle(x, y, color));
      }
    };

    window.addEventListener('resize', resize);
    resize(); animate();
    return () => window.removeEventListener('resize', resize);
  }, [started]);

  return (
    <div onClick={() => { setStarted(true); audioRef.current.play().catch(()=>{}); }} style={{
      height: '100vh', width: '100vw', backgroundColor: '#a51d1d',
      backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)',
      backgroundSize: '30px 30px', margin: 0, overflow: 'hidden', position: 'relative',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      fontFamily: '"Playfair Display", serif', cursor: 'pointer'
    }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, opacity: started ? 1 : 0 }} />
      <audio ref={audioRef} loop src="https://cdn.pixabay.com/audio/2024/01/15/audio_5b35c02b3c.mp3" />

      {/* Trang trí nhành mai (Bottom Left) - Giống ảnh */}
      <div style={{ position: 'absolute', bottom: '-20px', left: '-50px', width: '45vw', zIndex: 5, pointerEvents: 'none' }}>
        <img src="https://i.imgur.com/3Z8VvP3.png" alt="mai" style={{ width: '100%', transform: 'rotate(15deg)' }} />
      </div>

      {/* Header Sparkle (Top Left) - Giống ảnh */}
      <div style={{ position: 'absolute', top: '50px', left: '50px', fontSize: '3rem', color: '#f9d479', opacity: 0.6 }}>✲</div>

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', color: '#f9d479', padding: '20px' }}>
        {!started ? (
          <div style={{ animation: 'pulse 2s infinite', fontSize: '1.5rem', fontWeight: 'bold' }}>
             🧧 CHẠM ĐỂ KHAI XUÂN 2026 🧧
          </div>
        ) : (
          <div style={{ animation: 'fadeIn 2s ease-out' }}>
            {/* Chữ "Chúc mừng" bay bướm */}
            <h3 style={{
              fontFamily: '"Dancing Script", cursive', fontSize: 'clamp(3rem, 8vw, 6rem)',
              margin: 0, fontWeight: '400', fontStyle: 'italic'
            }}>Chúc mừng</h3>

            {/* Cụm Xuân Bính Ngọ + Box 20/26 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginTop: '-10px' }}>
              <h1 style={{ fontSize: 'clamp(3rem, 10vw, 8rem)', margin: 0, fontWeight: '700', letterSpacing: '5px' }}>
                XUÂN BÍNH NGỌ
              </h1>
              <div style={{
                border: '2px solid #f9d479', padding: '5px 10px', borderRadius: '8px',
                display: 'flex', flexDirection: 'column', fontSize: '1.5rem', fontWeight: 'bold'
              }}>
                <span>20</span>
                <div style={{ height: '2px', background: '#f9d479', margin: '2px 0' }}></div>
                <span>26</span>
              </div>
            </div>

            {/* Divider Line */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '30px 0' }}>
              <div style={{ height: '1px', width: '15vw', background: '#f9d479' }}></div>
              <div style={{ margin: '0 20px', fontSize: '1.2rem', letterSpacing: '5px', color: '#fff' }}>HAPPY NEW YEAR</div>
              <div style={{ height: '1px', width: '15vw', background: '#f9d479' }}></div>
            </div>

            {/* Lời chúc bên dưới */}
            <p style={{
              fontSize: 'clamp(1rem, 3vw, 1.5rem)', color: '#fff', fontStyle: 'italic',
              maxWidth: '800px', margin: '0 auto', lineHeight: '1.6', opacity: 0.9
            }}>
              Chúc Quý khách cùng gia đình một mùa xuân<br/>
              an khang, thịnh vượng, vạn sự như ý và thành công rực rỡ.
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Playfair+Display:wght@400;700;900&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.7; } }
        body { margin: 0; background: #a51d1d; overflow: hidden; }
      `}</style>
    </div>
  );
}
