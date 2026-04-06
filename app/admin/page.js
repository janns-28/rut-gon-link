'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// 1. LOGIC PHÂN LOẠI NETWORK GỐC CỦA NÍ
const getNetworkInfo = (url) => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('dinos.click')) return { name: 'Dinos', color: '#ff453a' };
  if (lowerUrl.includes('hl-link')) return { name: 'Hyperlead', color: '#5e5ce6' };
  if (lowerUrl.includes('accesstrade')) return { name: 'Accesstrade', color: '#ff9f0a' };
  if (lowerUrl.includes('masoffer')) return { name: 'MasOffer', color: '#32d74b' };
  if (lowerUrl.includes('facebook.com')) return { name: 'Social', color: '#0a84ff' };
  return { name: 'Direct', color: '#8e8e93' };
};

export default function AppleStyleAdmin() {
  // --- GIỮ NGUYÊN TOÀN BỘ STATE CỦA NÍ ---
  const [links, setLinks] = useState([]);
  const [clickLogs, setClickLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [activeTab, setActiveTab] = useState('links');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap';
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
    if (!acc[netName]) acc[netName] = { color: netInfo.color, items: [] };
    acc[netName].items.push(link);
    return acc;
  }, {});

  const toggleGroup = (netName) => {
    setExpandedGroups(prev => ({ ...prev, [netName]: !prev[netName] }));
  };

  const handleCopy = (slug) => {
    const fullUrl = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setToast(`📋 Copied: /${slug}`);
    setTimeout(() => setToast(''), 2500);
  };

  const handleDelete = async (slug) => {
    if (!window.confirm(`Xóa vĩnh viễn /${slug}?`)) return;
    const previousLinks = [...links];
    setLinks(links.filter(l => l.slug !== slug));
    setToast(`🗑️ Deleting...`);
    try {
      const res = await fetch('/api/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) });
      if (!res.ok) throw new Error();
      setToast(`✅ Done!`);
    } catch (error) {
      setLinks(previousLinks);
      setToast(`❌ Error!`);
    }
    setTimeout(() => setToast(''), 3000);
  };

  // --- LOGIC THỐNG KÊ GỐC ---
  const clickCounts = clickLogs.reduce((acc, log) => { acc[log.slug] = (acc[log.slug] || 0) + 1; return acc; }, {});
  const topLinks = Object.entries(clickCounts)
    .map(([slug, count]) => {
      const linkData = links.find(l => l.slug === slug);
      return { slug, count, network: linkData ? getNetworkInfo(linkData.original_url).name : 'Unknown' };
    })
    .sort((a, b) => b.count - a.count);

  const referrerCounts = clickLogs.reduce((acc, log) => {
    let ref = log.referrer || 'Direct';
    if (ref.toLowerCase().includes('facebook')) ref = 'Facebook';
    else if (ref.toLowerCase().includes('tiktok')) ref = 'TikTok';
    else if (ref.toLowerCase().includes('threads')) ref = 'Threads';
    acc[ref] = (acc[ref] || 0) + 1;
    return acc;
  }, {});
  const topReferrers = Object.entries(referrerCounts).sort((a, b) => b[1] - a[1]);

  const deviceCounts = clickLogs.reduce((acc, log) => {
    const ua = (log.user_agent || '').toLowerCase();
    let device = 'Other';
    if (ua.includes('iphone') || ua.includes('ipad')) device = 'iOS';
    else if (ua.includes('android')) device = 'Android';
    else if (ua.includes('windows')) device = 'Windows';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {});

  if (!mounted) return <div style={{ background: '#000', minHeight: '100vh' }}></div>;

  return (
    <div style={st.viewport}>
      {/* Mesh Gradient Nền cực sang */}
      <div style={st.meshBG}></div>

      {/* Dynamic Island Toast */}
      {toast && <div style={st.toastIsland}>{toast}</div>}

      {/* Sidebar Kính Mờ (Vibrancy) */}
      <aside style={st.sidebar}>
        <div style={st.brand}>
          <div style={st.logo}>B</div>
          <span style={st.brandName}>Dashboard</span>
        </div>
        <nav style={st.nav}>
          <button onClick={() => setActiveTab('links')} style={{...st.navBtn, ...(activeTab === 'links' ? st.navActive : {})}}>Links</button>
          <button onClick={() => setActiveTab('stats')} style={{...st.navBtn, ...(activeTab === 'stats' ? st.navActive : {})}}>Stats</button>
        </nav>
        <div style={st.user}>
            <div style={st.avatar}>BT</div>
            <span style={st.userName}>Bình Tiến Tí</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={st.main}>
        {loading ? (
          <div style={st.loader}>Syncing...</div>
        ) : (
          <div style={st.appleReveal}>
            <header style={st.header}>
              <h1 style={st.pageTitle}>{activeTab === 'links' ? 'Chiến dịch' : 'Báo cáo'}</h1>
              <div style={st.topActions}>
                <input type="text" placeholder="Tìm mã..." value={search} onChange={(e) => setSearch(e.target.value)} style={st.appleSearch} />
              </div>
            </header>

            {activeTab === 'links' ? (
              /* TAB LINKS STYLE APPLE LIST */
              <div style={st.listStack}>
                {Object.entries(groupedLinks).map(([netName, group]) => {
                  const isExpanded = search !== '' || expandedGroups[netName];
                  return (
                    <div key={netName} style={st.groupCard}>
                      <div onClick={() => toggleGroup(netName)} style={st.groupHeader}>
                        <span style={{ color: group.color, fontWeight: '700' }}>● {netName}</span>
                        <span style={st.countBadge}>{group.items.length} link</span>
                      </div>
                      {isExpanded && group.items.map(l => (
                        <div key={l.id} style={st.linkRow}>
                          <div style={st.linkInfo}>
                            <span style={st.slugText}>/{l.slug}</span>
                            <span style={st.urlText}>{l.original_url}</span>
                          </div>
                          <div style={st.linkActions}>
                            <button onClick={() => handleCopy(l.slug)} style={st.btnCopy}>Copy</button>
                            <button onClick={() => handleDelete(l.slug)} style={st.btnDelete}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* TAB STATS STYLE CONTROL CENTER */
              <div style={st.statsStack}>
                <div style={st.gridStats}>
                  <div style={st.glassCard}>
                    <p style={st.cardLab}>TOTAL CLICKS</p>
                    <h2 style={st.cardNum}>{clickLogs.length}</h2>
                  </div>
                  <div style={st.glassCard}>
                    <p style={st.cardLab}>TOP SOURCE</p>
                    <h2 style={st.cardNum}>{topReferrers[0]?.[0] || 'Direct'}</h2>
                  </div>
                </div>

                <div style={st.chartRow}>
                  <div style={st.glassCardLarge}>
                    <h3 style={st.moduleTitle}>Leaderboard</h3>
                    {topLinks.slice(0, 5).map((link, i) => (
                      <div key={link.slug} style={st.barItem}>
                        <div style={st.barLabel}><span>/{link.slug}</span><span>{link.count}</span></div>
                        <div style={st.barBase}><div style={{...st.barFill, width: `${(link.count / clickLogs.length) * 100}%`, background: '#0071e3'}}></div></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <style jsx global>{`
        body { margin: 0; background: #000; overflow: hidden; font-family: 'Inter', -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }
        @keyframes appleReveal { from { opacity: 0; transform: translateY(20px); filter: blur(10px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
      `}</style>
    </div>
  );
}

const st = {
  viewport: { display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#000', position: 'relative', color: '#fff' },
  meshBG: { position: 'absolute', inset: 0, zIndex: 0, background: 'radial-gradient(at 50% 0%, #1c1c1e 0%, #000 70%)', opacity: 0.8 },
  
  // Sidebar macOS Style
  sidebar: { 
    width: '240px', background: 'rgba(28, 28, 30, 0.6)', backdropFilter: 'blur(50px) saturate(180%)', 
    borderRight: '1px solid rgba(255,255,255,0.08)', zIndex: 10, display: 'flex', flexDirection: 'column', padding: '40px 20px' 
  },
  brand: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', paddingLeft: '10px' },
  logo: { width: '32px', height: '32px', background: '#0071e3', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '800' },
  brandName: { fontSize: '19px', fontWeight: '700', letterSpacing: '-0.5px' },
  nav: { flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' },
  navBtn: { 
    background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', padding: '12px 15px', borderRadius: '12px', 
    textAlign: 'left', fontSize: '15px', fontWeight: '500', cursor: 'pointer', transition: '0.2s' 
  },
  navActive: { background: 'rgba(255,255,255,0.1)', color: '#fff' },
  user: { display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 10px', borderTop: '1px solid rgba(255,255,255,0.05)' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', background: '#3a3a3c', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '13px', fontWeight: '600' },
  userName: { fontSize: '14px', fontWeight: '500' },

  // Main Area
  main: { flex: 1, zIndex: 5, padding: '60px 80px', overflowY: 'auto', position: 'relative' },
  appleReveal: { animation: 'appleReveal 1s cubic-bezier(0.16, 1, 0.3, 1)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '50px' },
  pageTitle: { fontSize: '40px', fontWeight: '800', letterSpacing: '-1.5px', margin: 0 },
  appleSearch: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 20px', color: '#fff', outline: 'none', width: '250px' },

  // Lists Style
  listStack: { display: 'flex', flexDirection: 'column', gap: '20px' },
  groupCard: { background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' },
  groupHeader: { padding: '18px 25px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' },
  countBadge: { fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: '600', textTransform: 'uppercase' },
  linkRow: { padding: '20px 25px', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  slugText: { fontSize: '17px', fontWeight: '700', color: '#fff', marginRight: '15px' },
  urlText: { color: 'rgba(255,255,255,0.4)', fontSize: '14px' },
  linkActions: { display: 'flex', gap: '20px' },
  btnCopy: { background: 'transparent', border: 'none', color: '#0a84ff', fontWeight: '600', cursor: 'pointer' },
  btnDelete: { background: 'transparent', border: 'none', color: '#ff453a', fontWeight: '600', cursor: 'pointer' },

  // Stats Style
  statsStack: { display: 'flex', flexDirection: 'column', gap: '30px' },
  gridStats: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px' },
  glassCard: { background: 'rgba(255,255,255,0.03)', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.05)', padding: '30px', backdropFilter: 'blur(20px)' },
  cardLab: { fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', marginBottom: '15px' },
  cardNum: { fontSize: '48px', fontWeight: '700', letterSpacing: '-2px', margin: 0 },
  glassCardLarge: { background: 'rgba(255,255,255,0.03)', borderRadius: '32px', padding: '40px', border: '1px solid rgba(255,255,255,0.05)' },
  moduleTitle: { fontSize: '20px', fontWeight: '700', marginBottom: '30px', letterSpacing: '-0.5px' },
  barItem: { marginBottom: '25px' },
  barLabel: { display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: '#fff', fontWeight: '500', marginBottom: '10px' },
  barBase: { height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '10px', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' },

  loader: { height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '18px' },
  toastIsland: { position: 'fixed', top: '30px', left: '50%', transform: 'translateX(-50%)', background: '#000', border: '1px solid rgba(255,255,255,0.15)', padding: '12px 30px', borderRadius: '100px', color: '#fff', fontSize: '14px', fontWeight: '600', zIndex: 1000, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }
};
