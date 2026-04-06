'use client';
import React, { useState, useEffect } from 'react';

const HOLIDAYS = {
  '01-01': 'New Year\'s Day', '14-02': 'Valentine\'s Day', '08-03': 'Women\'s Day',
  '30-04': 'Reunification', '01-05': 'Labour Day', '02-09': 'Independence Day',
  '24-12': 'Christmas', '31-12': 'New Year\'s Eve'
};

export default function AppleMasterpiece() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());
  const [dynamicQuote, setDynamicQuote] = useState('');

  useEffect(() => {
    // Nạp phông Inter & tinh chỉnh để giống SF Pro nhất có thể
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
      {/* Nền Mesh Gradient cực sâu kiểu macOS Sonoma */}
      <div style={st.meshBG}></div>

      {/* 1. DYNAMIC ISLAND - CỰC KỲ THẬT */}
      <div style={st.islandWrapper}>
        <div style={st.dynamicIsland}>
          <div style={st.islandContent}>
            {holiday ? (
              <span style={st.islandGold}>✦ {holiday}</span>
            ) : (
              <span style={st.islandSilver}>{dynamicQuote || 'Syncing...'}</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. CỤM TRUNG TÂM - LOCKSCREEN STYLE */}
      <div style={st.centralStack}>
        <p style={st.lockDate}>
          {now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long' })}
        </p>
        <div style={st.lockClock}>
          <span style={st.tDigit}>{String(now.getHours()).padStart(2, '0')}</span>
          <span style={st.tSep}>:</span>
          <span style={st.tDigit}>{String(now.getMinutes()).padStart(2, '0')}</span>
          <span style={st.tSep}>:</span>
          <span style={st.tDigit}>{String(now.getSeconds()).padStart(2, '0')}</span>
        </div>
      </div>

      {/* 3. CONTROL CENTER WIDGETS */}
      <div style={st.footer}>
        <div style={st.widgetGroup}>
          <div style={st.widget}>
            <p style={st.wHeader}>NEW YEAR {nextYear}</p>
            <div style={st.wGrid}>
              <div style={st.wItem}><span style={st.wVal}>{d}</span><span style={st.wLab}>D</span></div>
              <div style={st.wLine}></div>
              <div style={st.wItem}><span style={st.wVal}>{String(h).padStart(2, '0')}</span><span style={st.wLab}>H</span></div>
              <div style={st.wLine}></div>
              <div style={st.wItem}><span style={st.wVal}>{String(m).padStart(2, '0')}</span><span style={st.wLab}>M</span></div>
              <div style={st.wLine}></div>
              <div style={st.wItem}><span style={st.wVal}>{String(s).padStart(2, '0')}</span><span style={st.wLab}>S</span></div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        body { 
          margin: 0; background: #000; overflow: hidden; 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        @keyframes islandExpand {
          0% { width: 150px; opacity: 0; filter: blur(10px); }
          100% { width: fit-content; opacity: 1; filter: blur(0); }
        }
        @keyframes appleReveal {
          0% { opacity: 0; transform: scale(1.05) translateY(20px); filter: blur(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
      `}</style>
    </main>
  );
}

const st = {
  viewport: { 
    height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', 
    alignItems: 'center', justifyContent: 'space-between', padding: '40px 0',
    backgroundColor: '#000', position: 'relative' 
  },
  meshBG: {
    position: 'absolute', inset: 0, zIndex: 0,
    background: 'radial-gradient(at 50% 10%, #1a1a1c 0%, #000 60%)',
  },

  // Dynamic Island
  islandWrapper: { zIndex: 10, paddingTop: '10px' },
  dynamicIsland: {
    background: '#000', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '100px', minWidth: '180px', height: '36px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 20px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
    animation: 'islandExpand 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  islandSilver: { color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: '500', letterSpacing: '-0.2px' },
  islandGold: { color: '#ffd60a', fontSize: '14px', fontWeight: '700' },

  // Hero Section (Clock)
  centralStack: { 
    zIndex: 5, textAlign: 'center', 
    animation: 'appleReveal 1.5s cubic-bezier(0.16, 1, 0.3, 1)' 
  },
  lockDate: { 
    color: '#fff', fontSize: '20px', fontWeight: '600', 
    letterSpacing: '-0.4px', marginBottom: '8px', opacity: 0.9 
  },
  lockClock: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' },
  tDigit: { 
    fontSize: 'clamp(6rem, 24vw, 16rem)', fontWeight: '700', 
    color: '#fff', letterSpacing: '-10px', lineHeight: '1' 
  },
  tSep: { 
    fontSize: 'clamp(4rem, 15vw, 10rem)', fontWeight: '200', 
    color: 'rgba(255,255,255,0.15)', position: 'relative', top: '-10px' 
  },

  // Widgets
  footer: { zIndex: 5, width: '100%', display: 'flex', justifyContent: 'center' },
  widgetGroup: { animation: 'appleReveal 1.8s cubic-bezier(0.16, 1, 0.3, 1)' },
  widget: {
    background: 'rgba(28, 28, 30, 0.4)', backdropFilter: 'blur(40px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '38px',
    padding: '24px 48px', textAlign: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
  },
  wHeader: { 
    fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.3)', 
    letterSpacing: '4px', marginBottom: '20px' 
  },
  wGrid: { display: 'flex', gap: '30px', alignItems: 'center' },
  wItem: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  wVal: { fontSize: '32px', fontWeight: '600', color: '#fff', letterSpacing: '-1.5px' },
  wLab: { fontSize: '10px', fontWeight: '800', color: 'rgba(255,255,255,0.2)', marginTop: '4px' },
  wLine: { height: '30px', width: '1px', background: 'rgba(255,255,255,0.1)' }
};
