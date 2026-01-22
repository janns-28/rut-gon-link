'use client';
import React, { useEffect, useRef } from 'react';

export default function TrangChuTetViet() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  // --- Hiệu ứng Pháo Hoa (Giữ lại cho sinh động) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize); resize();

    class Particle {
      constructor(x, y, color) {
        this.x = x; this.y = y; this.color = color;
        this.velocity = { x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 8 };
        this.alpha = 1;
      }
      draw() {
        ctx.save(); ctx.globalAlpha = this.alpha;
        ctx.beginPath(); ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = this.color; ctx.shadowBlur = 10; ctx.shadowColor = this.color;
        ctx.fill(); ctx.restore();
      }
      update() { this.x += this.velocity.x; this.y += this.velocity.y; this.alpha -= 0.012; }
    }

    const animate = () => {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Xóa canvas để nền trong suốt
      particles.forEach((p, i) => { if (p.alpha > 0) { p.update(); p.draw(); } else { particles.splice(i, 1); } });
      if (Math.random() < 0.03) { // Tần suất pháo nổ
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.6;
        const color = Math.random() > 0.5 ? '#FFD700' : '#FF4500'; // Vàng hoặc Đỏ cam
        for (let i = 0; i < 35; i++) particles.push(new Particle(x, y, color));
      }
    };
    animate();
    // Tự động phát nhạc (cần tương tác người dùng trên một số trình duyệt)
    if (audioRef.current) { audioRef.current.volume = 0.4; audioRef.current.play().catch(() => {}); }
    return () => window.removeEventListener('resize', resize);
  }, []);

  // --- Styles (Viết Inline để tránh lỗi cú pháp trên GitHub) ---
  const styles = {
    container: {
      height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      // Nền đỏ vân mây truyền thống (sử dụng gradient để tạo chiều sâu)
      background: 'radial-gradient(circle at center, #b31217 0%, #800000 70%, #5a0000 100%)',
      fontFamily: "'Times New Roman', serif", // Fallback font
    },
    canvas: { position: 'absolute', top: 0, left: 0, zIndex: 1 },
    // Họa tiết nền mờ (Trống đồng)
    bgPattern: {
      position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
      width: '80vw', height: '80vw', maxWidth: '600px', maxHeight: '600px',
      opacity: 0.1, pointerEvents: 'none', zIndex: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0 C77.6 0 100 22.4 100 50 C100 77.6 77.6 100 50 100 C22.4 100 0 77.6 0 50 C0 22.4 22.4 0 50 0 Z M50 10 C27.9 10 10 27.9 10 50 C10 72.1 27.9 90 50 90 C72.1 90 90 72.1 90 50 C90 27.9 72.1 10 50 10 Z' fill='%23FFD700' fill-rule='evenodd'/%3E%3C/svg%3E")`,
      backgroundSize: '150px 150px',
    },
    // Nội dung chính
    contentBox: {
      position: 'relative', zIndex: 10, textAlign: 'center', color: '#FFD700',
      padding: '20px',
      textShadow: '2px 2px 8px rgba(0,0,0,0.6)',
    },
    // Chữ "Chúc Mừng Năm Mới" - Giả lập thư pháp
    mainTitle: {
        fontSize: 'clamp(3.5rem, 8vw, 6rem)', margin: 0,
        fontWeight: 'bold', lineHeight: 1.1,
        fontFamily: "cursive, 'Times New Roman'", // Ưu tiên font uốn lượn
        color: '#FFD700',
        // Hiệu ứng gradient vàng cho chữ
        background: '-webkit-linear-gradient(#FFD700, #FFA500)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    },
    // Năm Bính Ngọ
    subTitle: {
      fontSize: 'clamp(2rem, 5vw, 3.5rem)', margin: '10px 0 25px 0',
      fontWeight: 'normal', letterSpacing: '2px',
      borderTop: '2px solid #FFD700', borderBottom: '2px solid #FFD700',
      display: 'inline-block', padding: '5px 20px',
    },
    // Lời chúc
    blessing: {
        fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', fontStyle: 'italic',
        marginTop: '20px', color: '#fffde7',
    },
    // Câu đối 2 bên
    couplet: {
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        writingMode: 'vertical-rl', textOrientation: 'upright',
        backgroundColor: '#990000', color: '#FFD700',
        padding: '20px 10px', borderRadius: '5px',
        border: '3px solid #FFD700', fontWeight: 'bold', fontSize: '1.5rem',
        boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
        height: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 5,
    },
    coupletLeft: { left: '5%' },
    coupletRight: { right: '5%' },
    // Nhành mai SVG
    maiBranch: {
        position: 'absolute', top: '-60px', right: '-60px', width: '40vw', maxWidth: '400px',
        zIndex: 8, pointerEvents: 'none', filter: 'drop-shadow(2px 5px 5px rgba(0,0,0,0.3))'
    }
  };

  return (
    <div style={styles.container}>
        {/* Nhạc nền (Nhạc xuân không lời) */}
        <audio ref={audioRef} loop src="https://cdn.pixabay.com/download/audio/2022/01/26/audio_d4641e4773.mp3?filename=chinese-new-year-song-8676.mp3" />
        <canvas ref={canvasRef} style={styles.canvas} />
        <div style={styles.bgPattern}></div>

        {/* Nhành Mai Vàng SVG góc trên phải */}
        <div style={styles.maiBranch}>
            <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
                <path d="M400,0 Q250,150 100,100 T0,250" fill="none" stroke="#5d4037" strokeWidth="12" strokeLinecap="round" />
                <path d="M250,130 Q320,220 380,280" fill="none" stroke="#5d4037" strokeWidth="8" strokeLinecap="round" />
                {/* Hoa và nụ */}
                <g fill="#FFD700">
                    <circle cx="250" cy="130" r="20" /><circle cx="250" cy="130" r="6" fill="#ff6f00"/>
                    <circle cx="100" cy="100" r="25" /><circle cx="100" cy="100" r="7" fill="#ff6f00"/>
                    <circle cx="320" cy="200" r="18" /><circle cx="320" cy="200" r="5" fill="#ff6f00"/>
                    <circle cx="50" cy="180" r="10" /> {/* Nụ */}
                    <circle cx="380" cy="280" r="12" /> {/* Nụ */}
                </g>
            </svg>
        </div>

        {/* Câu đối bên trái */}
        <div style={{...styles.couplet, ...styles.coupletLeft}}>
            TÂN NIÊN HẠNH PHÚC BÌNH AN ĐẾN
        </div>

        {/* Nội dung chính giữa */}
        <div style={styles.contentBox}>
            <h1 style={styles.mainTitle}>CHÚC MỪNG NĂM MỚI</h1>
            <h2 style={styles.subTitle}>XUÂN BÍNH NGỌ 2026</h2>
            <div style={{ fontSize: '4rem', margin: '10px 0' }}>🧧🐎💰</div>
            <p style={styles.blessing}>
                Vạn sự như ý - Tỷ sự như mơ<br/>
                Triệu triệu bất ngờ - Ngập tràn hạnh phúc.
            </p>
        </div>

        {/* Câu đối bên phải */}
        <div style={{...styles.couplet, ...styles.coupletRight}}>
            XUÂN NHẬT VINH HOA PHÚ QUÝ LAI
        </div>
    </div>
  );
}
