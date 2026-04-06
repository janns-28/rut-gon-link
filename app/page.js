'use client';
import React, { useState, useEffect } from 'react';

const HOLIDAYS = {
  '01-01': 'Tết Dương Lịch', '14-02': 'Lễ Tình Nhân', '08-03': 'Quốc Tế Phụ Nữ',
  '26-03': 'Ngày Thành Lập Đoàn', '01-04': 'Cá Tháng Tư', '30-04': 'Giải Phóng Miền Nam',
  '01-05': 'Quốc Tế Lao Động', '19-05': 'Ngày Sinh Bác Hồ', '01-06': 'Quốc Tế Thiếu Nhi',
  '21-06': 'Ngày Báo Chí', '28-06': 'Ngày Gia Đình', '27-07': 'Ngày Thương Binh Liệt Sĩ',
  '02-09': 'Quốc Khánh VN', '10-10': 'Giải Phóng Thủ Đô', '20-10': 'Ngày Phụ Nữ VN',
  '31-10': 'Lễ Hội Halloween', '20-11': 'Ngày Nhà Giáo VN', '22-12': 'Ngày Thành Lập Quân Đội',
  '24-12': 'Giáng Sinh', '31-12': 'Giao Thừa'
};

const FUNNY_QUOTES = [
  "Nay ngày thường, lo làm đi đừng có mơ lễ ní ơi.",
  "Thông báo: Bạn vẫn chưa giàu, tắt web đi cày tiếp đi.",
  "Ngày hôm nay tuyệt vời để... nhịn ăn tiết kiệm.",
  "Lịch báo: Nay là ngày bạn đẹp trai hơn hôm qua một xíu.",
  "Đừng nhìn đồng hồ nữa, thời gian không đợi ai, trừ khi bạn nợ tiền.",
  "Hôm nay trời đẹp, thích hợp để ting ting nhưng ví lại im re.",
  "Ngày bình thường, tim vẫn đập nhưng lương chưa về.",
  "Quốc tế ngày 'Đi cày', không có nghỉ đâu sếp."
];

export default function SoftAmbientClock() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setMounted(true);
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    setQuote(FUNNY_QUOTES[dayOfYear % FUNNY_QUOTES.length]);
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return <div style={{ backgroundColor: '#050505', minHeight: '100vh' }}></div>;

  const target = new Date(`January 1, ${now.getFullYear() + 1} 00:00:00`).getTime();
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
        {/* Ngày tháng nhỏ nhắn phía trên */}
        <p style={st.dateText}>
          {now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </p>

        {/* Đồng hồ chính: To, Mềm, Không viền */}
        <div style={st.clockRow}>
          <span style={st.bigNum}>{String(now.getHours()).padStart(2, '0')}</span>
          <span style={st.dot}>:</span>
          <span style={st.bigNum}>{String(now.getMinutes()).padStart(2, '0')}</span>
          <span style={st.dot}>:</span>
          <span style={st.bigNum}>{String(now.getSeconds()).padStart(2, '0')}</span>
        </div>

        {/* Thông báo trôi nổi */}
        <div style={st.msgRow}>
          {holiday ? (
            <div style={st.holidayPill}>✨ {holiday} ✨</div>
          ) : (
            <div style={st.funnyPill}>{quote}</div>
          )}
        </div>

        {/* Đếm ngược tinh tế phía dưới */}
        <div style={st.footer}>
          <p style={st.footLabel}>ĐẾM NGƯỢC ĐẾN {now.getFullYear() + 1}</p>
          <div style={st.grid}>
            <div style={st.u}><span style={st.sNum}>{d}</span><span style={st.uL}>Ngày</span></div>
            <div style={st.sSep}>:</div>
            <div style={st.u}><span style={st.sNum}>{String(h).padStart(2, '0')}</span><span style={st.uL}>Giờ</span></div>
            <div style={st.sSep}>:</div>
            <div style={st.u}><span style={st.sNum}>{String(m).padStart(2, '0')}</span><span style={st.uL}>Phút</span></div>
            <div style={st.sSep}>:</div>
            <div style={st.u}><span style={st.sNum}>{String(s).padStart(2, '0')}</span><span style={st.uL}>Giây</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

const st = {
  wrap: { height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle at center, #111115 0%, #050505 100%)' },
  container: { textAlign: 'center', animation: 'fadeIn 1.5s ease' },
  dateText: { color: '#6366f1', fontSize: '0.9rem', fontWeight: '500', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '10px' },
  clockRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' },
  bigNum: { fontSize: 'clamp(4rem, 15vw, 11rem)', fontWeight: '600', color: '#f8fafc', letterSpacing: '-2px' },
  dot: { fontSize: 'clamp(3rem, 12vw, 9rem)', fontWeight: '200', color: '#1e1e24', paddingBottom: '20px' },
  msgRow: { margin: '40px 0 80px 0', display: 'flex', justifyContent: 'center' },
  holidayPill: { color: '#fbbf24', fontSize: '1.4rem', fontWeight: '600', textShadow: '0 0 20px rgba(251,191,36,0.3)' },
  funnyPill: { color: '#64748b', fontSize: '1.2rem', fontWeight: '400', fontStyle: 'italic' },
  footer: { opacity: 0.6 },
  footLabel: { fontSize: '0.7rem', color: '#475569', letterSpacing: '6px', marginBottom: '20px', fontWeight: '700' },
  grid: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '25px' },
  u: { display: 'flex', flexDirection: 'column', minWidth: '60px' },
  sNum: { fontSize: '2.2rem', fontWeight: '500', color: '#cbd5e1' },
  uL: { fontSize: '0.6rem', color: '#334155', textTransform: 'uppercase', marginTop: '5px', fontWeight: '700' },
  sSep: { fontSize: '1.5rem', color: '#16161a', paddingBottom: '20px' }
};
