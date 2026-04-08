'use client';
import React, { useEffect, useState } from 'react';

export default function TopVayPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    document.title = 'Top Giải Pháp Tài Chính - Uy Tín';
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ backgroundColor: '#000', minHeight: '100vh' }}></div>;

  // DANH SÁCH 3 APP VAY MÀY ĐANG CHẠY (Thay link affiliate thật của mày vào ô link)
  const apps = [
    {
      id: 1,
      name: 'Moneyveo',
      desc: 'Duyệt auto 5 phút. Khuyên dùng số 1 🌟',
      badge: 'Dễ duyệt nhất',
      color: '#eab308',
      link: 'https://link-affiliate-moneyveo-cua-may.com'
    },
    {
      id: 2,
      name: 'DoctorDong',
      desc: 'Hỗ trợ nợ xấu, giải ngân 24/7.',
      badge: 'Nợ xấu OK',
      color: '#ef4444',
      link: 'https://link-affiliate-doctordong-cua-may.com'
    },
    {
      id: 3,
      name: 'Jeff App',
      desc: 'Khoản vay linh hoạt, lãi suất 0% lần đầu.',
      badge: 'Miễn lãi',
      color: '#3b82f6',
      link: 'https://link-affiliate-jeff-cua-may.com'
    }
  ];

  return (
    <main style={st.viewport}>
      <div style={st.container}>
        <div style={st.header}>
          <div style={st.shieldIcon}>🛡️</div>
          <h1 style={st.title}>Top 3 Đối Tác Uy Tín Nhất</h1>
          <p style={st.subtitle}>Hãy đăng ký cả 3 để tăng tỷ lệ nhận tiền thành công lên 99%.</p>
        </div>

        <div style={st.list}>
          {apps.map((app) => (
            <div key={app.id} style={st.card}>
              <div style={st.cardHeader}>
                <div style={st.appName}>{app.name}</div>
                <div style={{ ...st.badge, backgroundColor: `${app.color}15`, color: app.color }}>
                  {app.badge}
                </div>
              </div>
              <p style={st.desc}>{app.desc}</p>
              
              <a href={app.link} style={st.button} target="_blank" rel="noopener noreferrer">
                Đăng ký ngay
              </a>
            </div>
          ))}
        </div>

        <p style={st.footerNote}>Hoàn toàn bảo mật & Miễn phí dịch vụ.</p>
      </div>

      <style jsx global>{`
        body { margin: 0; background: #000; font-family: -apple-system, sans-serif; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </main>
  );
}

const st = {
  viewport: { minHeight: '100vh', display: 'flex', justifyContent: 'center', backgroundColor: '#000', padding: '40px 20px' },
  container: { width: '100%', maxWidth: '400px', animation: 'fadeUp 0.6s ease' },
  header: { textAlign: 'center', marginBottom: '30px' },
  shieldIcon: { fontSize: '48px', marginBottom: '10px' },
  title: { color: '#f5f5f7', fontSize: '24px', fontWeight: '700', margin: '0 0 10px 0', letterSpacing: '-0.5px' },
  subtitle: { color: '#86868b', fontSize: '15px', lineHeight: '1.5' },
  list: { display: 'flex', flexDirection: 'column', gap: '15px' },
  card: { background: '#1d1d1f', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  appName: { color: '#fff', fontSize: '18px', fontWeight: '600' },
  badge: { padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: '600' },
  desc: { color: '#a1a1a6', fontSize: '14px', marginBottom: '20px', lineHeight: '1.4' },
  button: { 
    display: 'block', width: '100%', padding: '14px 0', background: '#0071e3', color: '#fff', 
    textAlign: 'center', borderRadius: '12px', textDecoration: 'none', fontWeight: '600', fontSize: '15px',
    transition: 'background 0.2s'
  },
  footerNote: { textAlign: 'center', color: '#424245', fontSize: '13px', marginTop: '30px' }
};
