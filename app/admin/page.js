'use client';
import React, { useState, useEffect } from 'react';

export default function AppleAdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [links, setLinks] = useState([
    { id: 1, title: 'Chiến dịch iPhone 15', short: 'btt.li/ip15', clicks: 1240, status: 'Active' },
    { id: 2, title: 'Landing Page TikTok', short: 'btt.li/tt-bio', clicks: 856, status: 'Active' },
    { id: 3, title: 'Black Friday Sale', short: 'btt.li/bf2026', clicks: 3102, status: 'Paused' },
  ]);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ backgroundColor: '#000', minHeight: '100vh' }}></div>;

  return (
    <main style={st.viewport}>
      {/* 1. SIDEBAR - Style macOS Finder */}
      <aside style={st.sidebar}>
        <div style={st.brand}>
          <div style={st.logo}>B</div>
          <span style={st.brandName}>Admin</span>
        </div>
        
        <nav style={st.nav}>
          <div style={{...st.navItem, ...st.navActive}}>
            <svg style={st.icon} fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/></svg>
            Tổng quan
          </div>
          <div style={st.navItem}>
            <svg style={st.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
            Quản lý Link
          </div>
          <div style={st.navItem}>
            <svg style={st.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10m18 0v-6a2 2 0 00-2-2h-2a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v14a2 2 0 002 2h2a2 2 0 002-2z"/></svg>
            Thống kê
          </div>
        </nav>

        <div style={st.userZone}>
          <div style={st.avatar}>BT</div>
          <div style={st.userInfo}>
            <p style={st.userName}>binhtienti</p>
            <p style={st.userRole}>Super Admin</p>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <section style={st.content}>
        <header style={st.topBar}>
          <h2 style={st.pageTitle}>Tổng quan chiến dịch</h2>
          <button style={st.addButton}>+ Tạo Link mới</button>
        </header>

        {/* Stats Grid */}
        <div style={st.statsGrid}>
          <div style={st.statCard}>
            <p style={st.statLabel}>Tổng Click</p>
            <h3 style={st.statVal}>45.2K</h3>
            <span style={st.statTrend}>↑ 12% so với tháng trước</span>
          </div>
          <div style={st.statCard}>
            <p style={st.statLabel}>Link đang chạy</p>
            <h3 style={st.statVal}>128</h3>
            <span style={st.statTrend}>Mới tạo 4 link hôm nay</span>
          </div>
          <div style={st.statCard}>
            <p style={st.statLabel}>Tỉ lệ chuyển đổi</p>
            <h3 style={st.statVal}>8.4%</h3>
            <span style={{...st.statTrend, color: '#ff453a'}}>↓ 2% tuần này</span>
          </div>
        </div>

        {/* Data Table Area */}
        <div style={st.tableModule}>
          <div style={st.tableHeader}>
            <h4 style={st.moduleTitle}>Danh sách Link Affiliate</h4>
            <input type="text" placeholder="Tìm kiếm link..." style={st.searchInput} />
          </div>
          
          <table style={st.table}>
            <thead>
              <tr style={st.trHead}>
                <th style={st.th}>TÊN CHIẾN DỊCH</th>
                <th style={st.th}>LINK RÚT GỌN</th>
                <th style={st.th}>CLICKS</th>
                <th style={st.th}>TRẠNG THÁI</th>
                <th style={st.th}>HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {links.map(link => (
                <tr key={link.id} style={st.tr}>
                  <td style={st.tdTitle}>{link.title}</td>
                  <td style={st.tdLink}>{link.short}</td>
                  <td style={st.td}>{link.clicks.toLocaleString()}</td>
                  <td style={st.td}>
                    <span style={link.status === 'Active' ? st.statusActive : st.statusPaused}>
                      {link.status}
                    </span>
                  </td>
                  <td style={st.td}>
                    <button style={st.editBtn}>Sửa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <style jsx global>{`
        body { margin: 0; background: #000; font-family: 'Inter', -apple-system, sans-serif; -webkit-font-smoothing: antialiased; color: #fff; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </main>
  );
}

const st = {
  viewport: { height: '100vh', width: '100vw', display: 'flex', backgroundColor: '#000', overflow: 'hidden' },
  
  // Sidebar Style
  sidebar: {
    width: '260px', background: 'rgba(28, 28, 30, 0.6)', backdropFilter: 'blur(40px)',
    borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '30px 20px'
  },
  brand: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', paddingLeft: '10px' },
  logo: { width: '32px', height: '32px', background: '#0071e3', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '800', fontSize: '18px' },
  brandName: { fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' },
  
  nav: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  navItem: { 
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', borderRadius: '12px',
    color: '#a1a1a6', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' 
  },
  navActive: { background: 'rgba(0, 113, 227, 0.15)', color: '#0071e3' },
  icon: { width: '20px', height: '20px' },

  userZone: { borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '10px' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', background: '#3a3a3c', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px', fontWeight: '600' },
  userInfo: { display: 'flex', flexDirection: 'column' },
  userName: { fontSize: '14px', fontWeight: '600', margin: 0 },
  userRole: { fontSize: '12px', color: '#86868b', margin: 0 },

  // Content Style
  content: { flex: 1, padding: '40px 60px', overflowY: 'auto', animation: 'fadeIn 0.8s ease-out' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
  pageTitle: { fontSize: '32px', fontWeight: '700', letterSpacing: '-1.2px', margin: 0 },
  addButton: { background: '#0071e3', border: 'none', borderRadius: '100px', padding: '10px 24px', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' },
  statCard: { background: '#1c1c1e', borderRadius: '24px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' },
  statLabel: { color: '#86868b', fontSize: '13px', fontWeight: '600', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '1px' },
  statVal: { fontSize: '36px', fontWeight: '700', margin: '0 0 8px 0', letterSpacing: '-1px' },
  statTrend: { fontSize: '12px', color: '#30d158', fontWeight: '500' },

  tableModule: { background: '#1c1c1e', borderRadius: '24px', padding: '30px', border: '1px solid rgba(255,255,255,0.05)' },
  tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
  moduleTitle: { fontSize: '18px', fontWeight: '600', margin: 0 },
  searchInput: { background: '#2c2c2e', border: 'none', borderRadius: '8px', padding: '10px 15px', color: '#fff', width: '250px', fontSize: '14px' },

  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { color: '#86868b', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.03)' },
  td: { padding: '20px 0', fontSize: '14px', color: '#f5f5f7' },
  tdTitle: { padding: '20px 0', fontSize: '15px', fontWeight: '600', color: '#fff' },
  tdLink: { padding: '20px 0', fontSize: '14px', color: '#0a84ff' },
  
  statusActive: { background: 'rgba(48, 209, 88, 0.1)', color: '#30d158', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '600' },
  statusPaused: { background: 'rgba(255, 69, 58, 0.1)', color: '#ff453a', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '600' },
  editBtn: { background: 'transparent', border: '1px solid #424245', color: '#fff', borderRadius: '8px', padding: '6px 16px', fontSize: '12px', cursor: 'pointer' }
};
