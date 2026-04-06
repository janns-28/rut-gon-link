'use client';
import React, { useState, useEffect } from 'react';

const HOLIDAYS = {
  '01-01': 'Tết Dương Lịch', '14-02': 'Valentine', '08-03': 'International Women\'s Day',
  '30-04': 'Reunification Day', '01-05': 'Labour Day', '02-09': 'Independence Day',
  '24-12': 'Christmas Eve', '31-12': 'New Year\'s Eve'
};

export default function AppleStyleClock() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());
  const [dynamicQuote, setDynamicQuote] = useState('');

  useEffect(() => {
    // Nạp phông Inter - chuẩn mực của sự chuyên nghiệp
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap';
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
    <div style={st.viewport}>
      {/* Mesh Gradient nền - cực sang */}
      <div style={st.meshBG}></div>

      <div style={st.mainContainer}>
        {/* Top Section: Date & Dynamic Message */}
        <header style={st.header}>
          <p style={st.topDate}>
            {now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long' }).toUpperCase()}
          </p>
          <div style={st.statusArea}>
            <span style={holiday ? st.holidayText : st.quoteText}>
              {holiday ? `✦ ${holiday}` : dynamicQuote ? `“ ${dynamicQuote} ”` : ''}
            </span>
          </div>
        </header>

        {/* Middle Section: Hero Clock */}
        <section style={st.clockSection}>
          <div style={st.clockWrapper}>
            <span style={st.timeDigit}>{String(now.getHours()).padStart(2, '0')}</span>
            <span style={st.timeSep}>:</span>
            <span style={st.timeDigit}>{String(now.getMinutes()).padStart(2, '0')}</span>
            <span style={st.timeSep}>:</span>
            <span style={st.timeDigit}>{String(now.getSeconds()).padStart(2, '0')}</span>
          </div>
        </section>

        {/* Bottom Section: Apple Widget Style Countdown */}
        <footer style={st.footer}>
          <div style={st.widget}>
            <p style={st.widgetTitle}>COUNTDOWN TO {nextYear}</p>
            <div style={st.grid}>
              <div style={st.gridItem}><span style={st.gridVal}>{d}</span><span style={st.gridLab}>DAYS</span></div>
              <div style={st.gridItem}><span style={st.gridVal}>{String(h).padStart(2, '0')}</span><span style={st.gridLab}>HRS</span></div>
              <div style={st.gridItem}><span style={st.gridVal}>{String(m).padStart(2, '0')}</span><span style={st.gridLab}>MIN</span></div>
              <div style={st.gridItem}><span style={st.gridVal}>{String(s).padStart(2, '0')}</span><span style={st.gridLab}>SEC</span></div>
            </div>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        body { margin: 0; background: #000; overflow: hidden; }
        @keyframes clockIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); filter: blur(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        @keyframes textReveal {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const st = {
  viewport: { 
    height: '100vh', width: '100vw', position: 'relative', 
    backgroundColor: '#000', display: 'flex', overflow: 'hidden',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  meshBG: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: `
      radial-gradient(at 0% 0%, hsla(253,16%,12%,1) 0, transparent 50%), 
      radial-gradient(at 100% 0%, hsla(225,39%,15%,1) 0, transparent 50%),
      radial-gradient(at 50% 100%, hsla(253,16%,7%,1) 0, transparent 50%)
    `,
    zIndex: 1
  },
  mainContainer: {
    position: 'relative', zIndex: 2, width: '100%', 
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    padding: '60px 40px', boxSizing: 'border-box'
  },
  header: { textAlign: 'center', animation: 'textReveal 1s ease-out' },
  topDate: { 
    color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: '700', 
    letterSpacing: '5px', margin: '0 0 15px 0' 
  },
  statusArea: { minHeight: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  quoteText: { 
    color: '#fff', fontSize: '17px', fontWeight: '400', 
    letterSpacing: '-0.2px', opacity: 0.8, fontStyle: 'italic'
  },
  holidayText: { 
    color: '#fff', fontSize: '18px', fontWeight: '600', 
    background: 'linear-gradient(90deg, #ff7e5f, #feb47b)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
  },
  clockSection: { 
    flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center',
    animation: 'clockIn 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
  },
  clockWrapper: { display: 'flex', alignItems: 'baseline', gap: '8px' },
  timeDigit: { 
    fontSize: 'clamp(5rem, 18vw, 14rem)', fontWeight: '800', color: '#fff', 
    letterSpacing: '-8px', lineHeight: '1' 
  },
  timeSep: { 
    fontSize: 'clamp(3rem, 10vw, 8rem)', fontWeight: '300', color: 'rgba(255,255,255,0.1)',
    position: 'relative', top: '-10px'
  },
  footer: { display: 'flex', justifyContent: 'center', animation: 'textReveal 1.5s ease-out' },
  widget: {
    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '32px', padding: '30px 60px', backdropFilter: 'blur(20px)'
  },
  widgetTitle: { 
    fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.3)', 
    letterSpacing: '4px', margin: '0 0 20px 0', textAlign: 'center' 
  },
  grid: { display: 'flex', gap: '40px', alignItems: 'center' },
  gridItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px' },
  gridVal: { fontSize: '32px', fontWeight: '700', color: '#fff', letterSpacing: '-1px' },
  gridLab: { fontSize: '10px', fontWeight: '800', color: 'rgba(255,255,255,0.2)', marginTop: '8px', letterSpacing: '1px' }
};
