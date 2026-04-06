'use client';
import React, { useState, useEffect } from 'react';

const HOLIDAYS = {
  '01-01': 'Tết Dương Lịch - Hết năm rồi, giàu chưa ní?',
  '14-02': 'Valentine - Tầm này chỉ có yêu tiền thôi.',
  '08-03': 'Quốc Tế Phụ Nữ - Cất ví đi sếp, nay tới công chuyện rồi.',
  '30-04': 'Giải Phóng Miền Nam - Nghỉ đi, đừng cố quá.',
  '01-05': 'Quốc Tế Lao Động - Lao động là vinh quang, lang thang là hết tiền.',
  '19-05': 'Ngày sinh Bác Hồ - Mong Bác sớm về đầy ví con.',
  '02-09': 'Quốc Khánh Việt Nam - Rực rỡ quá ní ơi!',
  '24-12': 'Giáng Sinh - Ông già Noel không tặng tiền đâu, cày đi.',
  '31-12': 'Đêm Giao Thừa - Chuẩn bị tinh thần sang năm cày tiếp.'
};

export default function SmoothAmbientClock() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());
  const [dynamicQuote, setDynamicQuote] = useState(''); // ĐỂ TRỐNG BAN ĐẦU

  useEffect(() => {
    setMounted(true);
    
    // TỰ ĐỘNG LẤY CÂU KHÌA TỪ API
    const fetchQuote = async () => {
      try {
        const res = await fetch('/api/random-quote');
        const data = await res.json();
        if (data.quote) setDynamicQuote(data.quote);
      } catch (e) {
        setDynamicQuote("Cày tiếp đi ní, đừng hóng hớt!");
      }
    };

    fetchQuote();
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Nếu Server đang render thì hiện màn hình đen để không bị chớp trắng
  if (!mounted) return <div style={{ backgroundColor: '#050505', minHeight: '100vh' }}></div>;

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
    <div style={st.wrap}>
      <div style={st.container}>
        {/* Ngày tháng năm */}
        <p style={st.dateStr}>
          {now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </p>

        {/* Đồng hồ lớn (Font Quicksand bo tròn) */}
        <div style={st.clockRow}>
          <span style={st.bigNum}>{String(now.getHours()).padStart(2, '0')}</span>
          <span style={st.sep}>:</span>
          <span style={st.bigNum}>{String(now.getMinutes()).padStart(2, '0')}</span>
          <span style={st.sep}>:</span>
          <span style={st.bigNum}>{String(now.getSeconds()).padStart(2, '0')}</span>
        </div>

        {/* Vùng hiển thị Lễ hoặc Câu Khịa */}
        <div style={st.msgArea}>
          {/* Chỉ hiện cái pill khi đã có dữ liệu hoặc là ngày lễ */}
          {(holiday || dynamicQuote) && (
            <div style={{...st.pill, opacity: (holiday || dynamicQuote) ? 1 : 0}}>
              {holiday ? (
                <span style={st.holidayMsg}>✨ {holiday} ✨</span>
              ) : (
                <span style={st.funnyMsg}>💬 {dynamicQuote}</span>
              )}
            </div>
          )}
        </div>

        <div style={st.divider}></div>

        {/* Đếm ngược cuối năm */}
        <div style={st.countdownArea}>
          <p style={st.countLabel}>HÀNH TRÌNH ĐẾN NĂM MỚI {nextYear}</p>
          <div style={st.grid}>
            <div style={st.unit}><span style={st.sNum}>{d}</span><span style={st.uL}>Ngày</span></div>
            <div style={st.smallSep}>:</div>
            <div style={st.unit}><span style={st.sNum}>{String(h).padStart(2, '0')}</span><span style={st.uL}>Giờ</span></div>
            <div style={st.smallSep}>:</div>
            <div style={st.unit}><span style={st.sNum}>{String(m).padStart(2, '0')}</span><span style={st.uL}>Phút</span></div>
            <div style={st.smallSep}>:</div>
            <div style={st.unit}><span style={st.sNum}>{String(s).padStart(2, '0')}</span><span style={st.uL}>Giây</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

const st = {
  wrap: { height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle at center, #111115 0%, #050505 100%)' },
  container: { textAlign: 'center', padding: '20px', animation: 'fadeIn 1.2s ease' },
  dateStr: { color: '#6366f1', letterSpacing: '4px', fontWeight: '500', textTransform: 'uppercase', fontSize: '0.85rem', marginBottom: '15px' },
  clockRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' },
  bigNum: { fontSize: 'clamp(4rem, 15vw, 11rem)', fontWeight: '600', color: '#f8fafc', letterSpacing: '-2px' },
  sep: { fontSize: 'clamp(3rem, 12vw, 9rem)', fontWeight: '200', color: '#16161a', paddingBottom: '20px' },
  msgArea: { margin: '40px 0 80px 0', display: 'flex', justifyContent: 'center', minHeight: '60px' },
  pill: { background: 'rgba(255,255,255,0.02)', padding: '14px 28px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.05)', transition: 'opacity 0.8s ease-in' },
  holidayMsg: { fontSize: '1.3rem', fontWeight: '700', color: '#fbbf24', textShadow: '0 0 15px rgba(251,191,36,0.3)' },
  funnyMsg: { fontSize: '1.1rem', fontWeight: '500', color: '#64748b', fontStyle: 'italic' },
  divider: { height: '1.5px', width: '60px', background: '#16161a', margin: '40px auto' },
  countLabel: { fontSize: '0.7rem', color: '#334155', fontWeight: '800', letterSpacing: '5px', marginBottom: '25px' },
  grid: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '25px' },
  unit: { display: 'flex', flexDirection: 'column', minWidth: '60px' },
  sNum: { fontSize: '2.2rem', fontWeight: '500', color: '#94a3b8' },
  uL: { fontSize: '0.6rem', color: '#1e293b', fontWeight: '800', marginTop: '5px' },
  smallSep: { fontSize: '1.5rem', color: '#16161a', paddingBottom: '20px' }
};
