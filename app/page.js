'use client';
import React, { useState, useEffect } from 'react';

const HOLIDAYS = {
  '01-01': 'Tết Dương Lịch - Khởi đầu rực rỡ!',
  '14-02': 'Lễ Tình Nhân - Nay có quà chưa ní?',
  '08-03': 'Quốc Tế Phụ Nữ - Nhớ nịnh vợ nha.',
  '30-04': 'Giải Phóng Miền Nam - Nghỉ lễ thôi!',
  '01-05': 'Quốc Tế Lao Động - Nghỉ ngơi đi ní.',
  '19-05': 'Ngày sinh Chủ tịch Hồ Chí Minh',
  '02-09': 'Quốc Khánh Việt Nam - Rợp trời cờ hoa!',
  '20-10': 'Ngày Phụ Nữ Việt Nam - Tôn vinh phái đẹp.',
  '20-11': 'Ngày Nhà Giáo Việt Nam - Tri ân thầy cô.',
  '24-12': 'Đêm Giáng Sinh - Giáng sinh an lành!',
  '25-12': 'Lễ Giáng Sinh',
  '31-12': 'Đêm Giao Thừa - Quẩy thôi!'
};

const FUNNY_QUOTES = [
  "Hôm nay không có lễ gì đâu, đi cày tiếp đi ní.",
  "Ngày bình thường, tim vẫn đập nhưng ví chưa tăng.",
  "Không lễ lộc gì hết, bớt ảo tưởng và làm việc đi.",
  "Nay là một ngày tuyệt vời để... ngủ tiếp.",
  "Chưa tới cuối tuần đâu, đừng có mà mơ sớm.",
  "Thông báo: Hôm nay bạn vẫn chưa trúng số đâu.",
  "Đời là những chuyến đi, nhưng nay thì đi làm.",
  "Hôm nay đẹp trời, thích hợp để... không làm gì cả."
];

export default function SofterClock() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setMounted(true);
    // Chọn câu nói dựa trên ngày trong năm
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    setQuote(FUNNY_QUOTES[dayOfYear % FUNNY_QUOTES.length]);

    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [now]);

  if (!mounted) return <div style={{ backgroundColor: '#0f1115', minHeight: '100vh' }}></div>;

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
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <p style={styles.dateStr}>
          {now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </p>

        <div style={styles.clockRow}>
          <span style={styles.bigNum}>{String(now.getHours()).padStart(2, '0')}</span>
          <span style={styles.sep}>:</span>
          <span style={styles.bigNum}>{String(now.getMinutes()).padStart(2, '0')}</span>
          <span style={styles.sep}>:</span>
          <span style={styles.bigNum}>{String(now.getSeconds()).padStart(2, '0')}</span>
        </div>

        <div style={styles.msgArea}>
          <div style={styles.pill}>
            {holiday ? (
              <span style={styles.holidayMsg}>✨ {holiday} ✨</span>
            ) : (
              <span style={styles.funnyMsg}>💬 {quote}</span>
            )}
          </div>
        </div>

        <div style={styles.divider}></div>

        <div style={styles.countdownArea}>
          <p style={styles.countLabel}>HÀNH TRÌNH ĐẾN NĂM {nextYear}</p>
          <div style={styles.timerGrid}>
            <div style={styles.unit}><span style={styles.smallNum}>{d}</span><span style={styles.unitLab}>NGÀY</span></div>
            <div style={styles.smallSep}>:</div>
            <div style={styles.unit}><span style={styles.smallNum}>{String(h).padStart(2, '0')}</span><span style={styles.unitLab}>GIỜ</span></div>
            <div style={styles.smallSep}>:</div>
            <div style={styles.unit}><span style={styles.smallNum}>{String(m).padStart(2, '0')}</span><span style={styles.unitLab}>PHÚT</span></div>
            <div style={styles.smallSep}>:</div>
            <div style={styles.unit}><span style={styles.smallNum}>{String(s).padStart(2, '0')}</span><span style={styles.unitLab}>GIÂY</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: { height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle at center, #1e1b4b 0%, #0f1115 100%)' },
  container: { textAlign: 'center', padding: '20px' },
  dateStr: { color: '#818cf8', letterSpacing: '4px', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.9rem', marginBottom: '20px' },
  clockRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
  bigNum: { fontSize: 'clamp(3.5rem, 12vw, 9rem)', fontWeight: '800', color: '#f8fafc', letterSpacing: '-4px' },
  sep: { fontSize: 'clamp(2.5rem, 10vw, 7rem)', fontWeight: '200', color: '#334155', paddingBottom: '15px' },
  msgArea: { margin: '40px 0', display: 'flex', justifyContent: 'center' },
  pill: { background: 'rgba(255,255,255,0.03)', padding: '12px 25px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.08)' },
  holidayMsg: { fontSize: '1.2rem', fontWeight: '700', color: '#fbbf24' },
  // FIX LỖI Ở ĐÂY: Thêm dấu nháy đơn vào 'italic'
  funnyMsg: { fontSize: '1.1rem', fontWeight: '500', color: '#94a3b8', fontStyle: 'italic' },
  divider: { height: '1.5px', width: '80px', background: '#1e293b', margin: '40px auto' },
  countLabel: { fontSize: '0.75rem', color: '#475569', fontWeight: '800', letterSpacing: '5px', marginBottom: '25px' },
  timerGrid: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' },
  unit: { display: 'flex', flexDirection: 'column', minWidth: '60px' },
  smallNum: { fontSize: '2.2rem', fontWeight: '700', color: '#cbd5e1' },
  unitLab: { fontSize: '0.65rem', color: '#475569', fontWeight: '800', marginTop: '5px' },
  smallSep: { fontSize: '1.8rem', color: '#1e293b', paddingBottom: '20px' }
};
