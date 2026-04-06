'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// 1. LOGIC NETWORK CỦA NÍ
const getNetworkInfo = (url) => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('dinos.click')) return { name: 'Dinos', color: '#ff453a' };
  if (lowerUrl.includes('hl-link')) return { name: 'Hyperlead', color: '#5e5ce6' };
  if (lowerUrl.includes('accesstrade')) return { name: 'Accesstrade', color: '#ff9f0a' };
  if (lowerUrl.includes('masoffer')) return { name: 'MasOffer', color: '#32d74b' };
  if (lowerUrl.includes('facebook.com')) return { name: 'Social', color: '#0a84ff' };
  return { name: 'Direct', color: '#8e8e93' };
};

export default function AppleUltimateStudio() {
  // --- STATE GỐC CỦA NÍ ---
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

  // --- LOGIC XỬ LÝ DỮ LIỆU CỦA NÍ ---
  const filteredLinks = links.filter(l => 
    l.slug.toLowerCase().includes(search.toLowerCase()) || 
    l.original_url.toLowerCase().includes(search.toLowerCase())
  );

  const groupedLinks = filteredLinks.reduce((acc, link) => {
    const netName = getNetworkInfo(link.original_url).name;
    if (!acc[netName]) acc[netName] = { color: getNetworkInfo(link.original_url).color, items: [] };
    acc[netName].items.push(link);
    return acc;
  }, {});

  const handleCopy = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
    setToast(`📋 Copied: /${slug}`);
    setTimeout(() => setToast(''), 2500);
  };

  const handleDelete = async (slug) => {
    if (!window.confirm(`Xóa vĩnh viễn /${slug}?`)) return;
    setLinks(links.filter(l => l.slug !== slug));
    setToast(`🗑️ Deleted`);
    try {
      await fetch('/api/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) });
    } catch (e) { setToast(`❌ Error`); }
    setTimeout(() => setToast(''), 3000);
  };

  // --- THỐNG KÊ TRAFFIC ---
  const clickCounts = clickLogs.reduce((acc, log) => { acc[log.slug] = (acc[log.slug] || 0) + 1; return acc; }, {});
  const topLinks = Object.entries(clickCounts).map(([slug, count]) => ({ slug, count })).sort((a, b) => b.count - a.count);
  const referrerCounts = clickLogs.reduce((acc, log) => {
    let ref = log.referrer || 'Direct';
    if (ref.toLowerCase().includes('facebook')) ref = 'Facebook';
    else if (ref.toLowerCase().includes('tiktok')) ref = 'TikTok';
    acc[ref] = (acc[ref] || 0) + 1;
    return acc;
  }, {});

  if (!mounted) return <div style={{ background: '#000', minHeight: '100vh' }}></div>;

  return (
    <div style={st.viewport}>
      {/* Mesh Background Deep Effect */}
      <div style={st.meshBG}></div>

      {/* Dynamic Island Toast */}
      {toast && <div style={st.toast}>{toast}</div>}

      <div style={st.appCanvas}>
        
        {/* SIDEBAR: macOS VIBRANCY STYLE */}
        <aside style={st.sidebar}>
          <div style={st.sidebarHeader}>
            <div style={st.appleLogo}>B</div>
            <span style={st.brandName}>Studio</span>
          </div>

          <nav style={st.navStack}>
            <button onClick={() => setActiveTab('links')} style={{...st.navBtn, ...(activeTab === 'links' ? st.navActive : {})}}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
              Links
            </button>
            <button onClick={() => setActiveTab('stats')} style={{...st.navBtn, ...(activeTab === 'stats' ? st.navActive : {})}}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              Analytics
            </button>
          </nav>

          <div style={st.sidebarFooter}>
            <div style={st.userPill}>
              <div style={st.avatar}>BT</div>
              <div style={st.userMeta}>
                <span style={st.uName}>binhtienti</span>
                <span style={st.uRole}>Pro Affiliate</span>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT: PURE GLASS AREA */}
        <main style={st.mainContent}>
          {loading ? (
            <div style={st.loader}>Updating...</div>
          ) : (
            <div style={st.appleReveal}>
              <header style={st.topBar}>
                <h1 style={st.pageTitle}>{activeTab === 'links' ? 'Campaigns' : 'Insights'}</h1>
                <div style={st.searchGroup}>
                  <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} style={st.appleSearch} />
                </div>
              </header>

              {activeTab === 'links' ? (
                /* LINKS VIEW: iOS LIST STYLE */
                <div style={st.scrollBox}>
                  {Object.entries(groupedLinks).map(([netName, group]) => (
                    <div key={netName} style={st.listGroup}>
                      <div style={st.groupLabel}>{netName.toUpperCase()}</div>
                      <div style={st.glassList}>
                        {group.items.map((l, idx) => (
                          <div key={l.id} style={{...st.listItem, ...(idx === group.items.length - 1 ? {border: 'none'} : {})}}>
                            <div style={st.itemLead}>
                              <span style={st.slugText}>/{l.slug}</span>
                              <span style={st.subText}>{l.original_url}</span>
                            </div>
                            <div style={st.itemActions}>
                              <button onClick={() => handleCopy(l.slug)} style={st.actionBtn}>Copy</button>
                              <button onClick={() => handleDelete(l.slug)} style={st.deleteBtn}>Delete</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* STATS VIEW: APPLE HEALTH STYLE */
                <div style={st.scrollBox}>
                  <div style={st.statsGrid}>
                    <div style={st.glassCard}>
                      <p style={st.cardLab}>CLICKS</p>
                      <h2 style={st.cardNum}>{clickLogs.length}</h2>
                    </div>
                    <div style={st.glassCard}>
                      <p style={st.cardLab}>TOP CONVERSION</p>
                      <h2 style={{...st.cardNum, fontSize: '1.8rem'}}>/{topLinks[0]?.slug || 'N/A'}</h2>
                    </div>
                  </div>
                  
                  <div style={st.glassModule}>
                    <h3 style={st.modTitle}>Traffic Source</h3>
                    {Object.entries(referrerCounts).map(([name, count]) => (
                      <div key={name} style={st.barItem}>
                        <div style={st.barInfo}><span>{name}</span><span>{count}</span></div>
                        <div style={st.barBase}><div style={{...st.barFill, width: `${(count/clickLogs.length)*100}%`}}></div></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <style jsx global>{`
        body { margin: 0; background: #000; overflow: hidden; font-family: 'Inter', -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }
        @keyframes appleReveal { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

const st = {
  viewport: { height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' },
  meshBG: { position: 'absolute', inset: 0, zIndex: 0, background: 'radial-gradient(at 50% 10%, #1c1c1e 0%, #000 80%)' },
  toast: { position: 'fixed', top: '30px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 25px', borderRadius: '100px', color: '#fff', fontSize: '14px', fontWeight: '600', zIndex: 1000, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' },

  appCanvas: { 
    width: '95vw', height: '90vh', background: 'rgba(28, 28, 30, 0.4)', backdropFilter: 'blur(50px) saturate(180%)', 
    borderRadius: '32px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', zIndex: 10, overflow: 'hidden',
    boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)'
  },

  // Sidebar
  sidebar: { width: '260px', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', padding: '40px 20px' },
  sidebarHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', paddingLeft: '10px' },
  appleLogo: { width: '30px', height: '30px', background: '#0071e3', borderRadius: '7px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '900', fontSize: '16px', color: '#fff' },
  brandName: { fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px', color: '#fff' },
  navStack: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  navBtn: { background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', padding: '12px 15px', borderRadius: '10px', textAlign: 'left', fontSize: '15px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: '0.2s' },
  navActive: { background: 'rgba(255,255,255,0.06)', color: '#fff' },
  sidebarFooter: { paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' },
  userPill: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', background: '#3a3a3c', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '600', fontSize: '13px' },
  userMeta: { display: 'flex', flexDirection: 'column' },
  uName: { fontSize: '13px', fontWeight: '600', color: '#fff' },
  uRole: { fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: '500' },

  // Main Content
  mainContent: { flex: 1, display: 'flex', flexDirection: 'column', padding: '60px 80px', position: 'relative' },
  appleReveal: { animation: 'appleReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1)' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '40px' },
  pageTitle: { fontSize: '38px', fontWeight: '800', letterSpacing: '-1.5px', color: '#fff', margin: 0 },
  appleSearch: { background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '12px', padding: '12px 20px', color: '#fff', width: '240px', outline: 'none', fontSize: '14px' },

  scrollBox: { flex: 1, overflowY: 'auto', paddingRight: '10px' },
  listGroup: { marginBottom: '35px' },
  groupLabel: { fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.2)', letterSpacing: '1.5px', marginBottom: '15px', paddingLeft: '20px' },
  glassList: { background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden' },
  listItem: { padding: '20px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)' },
  itemLead: { display: 'flex', flexDirection: 'column', gap: '4px' },
  slugText: { fontSize: '17px', fontWeight: '700', color: '#fff', letterSpacing: '-0.4px' },
  subText: { fontSize: '13px', color: 'rgba(255,255,255,0.3)', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  itemActions: { display: 'flex', gap: '20px' },
  actionBtn: { background: 'transparent', border: 'none', color: '#0a84ff', fontWeight: '600', cursor: 'pointer', fontSize: '14px' },
  deleteBtn: { background: 'transparent', border: 'none', color: '#ff453a', fontWeight: '600', cursor: 'pointer', fontSize: '14px' },

  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '30px' },
  glassCard: { background: 'rgba(255,255,255,0.03)', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.05)', padding: '30px' },
  cardLab: { fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.2)', letterSpacing: '1.5px', marginBottom: '15px' },
  cardNum: { fontSize: '48px', fontWeight: '700', letterSpacing: '-2px', color: '#fff', margin: 0 },
  glassModule: { background: 'rgba(255,255,255,0.03)', borderRadius: '32px', padding: '40px', border: '1px solid rgba(255,255,255,0.05)' },
  modTitle: { fontSize: '18px', fontWeight: '700', marginBottom: '30px', color: '#fff' },
  barItem: { marginBottom: '20px' },
  barInfo: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '500', marginBottom: '10px' },
  barBase: { height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' },
  barFill: { height: '100%', background: '#0a84ff', borderRadius: '10px' },

  loader: { height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '16px' }
};
