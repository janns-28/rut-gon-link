'use client';
import React, { useState, useEffect } from 'react';

const HOLIDAYS = {
  '01-01': 'Tết Dương Lịch', '14-02': 'Valentine\'s Day', '08-03': 'Quốc tế Phụ nữ',
  '30-04': 'Giải phóng Miền Nam', '01-05': 'Quốc tế Lao động', '02-09': 'Quốc khánh Việt Nam',
  '24-12': 'Giáng Sinh', '31-12': 'Giao Thừa'
};

export default function AppleUnifiedClock() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());
  const [dynamicQuote, setDynamicQuote] = useState('');

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@100;300;400;500;600;700;800;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    setMounted(true);
    const fetchQuote = async () => {
      try {
        const res = await fetch('/api/random-quote');
        const data = await res.json();
        if (data.quote) setDynamicQuote(data.quote);
      } catch (e) { setDynamicQuote("Stay hungry, stay foolish."); }
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
    <main style={st.viewport}>
      {/* Nền Gradient mờ cực nhẹ - Chất Apple */}
      <div style={st.backgroundEffect}></div>

      <div style={st.centralStack}>
        
        {/* 1. DYNAMIC ISLAND - Giờ nó là một phần của cụm chính */}
        <div style={st.islandContainer}>
          <div style={st.island}>
            <span style={holiday ? st.islandGold : st.islandSilver}>
              {holiday ? `✦ ${holiday}` : dynamicQuote ? `“ ${dynamicQuote} ”` : 'Initializing...'}
            </span>
          </div>
        </div>

        {/* 2. CỤM TRUNG TÂM: DATE + CLOCK */}
        <div style={st.heroArea}>
          <p style={st.dateLabel}>
            {now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long' }).toUpperCase()}
          </p>
          <div style={st.clockDisplay}>
            <span style={st.timeDigit}>{String(now.getHours()).padStart(2, '0')}</span>
            <span style={st.timeSep}>:</span>
            <span style={st.timeDigit}>{String(now.getMinutes()).padStart(2, '0')}</span>
            <span style={st.timeSep}>:</span>
            <span style={st.timeDigit}>{String(now.getSeconds()).padStart(2, '0')}</span>
          </div>
        </div>

        {/* 3. WIDGET COUNTDOWN - Gần lại để tạo sự liên kết */}
        <div style={st.widgetContainer}>
          <div style={st.widgetCard}>
            <p style={st.widgetTitle}>COUNTDOWN TO {nextYear}</p>
            <div style={st.grid}>
              <div style={st.gridItem}><span style={st.gVal}>{d}</span><span style={st.gLab}>DAYS</span></div>
              <div style={st.gDivider}></div>
              <div style={st.gridItem}><span style={st.gVal}>{String(h).padStart(2, '0')}</span><span style={st.gLab}>HRS</span></div>
              <div style={st.gDivider}></div>
              <div style={st.gridItem}><span style={st.gVal}>{String(m).padStart(2, '0')}</span><span style={st.gLab}>MIN</span></div>
              <div style={st.gDivider}></div>
              <div style={st.gridItem}><span style={st.gVal}>{String(s).padStart(2, '0')}</span><span style={st.gLab}>SEC</span></div>
            </div>
          </div>
        </div>

      </div>

      <style jsx global>{`
        body { margin: 0; background: #000; overflow: hidden; font-family: 'Inter', -apple-system, sans-serif; }
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(30px) scale(0.98); filter: blur(10px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
      `}</style>
    </main>
  );
}

const st = {
  viewport: { height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', position: 'relative' },
  backgroundEffect: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: 'radial-gradient(circle at 50% 50%, #1c1c1e 0%, #000 80%)',
    opacity: 0.6, zIndex: 0
  },
  centralStack: {
    zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: '40px', // ĐÂY LÀ CHỐT CHẶN: Gom tất cả lại với khoảng cách vừa đủ
    animation: 'slideUpFade 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
    width: '100%', maxWidth: '900px'
  },

  // Island Style
  islandContainer: { display: 'flex', justifyContent: 'center' },
  island: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
    padding: '10px 24px', borderRadius: '100px', backdropFilter: 'blur(20px)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
  },
  islandSilver: { color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: '400', letterSpacing: '-0.2px' },
  islandGold: { color: '#ffd60a', fontSize: '14px', fontWeight: '700' },

  // Hero Section
  heroArea: { textAlign: 'center' },
  dateLabel: { color: '#0a84ff', fontSize: '13px', fontWeight: '800', letterSpacing: '5px', marginBottom: '10px' },
  clockDisplay: { display: 'flex', alignItems: 'center', gap: '8px' },
  timeDigit: { fontSize: 'clamp(5rem, 18vw, 13rem)', fontWeight: '800', color: '#fff', letterSpacing: '-8px', lineHeight: '0.9' },
  timeSep: { fontSize: 'clamp(3rem, 10vw, 8rem)', fontWeight: '200', color: 'rgba(255,255,255,0.05)', position: 'relative', top: '-10px' },

  // Widget Style
  widgetContainer: { width: '100%', display: 'flex', justifyContent: 'center' },
  widgetCard: {
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '40px', padding: '30px 60px', textAlign: 'center'
  },
  widgetTitle: { fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.2)', letterSpacing: '4px', marginBottom: '20px' },
  grid: { display: 'flex', alignItems: 'center', gap: '35px' },
  gridItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' },
  gVal: { fontSize: '36px', fontWeight: '700', color: '#fff', letterSpacing: '-1.5px' },
  gLab: { fontSize: '10px', fontWeight: '800', color: 'rgba(255,255,255,0.15)', marginTop: '6px' },
  gDivider: { height: '35px', width: '1px', background: 'rgba(255,255,255,0.05)' }
};
