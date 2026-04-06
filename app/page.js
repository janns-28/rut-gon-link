'use client';
import React, { useState, useEffect } from 'react';

// 1. Danh sách ngày lễ đầy đủ - Giữ nguyên sự chuyên nghiệp
const HOLIDAYS = {
  '01-01': 'Tết Dương Lịch - Hết năm rồi, giàu chưa ní?',
  '14-02': 'Valentine - Tầm này chỉ có yêu tiền thôi.',
  '08-03': 'Quốc Tế Phụ Nữ - Cất ví đi sếp, nay tới công chuyện rồi.',
  '30-04': 'Giải Phóng Miền Nam - Nghỉ đi, đừng cố quá.',
  '01-05': 'Quốc Tế Lao Động - Lao động là vinh quang, lang thang là... hết tiền.',
  '19-05': 'Ngày sinh Bác Hồ - Mong Bác sớm về với ví con.',
  '02-09': 'Quốc Khánh Việt Nam - Rực rỡ quá ní ơi!',
  '20-10': 'Ngày Phụ Nữ Việt Nam - Nhớ ting ting cho đúng người nha.',
  '20-11': 'Ngày Nhà Giáo Việt Nam - Tri ân thầy cô.',
  '24-12': 'Giáng Sinh - Ông già Noel không tặng tiền đâu, cày đi.',
  '31-12': 'Đêm Giao Thừa - Chuẩn bị tinh thần sang năm cày tiếp.'
};

// 2. Kho câu nói "Hài Khịa" - Đã nâng cấp cho bớt xàm
const FUNNY_QUOTES = [
  "Tiền không tự sinh ra, nó chỉ chuyển từ túi sếp sang túi... à mà làm gì có túi nào.",
  "Đẹp trai cũng không bằng chai mặt, mà chai mặt cũng không bằng... ting ting.",
  "Lịch hôm nay: 8h dậy, 9h thở, 10h hối hận vì chưa xong camp.",
  "Đừng nhìn đồng hồ nữa, thời gian trôi nhanh như cách người cũ trở mặt vậy.",
  "Thông báo: Hệ thống chưa ghi nhận dấu hiệu giàu có từ bạn. Cố lên!",
  "Sáng ra đừng uống cà phê, uống 'cam' cho nó tỉnh người sếp ạ.",
  "Lương là một thứ rất 'lương thiện', nó đến rồi đi không để lại dấu vết.",
  "Nếu không thể làm một người giàu, hãy làm một người... nghèo sang chảnh.",
  "Đời là những chuyến đi, nhưng sao mình toàn đi... sai hướng?",
  "Thứ duy nhất không phản bội bạn lúc này chỉ có... đống nợ thôi.",
  "Thanh xuân như một tách trà, cày xong đống link hết bà thanh xuân.",
  "Người ta chờ đợi tình yêu, còn tui chờ đợi ngày ngân hàng nhắn tin."
];

export default function SoftAmbientClock() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setMounted(true);
    // Chọn câu nói khịa dựa trên ngày trong năm
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    setQuote(FUNNY_QUOTES[dayOfYear % FUNNY_QUOTES.length]);

    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [now]);

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
        <p style={st.dateStr}>
          {now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
        </p>

        <div style={st.clockRow}>
          <span style={st.bigNum}>{String(now.getHours()).padStart(2, '0')}</span>
          <span style={st.sep}>:</span>
          <span style={st.bigNum}>{String(now.getMinutes()).padStart(2, '0')}</span>
          <span style={st.sep}>:</span>
          <span style={st.bigNum}>{String(now.getSeconds()).padStart(2, '0')}</span>
        </div>

        <div style={st.msgArea}>
          <div style={st.pill}>
            {holiday ? (
              <span style={st.holidayMsg}>✨ {holiday} ✨</span>
            ) : (
              <span style={st.funnyMsg}>💬 {quote}</span>
            )}
          </div>
        </div>

        <div style={st.divider}></div>

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
  container: { textAlign: 'center', padding: '20px', animation: 'fadeIn 1s ease' },
  dateStr: { color: '#6366f1', letterSpacing: '4px', fontWeight: '500', textTransform: 'uppercase', fontSize: '0.85rem', marginBottom: '15px' },
  clockRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' },
  bigNum: { fontSize: 'clamp(4rem, 15vw, 11rem)', fontWeight: '600', color: '#f8fafc', letterSpacing: '-2px' },
  sep: { fontSize: 'clamp(3rem, 12vw, 9rem)', fontWeight: '200', color: '#1a1a20', paddingBottom: '20px' },
  msgArea: { margin: '40px 0 80px 0', display: 'flex', justifyContent: 'center' },
  pill: { background: 'rgba(255,255,255,0.02)', padding: '14px 28px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.05)' },
  holidayMsg: { fontSize: '1.3rem', fontWeight: '700', color: '#fbbf24', textShadow: '0 0 15px rgba(251,191,36,0.3)' },
  funnyMsg: { fontSize: '1.1rem', fontWeight: '500', color: '#64748b', fontStyle: 'italic' },
  divider: { height: '1.5px', width: '60px', background: '#16161a', margin: '40px auto' },
  countLabel: { fontSize: '0.7rem', color: '#334155', fontWeight: '800', letterSpacing: '5px', marginBottom: '25px' },
  grid: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '25px' },
  unit: { display: 'flex', flexDirection: 'column', minWidth: '60px' },
  sNum: { fontSize: '2.2rem', fontWeight: '500', color: '#94a3b8' },
  uL: { fontSize: '0.6rem', color: '#1e293b', fontWeight: '800', marginTop: '5px', letterSpacing: '1px' },
  smallSep: { fontSize: '1.5rem', color: '#16161a', paddingBottom: '20px' }
};
