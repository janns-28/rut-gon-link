'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// 1. GIỮ NGUYÊN LOGIC NETWORK CỦA NÍ
const getNetworkInfo = (url) => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('dinos.click')) return { name: 'Dinos', color: '#ff453a' };
  if (lowerUrl.includes('hl-link')) return { name: 'Hyperlead', color: '#5e5ce6' };
  if (lowerUrl.includes('accesstrade')) return { name: 'Accesstrade', color: '#ff9f0a' };
  if (lowerUrl.includes('masoffer')) return { name: 'MasOffer', color: '#32d74b' };
  if (lowerUrl.includes('facebook.com')) return { name: 'Social', color: '#0a84ff' };
  return { name: 'Direct', color: '#8e8e93' };
};

export default function AppleUltimateAdmin() {
  // --- GIỮ NGUYÊN TOÀN BỘ LOGIC DATA CỦA NÍ ---
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
    if (!window.confirm(`Xác nhận xóa /${slug}?`)) return;
    const previousLinks = [...links];
    setLinks(links.filter(l => l.slug !== slug));
    setToast(`🗑️ Deleting...`);
    try {
      const res = await fetch('/api/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) });
      if (!res.ok) throw new Error();
      setToast(`✅ Removed /${slug}`);
    } catch (error) {
      setLinks(previousLinks);
      setToast(`❌ Error!`);
    }
    setTimeout(() => setToast(''), 3000);
  };

  // --- THỐNG KÊ TRAFFIC ---
  const clickCounts = clickLogs.reduce((acc, log) => { acc[log.slug] = (acc[log.slug] || 0) + 1; return acc; }, {});
  const topLinks = Object.entries(clickCounts)
    .map(([slug, count]) => ({ slug, count }))
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

  if (!mounted) return <div style={{ background: '#000', minHeight: '100vh' }}></div>;

  return (
    <div style={st.viewport}>
      {/* Mesh Gradient Nền đa tầng */}
      <div style={st.meshBG}></div>

      {/* Dynamic Island Toast */}
      {toast && <div style={st.toast}>{toast}</div>}

      <div style={st.centralStack}>
        {/* TOP NAVIGATION: Segmented Control Style */}
        <nav style={st.topNav}>
          <div style={st.navPill}>
            <button onClick={() => setActiveTab('links')} style={{...st.pillBtn, ...(activeTab === 'links' ? st.pillActive : {})}}>Links</button>
            <button onClick={() => setActiveTab('stats')} style={{...st.pillBtn, ...(activeTab === 'stats' ? st.pillActive : {})}}>Analytics</button>
          </div>
        </nav>

        {loading ? (
          <div style={st.loader}>Initializing System...</div>
        ) : (
          <div style={st.contentArea}>
            {/* HEADER AREA */}
            <header style={st.header}>
              <h1 style={st.pageTitle}>{activeTab === 'links' ? 'Chiến dịch' : 'Hiệu suất'}</h1>
              <div style={st.searchBox}>
                <input type="text" placeholder="Search slugs..." value={search} onChange={(e) => setSearch(e.target.value)} style={st.input} />
              </div>
            </header>

            {activeTab === 'links' ? (
              /* LINKS TAB: iOS Grouped List Style */
              <div style={st.moduleStack}>
                {Object.entries(groupedLinks).map(([netName, group]) => {
                  const isExpanded = search !== '' || expandedGroups[netName];
                  return (
                    <div key={netName} style={st.glassGroup}>
                      <div onClick={() => toggleGroup(netName)} style={st.groupHeader}>
                        <span style={{ color: group.color, fontWeight: '700' }}>● {netName}</span>
                        <span style={st.badge}>{group.items.length} links</span>
                      </div>
                      {isExpanded && group.items.map(l => (
                        <div key={l.id} style={st.row}>
                          <div style={st.rowInfo}>
                            <span style={st.slug}>/{l.slug}</span>
                            <span style={st.url}>{l.original_url}</span>
                          </div>
                          <div style={st.rowActions}>
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
              /* STATS TAB: Apple Health Style Widgets */
              <div style={st.moduleStack}>
                <div style={st.statsGrid}>
                  <div style={st.glassWidget}>
                    <p style={st.widgetLab}>TOTAL CLICKS</p>
                    <h2 style={st.widgetNum}>{clickLogs.length}</h2>
                  </div>
                  <div style={st.glassWidget}>
                    <p style={st.widgetLab}>TOP SOURCE</p>
                    <h2 style={{...st.widgetNum, fontSize: '1.8rem'}}>{topReferrers[0]?.[0] || 'Direct'}</h2>
                  </div>
                </div>
                
                <div style={st.glassLarge}>
                  <h3 style={st.moduleTitle}>Leaderboard</h3>
                  {topLinks.slice(0, 5).map((link, i) => (
                    <div key={link.slug} style={st.barRow}>
                      <div style={st.barInfo}><span>/{link.slug}</span><span>{link.count}</span></div>
                      <div style={st.barBase}><div style={{...st.barFill, width: `${(link.count / (clickLogs.length || 1)) * 100}%`}}></div></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        body { margin: 0; background: #000; overflow-x: hidden; font-family: 'Inter', -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }
        @keyframes reveal { from { opacity: 0; transform: translateY(20px) scale(0.98); filter: blur(10px); } to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } }
      `}</style>
    </div>
  );
}

const st = {
  viewport: { minHeight: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', backgroundColor: '#000', position: 'relative', color: '#fff', padding: '100px 20px' },
  meshBG: { position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(at 50% 0%, #1c1c1e 0%, #000 80%)' },
  toast: { position: 'fixed', top: '30px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 30px', borderRadius: '100px', fontSize: '14px', fontWeight: '600', zIndex: 1000 },

  centralStack: { zIndex: 10, width: '100%', maxWidth: '900px', animation: 'reveal 1s cubic-bezier(0.16, 1, 0.3, 1)' },
  
  topNav: { position: 'fixed', top: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 100 },
  navPill: { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(30px)', padding: '4px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex' },
  pillBtn: { background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', padding: '8px 24px', borderRadius: '100px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: '0.3s' },
  pillActive: { background: 'rgba(255,255,255,0.1)', color: '#fff' },

  contentArea: { width: '100%' },
  header: { textAlign: 'center', marginBottom: '60px' },
  pageTitle: { fontSize: '48px', fontWeight: '800', letterSpacing: '-2px', margin: '0 0 20px 0' },
  searchBox: { display: 'flex', justifyContent: 'center' },
  input: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '12px 20px', color: '#fff', width: '300px', outline: 'none', textAlign: 'center', fontSize: '15px' },

  moduleStack: { display: 'flex', flexDirection: 'column', gap: '20px' },
  glassGroup: { background: 'rgba(255,255,255,0.03)', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' },
  groupHeader: { padding: '20px 30px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' },
  badge: { fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '1px' },
  row: { padding: '24px 30px', borderBottom: '1px solid rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  rowInfo: { display: 'flex', flexDirection: 'column', gap: '4px' },
  slug: { fontSize: '18px', fontWeight: '700', color: '#fff', letterSpacing: '-0.5px' },
  url: { fontSize: '13px', color: 'rgba(255,255,255,0.4)', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  rowActions: { display: 'flex', gap: '20px' },
  btnCopy: { background: 'transparent', border: 'none', color: '#0a84ff', fontWeight: '600', cursor: 'pointer', fontSize: '14px' },
  btnDelete: { background: 'transparent', border: 'none', color: '#ff453a', fontWeight: '600', cursor: 'pointer', fontSize: '14px' },

  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  glassWidget: { background: 'rgba(255,255,255,0.03)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', padding: '30px', textAlign: 'center' },
  widgetLab: { fontSize: '11px', fontWeight: '800', color: 'rgba(255,255,255,0.2)', letterSpacing: '2px', marginBottom: '15px' },
  widgetNum: { fontSize: '48px', fontWeight: '700', letterSpacing: '-2px', margin: 0 },
  glassLarge: { background: 'rgba(255,255,255,0.03)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', padding: '40px' },
  moduleTitle: { fontSize: '20px', fontWeight: '700', marginBottom: '30px', letterSpacing: '-0.5px' },
  barRow: { marginBottom: '25px' },
  barInfo: { display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '600', marginBottom: '10px' },
  barBase: { height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' },
  barFill: { height: '100%', background: '#0a84ff', borderRadius: '10px', transition: 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)' },
  loader: { textAlign: 'center', marginTop: '100px', color: 'rgba(255,255,255,0.2)', fontSize: '18px' }
};
