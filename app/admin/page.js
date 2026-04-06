'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// - GIỮ NGUYÊN LOGIC PHÂN LOẠI NETWORK CỦA NÍ
const getNetworkInfo = (url) => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('dinos.click')) return { name: 'Dinos', color: '#FF3B30', bg: 'rgba(255, 59, 48, 0.15)' };
  if (lowerUrl.includes('hl-link')) return { name: 'Hyperlead', color: '#5856D6', bg: 'rgba(88, 86, 214, 0.15)' };
  if (lowerUrl.includes('accesstrade')) return { name: 'Accesstrade', color: '#FF9500', bg: 'rgba(255, 149, 0, 0.15)' };
  if (lowerUrl.includes('masoffer')) return { name: 'MasOffer', color: '#34C759', bg: 'rgba(52, 199, 89, 0.15)' };
  if (lowerUrl.includes('facebook.com')) return { name: 'Social', color: '#007AFF', bg: 'rgba(0, 122, 255, 0.15)' };
  return { name: 'Direct', color: '#8E8E93', bg: 'rgba(142, 142, 147, 0.15)' };
};

export default function AppleProAdmin() {
  // --- - GIỮ NGUYÊN TOÀN BỘ STATE VÀ LOGIC DỮ LIỆU ---
  const [links, setLinks] = useState([]);
  const [clickLogs, setClickLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
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

  const handleCopy = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
    setToast(`Copied /${slug}`);
    setTimeout(() => setToast(''), 2500);
  };

  const handleDelete = async (slug) => {
    if (!window.confirm(`Delete /${slug}?`)) return;
    setLinks(links.filter(l => l.slug !== slug));
    setToast(`Deleted`);
    try { await fetch('/api/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) }); } catch (e) {}
    setTimeout(() => setToast(''), 2500);
  };

  // --- - LOGIC THỐNG KÊ TRAFFIC ---
  const clickCounts = clickLogs.reduce((acc, log) => { acc[log.slug] = (acc[log.slug] || 0) + 1; return acc; }, {});
  const topLinks = Object.entries(clickCounts).map(([slug, count]) => ({ slug, count })).sort((a, b) => b.count - a.count);
  
  const referrerCounts = clickLogs.reduce((acc, log) => {
    let ref = log.referrer || 'Direct';
    if (ref.toLowerCase().includes('facebook')) ref = 'Facebook';
    else if (ref.toLowerCase().includes('tiktok')) ref = 'TikTok';
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
  const topDevices = Object.entries(deviceCounts).sort((a, b) => b[1] - a[1]);

  if (!mounted) return <div style={{ background: '#000', minHeight: '100vh' }}></div>;

  return (
    <div style={st.viewport}>
      {/* Mesh Background: Apple Dynamic Wallpaper Style */}
      <div style={st.meshBG}></div>

      {/* Dynamic Island Notification */}
      {toast && <div style={st.islandToast}>{toast}</div>}

      <div style={st.window}>
        {/* SIDEBAR: SF VIBRANCY MATERIAL */}
        <aside style={st.sidebar}>
          <div style={st.sideHeader}>
            <div style={st.appIcon}>B</div>
            <h2 style={st.brandTitle}>Admin</h2>
          </div>
          <nav style={st.nav}>
            <button onClick={() => setActiveTab('links')} style={{...st.navBtn, ...(activeTab === 'links' ? st.navActive : {})}}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
              Links
            </button>
            <button onClick={() => setActiveTab('stats')} style={{...st.navBtn, ...(activeTab === 'stats' ? st.navActive : {})}}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              Analytics
            </button>
          </nav>
          <div style={st.sideFooter}>
            <div style={st.uPill}><div style={st.avatar}>BT</div><span style={st.uName}>binhtienti</span></div>
          </div>
        </aside>

        {/* MAIN: APPLE CANVAS */}
        <main style={st.main}>
          {loading ? (
            <div style={st.loader}>Syncing...</div>
          ) : (
            <div style={st.reveal}>
              <header style={st.topBar}>
                <h1 style={st.pageTitle}>{activeTab === 'links' ? 'Campaigns' : 'Insights'}</h1>
                <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} style={st.appleSearch} />
              </header>

              {activeTab === 'links' ? (
                /* APPLE INSET GROUPED LIST */
                <div style={st.scrollBox}>
                  {links.filter(l => l.slug.includes(search)).map((l, i) => {
                    const net = getNetworkInfo(l.original_url);
                    return (
                      <div key={l.id} style={st.rowItem}>
                        <div style={st.rowLead}>
                          <div style={{...st.netIcon, backgroundColor: net.color}}>{net.name[0]}</div>
                          <div style={st.meta}>
                            <span style={st.slug}>/{l.slug}</span>
                            <span style={st.url}>{l.original_url}</span>
                          </div>
                        </div>
                        <div style={st.rowTrail}>
                          <span style={st.clickNum}>{clickCounts[l.slug] || 0}</span>
                          <button onClick={() => handleCopy(l.slug)} style={st.textBtn}>Copy</button>
                          <button onClick={() => handleDelete(l.slug)} style={st.delBtn}>Delete</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* APPLE HEALTH STYLE WIDGETS */
                <div style={st.scrollBox}>
                  <div style={st.grid}>
                    <div style={st.widget}>
                      <span style={st.wLab}>TOTAL TRAFFIC</span>
                      <h2 style={st.wNum}>{clickLogs.length.toLocaleString()}</h2>
                    </div>
                    <div style={st.widget}>
                      <span style={st.wLab}>TOP DEVICE</span>
                      <h2 style={st.wNum}>{topDevices[0]?.[0] || 'N/A'}</h2>
                    </div>
                  </div>
                  <div style={st.largeWidget}>
                    <span style={st.wLab}>TRAFFIC SOURCE</span>
                    <div style={st.chartStack}>
                      {topReferrers.slice(0, 4).map(([name, count]) => (
                        <div key={name} style={st.chartRow}>
                          <div style={st.chartInfo}><span>{name}</span><span>{count}</span></div>
                          <div style={st.chartBase}><div style={{...st.chartFill, width: `${(count/clickLogs.length)*100}%`}}></div></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <style jsx global>{`
        body { margin: 0; background: #000; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif; -webkit-font-smoothing: antialiased; }
        ::-webkit-scrollbar { width: 0; }
        @keyframes reveal { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

const st = {
  viewport: { height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  meshBG: { position: 'absolute', inset: 0, background: 'radial-gradient(at 50% 10%, #1c1c1e 0%, #000 80%)', zIndex: 0 },
  islandToast: { position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(30px)', border: '0.5px solid rgba(255,255,255,0.15)', padding: '10px 24px', borderRadius: '100px', color: '#fff', fontSize: '13px', fontWeight: '600', zIndex: 1000, boxShadow: '0 10px 40px rgba(0,0,0,0.5)' },

  window: { 
    width: '95vw', height: '90vh', background: 'rgba(28, 28, 30, 0.5)', backdropFilter: 'blur(60px) saturate(210%)', 
    borderRadius: '20px', border: '0.5px solid rgba(255,255,255,0.12)', display: 'flex', zIndex: 10, overflow: 'hidden'
  },

  // Sidebar
  sidebar: { width: '220px', borderRight: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', padding: '32px 12px' },
  sideHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '12px' },
  appIcon: { width: '26px', height: '26px', background: '#007AFF', borderRadius: '6px', color: '#fff', fontWeight: '900', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '13px' },
  brandTitle: { color: '#fff', fontSize: '17px', fontWeight: '700', letterSpacing: '-0.5px', margin: 0 },
  nav: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' },
  navBtn: { background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', padding: '10px 12px', borderRadius: '8px', textAlign: 'left', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' },
  navActive: { background: 'rgba(255,255,255,0.08)', color: '#fff' },
  sideFooter: { paddingTop: '16px', borderTop: '0.5px solid rgba(255,255,255,0.06)' },
  uPill: { display: 'flex', alignItems: 'center', gap: '10px', padding: '6px' },
  avatar: { width: '30px', height: '30px', borderRadius: '50%', background: '#3a3a3c', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '600', fontSize: '10px', color: '#fff' },
  uName: { color: '#fff', fontSize: '13px', fontWeight: '500' },

  // Main Content
  main: { flex: 1, display: 'flex', flexDirection: 'column', padding: '50px 60px', overflowY: 'auto' },
  reveal: { animation: 'reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1)' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '40px' },
  pageTitle: { fontSize: '34px', fontWeight: '800', letterSpacing: '-1.5px', color: '#fff', margin: 0 },
  appleSearch: { background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '10px', padding: '10px 16px', color: '#fff', width: '220px', outline: 'none', fontSize: '14px' },

  scrollBox: { display: 'flex', flexDirection: 'column', gap: '10px' },
  rowItem: { background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '0.5px solid rgba(255,255,255,0.04)' },
  rowLead: { display: 'flex', alignItems: 'center', gap: '16px' },
  netIcon: { width: '32px', height: '32px', borderRadius: '8px', color: '#fff', fontWeight: '800', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px' },
  meta: { display: 'flex', flexDirection: 'column', gap: '2px' },
  slug: { color: '#fff', fontSize: '16px', fontWeight: '600', letterSpacing: '-0.3px' },
  url: { color: 'rgba(255,255,255,0.3)', fontSize: '12px', maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  rowTrail: { display: 'flex', alignItems: 'center', gap: '20px' },
  clickNum: { color: '#fff', fontSize: '15px', fontWeight: '700', fontVariantNumeric: 'tabular-nums' },
  textBtn: { background: 'transparent', border: 'none', color: '#007AFF', fontWeight: '600', cursor: 'pointer', fontSize: '14px' },
  delBtn: { background: 'transparent', border: 'none', color: '#FF3B30', fontWeight: '600', cursor: 'pointer', fontSize: '14px' },

  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' },
  widget: { background: 'rgba(255,255,255,0.03)', borderRadius: '18px', padding: '24px', border: '0.5px solid rgba(255,255,255,0.05)' },
  wLab: { color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', display: 'block', marginBottom: '12px' },
  wNum: { color: '#fff', fontSize: '32px', fontWeight: '700', letterSpacing: '-1px', margin: 0 },
  largeWidget: { background: 'rgba(255,255,255,0.03)', borderRadius: '22px', padding: '32px', border: '0.5px solid rgba(255,255,255,0.05)' },
  chartStack: { display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '20px' },
  chartRow: { display: 'flex', flexDirection: 'column', gap: '8px' },
  chartInfo: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#fff', fontWeight: '500' },
  chartBase: { height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' },
  chartFill: { height: '100%', background: '#007AFF', borderRadius: '10px' },
  loader: { height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'rgba(255,255,255,0.2)' }
};
