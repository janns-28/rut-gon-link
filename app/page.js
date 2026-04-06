'use client';
import React, { useState, useEffect } from 'react';

const HOLIDAYS = {
  '01-01': 'Tết Dương Lịch', '14-02': 'Valentine\'s Day', '08-03': 'Quốc tế Phụ nữ',
  '30-04': 'Giải phóng Miền Nam', '01-05': 'Quốc tế Lao động', '02-09': 'Quốc khánh Việt Nam',
  '24-12': 'Giáng Sinh', '31-12': 'Giao Thừa'
};

export default function AppleInterface() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());
  const [dynamicQuote, setDynamicQuote] = useState('');

  useEffect(() => {
    // Nạp phông chữ Inter - phông chuẩn Apple giả lập
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    setMounted(true);
    const fetchQuote = async () => {
      try {
        const res = await fetch('/api/random-quote');
        const data = await res.json();
        if (data.quote) setDynamicQuote(data.quote);
      } catch (e) { setDynamicQuote("Cày tiếp đi ní, đừng hóng hớt!"); }
    };

    fetchQuote();
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return <div style={{ backgroundColor: '#000', minHeight: '100vh' }}></div>;

  const nextYear = now.getFullYear() + 1;
  const target = new Date(`January 1, ${nextYear} 00:00:00`).getTime();
  const gap = target - now.getTime();
  const d = Math.floor(gap / (1000 * 60 * 60 * 24));
  const h = Math.floor((gap % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((gap % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((gap % (1000 * 60)) / 1000);

  const dayMonth = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const holiday = HOLIDAYS[dayMonth];

  return (
    <main style={st.page}>
      {/* Nền mờ ảo kiểu Apple Mesh Gradient */}
      <div style={st.ambientLayer}></div>

      {/* 1. DYNAMIC ISLAND (Vùng thông báo) */}
      <div style={st.dynamicIslandContainer}>
        <div style={st.dynamicIsland}>
          {holiday ? (
            <span style={st.islandTextGold}>✦ {holiday}</span>
          ) : (
            <span style={st.islandTextSilver}>{dynamicQuote || 'Đang đồng bộ...'}</span>
          )}
        </div>
      </div>

      {/* 2. CHÍNH GIỮA: ĐỒNG HỒ TỐI GIẢN */}
      <section style={st.heroSection}>
        <p style={st.topDate}>
          {now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long' }).toUpperCase()}
        </p>
        <div style={st.mainClock}>
          <span style={st.timeText}>{String(now.getHours()).padStart(2, '0')}</span>
          <span style={st.timeSep}>:</span>
          <span style={st.timeText}>{String(now.getMinutes()).padStart(2, '0')}</span>
          <span style={st.timeSep}>:</span>
          <span style={st.timeText}>{String(now.getSeconds()).padStart(2, '0')}</span>
        </div>
      </section>

      {/* 3. DƯỚI CÙNG: COUNTDOWN WIDGET */}
      <footer style={st.footer}>
        <div style={st.widget}>
          <p style={st.widgetHeader}>HÀNH TRÌNH ĐẾN {nextYear}</p>
          <div style={st.grid}>
            <div style={st.gridItem}><span style={st.gVal}>{d}</span><span style={st.gLab}>NGÀY</span></div>
            <div style={st.gSep}></div>
            <div style={st.gridItem}><span style={st.gVal}>{String(h).padStart(2, '0')}</span><span style={st.gLab}>GIỜ</span></div>
            <div style={st.gSep}></div>
            <div style={st.gridItem}><span style={st.gVal}>{String(m).padStart(2, '0')}</span><span style={st.gLab}>PHÚT</span></div>
            <div style={st.gSep}></div>
            <div style={st.gridItem}><span style={st.gVal}>{String(s).padStart(2, '0')}</span><span style={st.gLab}>GIÂY</span></div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        body { margin: 0; background: #000; overflow: hidden; font-family: 'Inter', -apple-system, sans-serif; }
        @keyframes islandPop {
          0% { transform: scaleX(0.8) translateY(-20px); opacity: 0; }
          100% { transform: scaleX(1) translateY(0); opacity: 1; }
        }
        @keyframes clockBlur {
          from { filter: blur(20px); opacity: 0; transform: scale(1.1); }
          to { filter: blur(0); opacity: 1; transform: scale(1); }
        }
      `}</style>
    </main>
  );
}

const st = {
  page: { height: '100vh', width: '100vw', position: 'relative', display: 'flex', flexDirection: 'column', color: '#fff', overflow: 'hidden' },
  ambientLayer: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'radial-gradient(circle at 50% -20%, #1c1c1e 0%, #000 70%)',
    zIndex: -1
  },
  dynamicIslandContainer: { width: '100%', display: 'flex', justifyContent: 'center', paddingTop: '40px' },
  dynamicIsland: {
    background: '#121212',
    padding: '10px 25px',
    borderRadius: '100px',
    border: '1px solid rgba(255,255,255,0.1)',
    minWidth: '200px',
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    animation: 'islandPop 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)'
  },
  islandTextSilver: { color: '#8e8e93', fontSize: '13px', fontWeight: '500', letterSpacing: '-0.2px' },
  islandTextGold: { color: '#ffd60a', fontSize: '14px', fontWeight: '700' },
  
  heroSection: { flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', animation: 'clockBlur 1.5s ease-out' },
  topDate: { color: '#0a84ff', fontSize: '12px', fontWeight: '700', letterSpacing: '4px', marginBottom: '10px' },
  mainClock: { display: 'flex', alignItems: 'center', gap: '5px' },
  timeText: { fontSize: 'clamp(5rem, 20vw, 15rem)', fontWeight: '700', letterSpacing: '-10px', color: '#fff' },
  timeSep: { fontSize: 'clamp(3rem, 15vw, 10rem)', fontWeight: '200', color: 'rgba(255,255,255,0.1)', marginBottom: '20px' },

  footer: { paddingBottom: '60px', display: 'flex', justifyContent: 'center' },
  widget: {
    background: 'rgba(28, 28, 30, 0.5)',
    backdropFilter: 'blur(30px)',
    borderRadius: '35px',
    padding: '25px 50px',
    border: '1px solid rgba(255,255,255,0.05)',
    textAlign: 'center'
  },
  widgetHeader: { fontSize: '10px', fontWeight: '800', color: 'rgba(255,255,255,0.3)', letterSpacing: '3px', marginBottom: '15px' },
  grid: { display: 'flex', alignItems: 'center', gap: '30px' },
  gridItem: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  gVal: { fontSize: '28px', fontWeight: '600', color: '#fff', letterSpacing: '-1px' },
  gLab: { fontSize: '9px', fontWeight: '800', color: 'rgba(255,255,255,0.2)', marginTop: '4px' },
  gSep: { height: '30px', width: '1px', background: 'rgba(255,255,255,0.1)' }
};
