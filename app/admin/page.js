'use client';
import React, { useState, useEffect } from 'react';

export default function AppleAdminFunctional() {
  const [mounted, setMounted] = useState(false);
  const [links, setLinks] = useState([]); // Đây là nơi chứa link THẬT của ní
  const [newLink, setNewLink] = useState({ title: '', url: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    // GỌI DỮ LIỆU THẬT TỪ DATABASE CỦA NÍ
    fetchData();
    setMounted(true);
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/links'); // Nhớ check đúng path API của ní nha
      const data = await res.json();
      setLinks(data || []);
    } catch (e) {
      console.log("Lỗi lấy dữ liệu thật:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    // Logic thêm link thật của ní vào đây...
    alert("Ní gắn logic POST vào đây là nó chạy vèo vèo nhé!");
  };

  if (!mounted) return <div style={{ backgroundColor: '#000', minHeight: '100vh' }}></div>;

  return (
    <main style={st.viewport}>
      {/* SIDEBAR APPLE STYLE */}
      <aside style={st.sidebar}>
        <div style={st.brand}>
          <div style={st.logo}>B</div>
          <span style={st.brandName}>Dashboard</span>
        </div>
        
        <nav style={st.nav}>
          <div style={{...st.navItem, ...st.navActive}}>
            <svg style={st.icon} fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/></svg>
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
            <p style={st.userRole}>Chủ camp</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <section style={st.content}>
        <header style={st.topBar}>
          <h2 style={st.pageTitle}>Link của tôi</h2>
          <div style={st.headerActions}>
             {/* Form thêm nhanh kiểu Apple Search bar */}
             <form onSubmit={handleAddLink} style={st.quickAdd}>
                <input 
                  placeholder="Tên link..." 
                  style={st.miniInput} 
                  value={newLink.title}
                  onChange={e => setNewLink({...newLink, title: e.target.value})}
                />
                <input 
                  placeholder="Dán URL vào đây..." 
                  style={st.miniInput}
                  value={newLink.url}
                  onChange={e => setNewLink({...newLink, url: e.target.value})}
                />
                <button type="submit" style={st.addButton}>+ Rút gọn ngay</button>
             </form>
          </div>
        </header>

        {/* Thống kê nhanh */}
        <div style={st.statsGrid}>
          <div style={st.statCard}>
            <p style={st.statLabel}>TỔNG CLICKS THẬT</p>
            <h3 style={st.statVal}>
              {links.reduce((acc, curr) => acc + (curr.clicks || 0), 0).toLocaleString()}
            </h3>
          </div>
          <div style={st.statCard}>
            <p style={st.statLabel}>TỔNG SỐ LINK</p>
            <h3 style={st.statVal}>{links.length}</h3>
          </div>
        </div>

        {/* BẢNG DỮ LIỆU THẬT */}
        <div style={st.tableModule}>
          <table style={st.table}>
            <thead>
              <tr style={st.trHead}>
                <th style={st.th}>TIÊU ĐỀ</th>
                <th style={st.th}>LINK ĐÃ RÚT GỌN</th>
                <th style={st.th}>CLICK</th>
                <th style={st.th}>HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{textAlign:'center', padding:'40px', color:'#86868b'}}>Đang tải dữ liệu từ database...</td></tr>
              ) : links.length > 0 ? (
                links.map(link => (
                  <tr key={link.id || link._id} style={st.tr}>
                    <td style={st.tdTitle}>{link.title || 'Không tiêu đề'}</td>
                    <td style={st.tdLink}>{link.shortCode || link.slug}</td>
                    <td style={st.td}>{link.clicks || 0}</td>
                    <td style={st.td}>
                      <button style={st.editBtn}>Xóa</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" style={{textAlign:'center', padding:'40px', color:'#86868b'}}>Chưa có link nào. Tạo cái đầu tiên đi ní!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <style jsx global>{`
        body { margin: 0; background: #000; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; color: #fff; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </main>
  );
}

const st = {
  viewport: { height: '100vh', width: '100vw', display: 'flex', backgroundColor: '#000', overflow: 'hidden' },
  sidebar: { width: '260px', background: 'rgba(28, 28, 30, 0.6)', backdropFilter: 'blur(40px)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '30px 20px' },
  brand: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', paddingLeft: '10px' },
  logo: { width: '32px', height: '32px', background: '#0071e3', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '800', fontSize: '18px' },
  brandName: { fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' },
  nav: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  navItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', borderRadius: '12px', color: '#a1a1a6', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  navActive: { background: 'rgba(0, 113, 227, 0.15)', color: '#0071e3' },
  icon: { width: '20px', height: '20px' },
  userZone: { borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px', display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '10px' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', background: '#3a3a3c', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px', fontWeight: '600' },
  userInfo: { display: 'flex', flexDirection: 'column' },
  userName: { fontSize: '14px', fontWeight: '600', margin: 0 },
  userRole: { fontSize: '12px', color: '#86868b', margin: 0 },
  content: { flex: 1, padding: '40px 60px', overflowY: 'auto', animation: 'fadeIn 0.8s ease-out' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
  pageTitle: { fontSize: '32px', fontWeight: '700', letterSpacing: '-1.2px', margin: 0 },
  headerActions: { display: 'flex', gap: '10px' },
  quickAdd: { display: 'flex', gap: '10px', background: '#1c1c1e', padding: '8px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' },
  miniInput: { background: 'transparent', border: 'none', color: '#fff', fontSize: '14px', outline: 'none', padding: '0 10px', width: '150px' },
  addButton: { background: '#0071e3', border: 'none', borderRadius: '10px', padding: '8px 16px', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '40px' },
  statCard: { background: '#1c1c1e', borderRadius: '24px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' },
  statLabel: { color: '#86868b', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', marginBottom: '10px' },
  statVal: { fontSize: '36px', fontWeight: '700', margin: 0, letterSpacing: '-1px' },
  tableModule: { background: '#1c1c1e', borderRadius: '24px', padding: '30px', border: '1px solid rgba(255,255,255,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { color: '#86868b', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', paddingBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.03)' },
  td: { padding: '20px 0', fontSize: '14px', color: '#f5f5f7' },
  tdTitle: { padding: '20px 0', fontSize: '15px', fontWeight: '600', color: '#fff' },
  tdLink: { padding: '20px 0', fontSize: '14px', color: '#0a84ff' },
  editBtn: { background: 'transparent', border: '1px solid #ff453a', color: '#ff453a', borderRadius: '8px', padding: '6px 16px', fontSize: '12px', cursor: 'pointer' }
};
