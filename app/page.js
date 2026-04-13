'use client';
import React, { useState, useEffect } from 'react';

const HOLIDAYS = {
  '01-01': 'New Year\'s Day', '14-02': 'Valentine\'s Day', '08-03': 'Women\'s Day',
  '30-04': 'Reunification', '01-05': 'Labour Day', '02-09': 'Independence Day',
  '20-10': 'Women\'s Day VN', '20-11': 'Teacher\'s Day', '24-12': 'Christmas', '31-12': 'New Year\'s Eve'
};

export default function AppleMinimalistDashboard() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());
  const [dynamicQuote, setDynamicQuote] = useState('');

  useEffect(() => {
    // Nạp phông chữ Inter - Chuẩn mực của Apple
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap';
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
      {/* Mesh Gradient nền cực sâu */}
      <div style={st.meshBG}></div>

      <div style={st.centralStack}>
        
        {/* 1. NGÀY THÁNG - PHẦN TRÊN CÙNG */}
        <p style={st.topDate}>
          {now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </p>

        {/* 2. ĐỒNG HỒ CHÍNH - TO & MỀM MẠI */}
        <div style={st.clockDisplay}>
          <span style={st.tDigit}>{String(now.getHours()).padStart(2, '0')}</span>
          <span style={st.tSep}>:</span>
          <span style={st.tDigit}>{String(now.getMinutes()).padStart(2, '0')}</span>
          <span style={st.tSep}>:</span>
          <span style={st.tDigit}>{String(now.getSeconds()).padStart(2, '0')}</span>
        </div>

        {/* 3. CÂU KHÌA / LỄ - TRÔI NỔI TỰ NHIÊN (KHÔNG CÓ Ô) */}
        <div style={st.statusArea}>
          {holiday ? (
            <span style={st.holidayMsg}>✨ {holiday}</span>
          ) : (
            <span style={st.funnyQuote}>
              {dynamicQuote ? `“ ${dynamicQuote} ”` : ''}
            </span>
          )}
        </div>

        {/* VẠCH CHIA TINH TẾ */}
        <div style={st.divider}></div>

        {/* 4. ĐẾM NGƯỢC - WIDGET STYLE (KHÔNG CÓ Ô BAO NGOÀI) */}
        <div style={st.countdownArea}>
          <p style={st.countHeader}>COUNTDOWN TO {nextYear}</p>
          <div style={st.timerGrid}>
            <div style={st.u}><span style={st.v}>{d}</span><span style={st.l}>NGÀY</span></div>
            <div style={st.sSep}>:</div>
            <div style={st.u}><span style={st.v}>{String(h).padStart(2, '0')}</span><span style={st.l}>GIỜ</span></div>
            <div style={st.sSep}>:</div>
            <div style={st.u}><span style={st.v}>{String(m).padStart(2, '0')}</span><span style={st.l}>PHÚT</span></div>
            <div style={st.sSep}>:</div>
            <div style={st.u}><span style={st.v}>{String(s).padStart(2, '0')}</span><span style={st.l}>GIÂY</span></div>
          </div>
        </div>

      </div>

      <style jsx global>{`
        body { margin: 0; background: #000; overflow: hidden; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
        @keyframes reveal {
          from { opacity: 0; transform: translateY(20px); filter: blur(15px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
      `}</style>
    </main>
  );
}

const st = {
  viewport: { 
    height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', 
    alignItems: 'center', backgroundColor: '#000', position: 'relative' 
  },
  meshBG: {
    position: 'absolute', inset: 0, zIndex: 0,
    background: 'radial-gradient(at 50% 50%, #161618 0%, #000 80%)',
    opacity: 0.8
  },
  centralStack: {
    zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    textAlign: 'center', width: '100%', maxWidth: '1000px',
    animation: 'reveal 1.5s cubic-bezier(0.16, 1, 0.3, 1)'
  },

  // Typography Apple Style
  topDate: { color: '#0a84ff', fontSize: '13px', fontWeight: '700', letterSpacing: '5px', textTransform: 'uppercase', marginBottom: '10px' },
  
  clockDisplay: { display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '20px' },
  tDigit: { fontSize: 'clamp(5rem, 22vw, 15rem)', fontWeight: '800', color: '#fff', letterSpacing: '-10px', lineHeight: '0.9' },
  tSep: { fontSize: 'clamp(3rem, 12vw, 9rem)', fontWeight: '200', color: 'rgba(255,255,255,0.05)', position: 'relative', top: '-10px' },

  statusArea: { minHeight: '40px', marginBottom: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  funnyQuote: { color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(1rem, 1.5vw, 1.3rem)', fontWeight: '400', fontStyle: 'italic', letterSpacing: '-0.2px' },
  holidayMsg: { color: '#ffd60a', fontSize: '1.5rem', fontWeight: '700', textShadow: '0 0 20px rgba(255, 214, 10, 0.3)' },

  divider: { height: '1px', width: '60px', background: 'rgba(255,255,255,0.1)', marginBottom: '50px' },

  // Countdown Floating (Không có ô)
  countdownArea: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  countHeader: { fontSize: '10px', fontWeight: '800', color: 'rgba(255,255,255,0.2)', letterSpacing: '6px', marginBottom: '30px' },
  timerGrid: { display: 'flex', alignItems: 'center', gap: '40px' },
  u: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' },
  v: { fontSize: '42px', fontWeight: '700', color: '#fff', letterSpacing: '-1.5px' },
  l: { fontSize: '9px', fontWeight: '800', color: 'rgba(255,255,255,0.15)', marginTop: '8px', letterSpacing: '1px' },
  sSep: { fontSize: '24px', fontWeight: '200', color: 'rgba(255,255,255,0.05)', paddingBottom: '20px' }
};
