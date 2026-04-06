'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// GIỮ NGUYÊN LOGIC XỬ LÝ NETWORK GỐC
const getNetworkInfo = (url) => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('dinos.click')) return { name: 'Dinos', bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' };
  if (lowerUrl.includes('hl-link')) return { name: 'Hyperlead', bg: '#e0e7ff', text: '#4f46e5', border: '#a5b4fc' };
  if (lowerUrl.includes('accesstrade')) return { name: 'Accesstrade', bg: '#fef3c7', text: '#d97706', border: '#fcd34d' };
  if (lowerUrl.includes('masoffer')) return { name: 'MasOffer', bg: '#dcfce7', text: '#16a34a', border: '#86efac' };
  if (lowerUrl.includes('facebook.com')) return { name: 'Social', bg: '#dbeafe', text: '#2563eb', border: '#93c5fd' };
  return { name: 'Direct', bg: '#f3f4f6', text: '#4b5563', border: '#d1d5db' };
};

export default function ApplePremiumAdmin() {
  // --- GIỮ NGUYÊN TOÀN BỘ STATE GỐC ---
  const [links, setLinks] = useState([]);
  const [clickLogs, setClickLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [activeTab, setActiveTab] = useState('links');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Nạp phông chữ Inter chuẩn Apple
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    setMounted(true);

    async function fetchData() {
      const [linksRes, logsRes] = await Promise.all([
        supabase.from('links').select('*').order('created_at', { ascending: false }),
        supabase.from('click_logs').select('*')
      ]);
      if (linksRes.data) setLinks(linksRes.data);
      if (logsRes.data) setClickLogs(logsRes.data);
      setLoading(false);
    }
    fetchData();
  }, []);

  // --- GIỮ NGUYÊN LOGIC XỬ LÝ DỮ LIỆU GỐC ---
  const filteredLinks = links.filter(l => 
    l.slug.toLowerCase().includes(search.toLowerCase()) || 
    l.original_url.toLowerCase().includes(search.toLowerCase())
  );

  const groupedLinks = filteredLinks.reduce((acc, link) => {
    const netInfo = getNetworkInfo(link.original_url);
    const netName = netInfo.name;
    if (!acc[netName]) acc[netName] = { info: netInfo, items: [] };
    acc[netName].items.push(link);
    return acc;
  }, {});

  const toggleGroup = (netName) => {
    setExpandedGroups(prev => ({ ...prev, [netName]: !prev[netName] }));
  };

  const handleCopy = (slug) => {
    const fullUrl = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setToast(`📋 Đã copy: /${slug}`);
    setTimeout(() => setToast(''), 2500);
  };

  const handleDelete = async (slug) => {
    const confirm = window.confirm(`Ông có chắc chắn muốn xóa vĩnh viễn link /${slug} không?`);
    if (!confirm) return;
    const previousLinks = [...links];
    setLinks(links.filter(l => l.slug !== slug));
    setToast(`🗑️ Đang dọn dẹp /${slug}...`);
    try {
      const res = await fetch('/api/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) });
      if (!res.ok) throw new Error('Lỗi từ Server');
      setToast(`✅ Đã bay màu /${slug}!`);
    } catch (error) {
      setLinks(previousLinks);
      setToast(`❌ Lỗi rồi ní ơi!`);
    }
    setTimeout(() => setToast(''), 3000);
  };

  // --- LOGIC THỐNG KÊ GỐC ---
  const clickCounts = clickLogs.reduce((acc, log) => { acc[log.slug] = (acc[log.slug] || 0) + 1; return acc; }, {});
  const topLinks = Object.entries(clickCounts)
    .map(([slug, count]) => {
      const linkData = links.find(l => l.slug === slug);
      return { slug, count, originalUrl: linkData?.original_url || 'N/A', network: linkData ? getNetworkInfo(linkData.original_url).name : 'Unknown' };
    })
    .sort((a, b) => b.count - a.count);

  const referrerCounts = clickLogs.reduce((acc, log) => {
    let ref = log.referrer || 'Direct (Truy cập thẳng)';
    const lowerRef = ref.toLowerCase();
    if (lowerRef.includes('facebook.com')) ref = 'Facebook';
    else if (lowerRef.includes('tiktok.com')) ref = 'TikTok';
    else if (lowerRef.includes('threads.net')) ref = 'Threads';
    else if (lowerRef.startsWith('http')) { try { ref = new URL(ref).hostname; } catch(e){} }
    acc[ref] = (acc[ref] || 0) + 1;
    return acc;
  }, {});
  const topReferrers = Object.entries(referrerCounts).sort((a, b) => b[1] - a[1]);

  const deviceCounts = clickLogs.reduce((acc, log) => {
    const ua = (log.user_agent || '').toLowerCase();
    let device = 'Khác';
    if (ua.includes('iphone') || ua.includes('ipad')) device = 'iOS (Apple)';
    else if (ua.includes('android')) device = 'Android';
    else if (ua.includes('windows')) device = 'Windows PC';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {});
  const topDevices = Object.entries(deviceCounts).sort((a, b) => b[1] - a[1]);

  if (!mounted) return <div style={{ background: '#000', minHeight: '100vh' }}></div>;

  return (
    <div style={st.viewport}>
      {/* TOAST DYNAMIC ISLAND STYLE */}
      {toast && (
        <div style={st.toastIsland}>
          {toast}
        </div>
      )}

      {/* SIDEBAR APPLE VIBRANCY */}
      <aside style={st.sidebar}>
        <div style={st.brand}>
          <div style={st.logo}>B</div>
          <span style={st.brandName}>BINHTIENTI</span>
        </div>
        
        <nav style={st.nav}>
          <button onClick={() => setActiveTab('links')} style={{...st.navItem, ...(activeTab === 'links' ? st.navActive : {})}}>
            <svg style={st.icon} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            Quản lý Links
          </button>
          <button onClick={() => setActiveTab('stats')} style={{...st.navItem, ...(activeTab === 'stats' ? st.navActive : {})}}>
            <svg style={st.icon} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            Thống kê Traffic
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={st.main}>
        {loading ? (
          <div style={st.loader}>Đang đồng bộ hệ thống... ⏳</div>
        ) : activeTab === 'links' ? (
          /* TAB QUẢN LÝ LINKS */
          <div style={st.contentAnimation}>
            <header style={st.header}>
              <div>
                <h1 style={st.title}>Chiến dịch Affiliate</h1>
                <p style={st.subtitle}>Quản lý thông minh các phễu rút gọn của ní.</p>
              </div>
              <div style={st.summaryCard}>
                <span style={st.sumVal}>{links.length}</span>
                <span style={st.sumLab}>TỔNG LINK</span>
              </div>
            </header>

            <div style={st.searchRow}>
              <div style={st.searchWrapper}>
                <svg style={st.searchIcon} width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input type="text" placeholder="Tìm kiếm mã hoặc link gốc..." value={search} onChange={(e) => setSearch(e.target.value)} style={st.searchInput} />
              </div>
            </div>

            <div style={st.tableModule}>
              <table style={st.table}>
                <thead>
                  <tr style={st.trHead}>
                    <th style={st.th}>MÃ RÚT GỌN</th>
                    <th style={st.th}>LINK GỐC</th>
                    <th style={st.th}>NGÀY LÊN</th>
                    <th style={{...st.th, textAlign: 'right'}}>THAO TÁC</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedLinks).map(([netName, group]) => {
                    const isExpanded = search !== '' || expandedGroups[netName];
                    return (
                      <React.Fragment key={netName}>
                        <tr onClick={() => toggleGroup(netName)} style={st.groupRow}>
                          <td colSpan="4" style={{ padding: '12px 24px', color: group.info.text }}>
                            <div style={st.groupContent}>
                              <span style={{ fontWeight: '700' }}>● {netName.toUpperCase()} ({group.items.length})</span>
                              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ transition: '0.3s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}><path d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && group.items.map((l) => (
                          <tr key={l.id} style={st.row}>
                            <td style={st.td}><span style={{ color: '#0a84ff', fontWeight: '700' }}>/</span>{l.slug}</td>
                            <td style={{...st.td, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis'}}>{l.original_url}</td>
                            <td style={st.td}>{new Date(l.created_at).toLocaleDateString('vi-VN')}</td>
                            <td style={{...st.td, textAlign: 'right'}}>
                              <div style={st.actions}>
                                <button onClick={() => handleCopy(l.slug)} style={st.actionBtn}>Copy</button>
                                <button onClick={() => handleDelete(l.slug)} style={{...st.actionBtn, color: '#ff453a'}}>Xóa</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* TAB THỐNG KÊ TRAFFIC */
          <div style={st.contentAnimation}>
            <h1 style={st.title}>Báo Cáo Hiệu Suất</h1>
            
            <div style={st.statsGrid}>
              <div style={st.appleStat}>
                <p style={st.statLab}>TỔNG CLICK</p>
                <h2 style={st.statNum}>{clickLogs.length}</h2>
              </div>
              <div style={st.appleStat}>
                <p style={st.statLab}>TOP SLUG</p>
                <h2 style={{...st.statNum, fontSize: '1.5rem'}}>/{topLinks[0]?.slug || 'N/A'}</h2>
              </div>
            </div>

            <div style={st.chartsRow}>
              <div style={st.chartCard}>
                <h3 style={st.chartTitle}>🌐 Nguồn Traffic</h3>
                {topReferrers.map(([name, count]) => (
                  <div key={name} style={st.barRow}>
                    <div style={st.barInfo}><span>{name}</span><span>{count}</span></div>
                    <div style={st.barBase}><div style={{...st.barFill, width: `${(count/clickLogs.length)*100}%`, background: '#0071e3'}}></div></div>
                  </div>
                ))}
              </div>
              <div style={st.chartCard}>
                <h3 style={st.chartTitle}>📱 Thiết bị</h3>
                {topDevices.map(([name, count]) => (
                  <div key={name} style={st.barRow}>
                    <div style={st.barInfo}><span>{name}</span><span>{count}</span></div>
                    <div style={st.barBase}><div style={{...st.barFill, width: `${(count/clickLogs.length)*100}%`, background: '#30d158'}}></div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const st = {
  viewport: { display: 'flex', height: '100vh', backgroundColor: '#000', color: '#fff', fontVariantNumeric: 'tabular-nums' },
  sidebar: { width: '260px', background: 'rgba(28, 28, 30, 0.8)', backdropFilter: 'blur(40px)', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '30px 20px' },
  brand: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', paddingLeft: '10px' },
  logo: { width: '32px', height: '32px', background: 'linear-gradient(180deg, #0071e3, #00c6ff)', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '800' },
  brandName: { fontSize: '18px', fontWeight: '700', letterSpacing: '-0.5px' },
  nav: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  navItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', borderRadius: '12px', border: 'none', background: 'transparent', color: '#86868b', fontSize: '14px', fontWeight: '500', cursor: 'pointer', textAlign: 'left', transition: '0.2s' },
  navActive: { background: 'rgba(255,255,255,0.05)', color: '#fff' },
  icon: { width: '18px', height: '18px' },
  main: { flex: 1, padding: '50px 60px', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
  title: { fontSize: '32px', fontWeight: '700', letterSpacing: '-1.2px', margin: '0 0 8px 0' },
  subtitle: { color: '#86868b', margin: 0, fontSize: '15px' },
  summaryCard: { background: '#1c1c1e', padding: '15px 30px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' },
  sumVal: { fontSize: '24px', fontWeight: '800', display: 'block' },
  sumLab: { fontSize: '10px', color: '#86868b', letterSpacing: '1px', fontWeight: '700' },
  searchRow: { marginBottom: '30px' },
  searchWrapper: { position: 'relative', maxWidth: '400px' },
  searchIcon: { position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#424245' },
  searchInput: { width: '100%', padding: '12px 15px 12px 45px', borderRadius: '12px', background: '#1c1c1e', border: '1px solid #2c2c2e', color: '#fff', outline: 'none' },
  tableModule: { background: '#1c1c1e', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  trHead: { background: 'rgba(255,255,255,0.02)' },
  th: { padding: '15px 24px', color: '#86868b', fontSize: '11px', fontWeight: '700', letterSpacing: '1px' },
  groupRow: { cursor: 'pointer', background: 'rgba(255,255,255,0.01)', borderBottom: '1px solid rgba(255,255,255,0.03)' },
  groupContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  row: { borderBottom: '1px solid rgba(255,255,255,0.02)', transition: '0.2s' },
  td: { padding: '18px 24px', fontSize: '14px', color: '#f5f5f7' },
  actions: { display: 'flex', gap: '15px', justifyContent: 'flex-end' },
  actionBtn: { background: 'transparent', border: 'none', color: '#0a84ff', fontWeight: '600', cursor: 'pointer', fontSize: '13px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' },
  appleStat: { background: '#1c1c1e', padding: '25px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' },
  statLab: { fontSize: '11px', fontWeight: '800', color: '#86868b', letterSpacing: '1.5px', marginBottom: '10px' },
  statNum: { fontSize: '42px', fontWeight: '700', margin: 0, color: '#fff', letterSpacing: '-1.5px' },
  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  chartCard: { background: '#1c1c1e', padding: '25px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' },
  chartTitle: { fontSize: '16px', fontWeight: '600', marginBottom: '20px' },
  barRow: { marginBottom: '15px' },
  barInfo: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#86868b', marginBottom: '6px' },
  barBase: { height: '6px', background: '#2c2c2e', borderRadius: '10px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '100px', transition: 'width 1s ease' },
  toastIsland: { position: 'fixed', top: '30px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', color: '#fff', padding: '12px 25px', borderRadius: '100px', zIndex: 100, border: '1px solid rgba(255,255,255,0.1)', fontSize: '14px', fontWeight: '600', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }
};
