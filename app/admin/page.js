'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// --- GIỮ NGUYÊN LOGIC NETWORK GỐC ---
const getNetworkInfo = (url) => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('dinos.click')) return { name: 'Dinos', color: '#FF3B30' };
  if (lowerUrl.includes('hl-link')) return { name: 'Hyperlead', color: '#5856D6' };
  if (lowerUrl.includes('accesstrade')) return { name: 'Accesstrade', color: '#FF9500' };
  if (lowerUrl.includes('masoffer')) return { name: 'MasOffer', color: '#34C759' };
  if (lowerUrl.includes('facebook.com')) return { name: 'Social', color: '#007AFF' };
  return { name: 'Direct', color: '#8E8E93' };
};

export default function AppleUltimateAdmin() {
  // --- GIỮ NGUYÊN TOÀN BỘ STATE VÀ DATA GỐC ---
  const [links, setLinks] = useState([]);
  const [clickLogs, setClickLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [activeTab, setActiveTab] = useState('links');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
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

  // --- LOGIC XỬ LÝ CLICK & TRAFFIC GỐC ---
  const clickCounts = clickLogs.reduce((acc, log) => { acc[log.slug] = (acc[log.slug] || 0) + 1; return acc; }, {});
  const topLinks = Object.entries(clickCounts).map(([slug, count]) => ({ slug, count })).sort((a, b) => b.count - a.count);
  const filteredLinks = links.filter(l => l.slug.toLowerCase().includes(search.toLowerCase()));

  const handleCopy = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
    setToast(`Copied /${slug}`);
    setTimeout(() => setToast(''), 2000);
  };

  const handleDelete = async (slug) => {
    if (!window.confirm(`Xác nhận xóa /${slug}?`)) return;
    setLinks(links.filter(l => l.slug !== slug));
    setToast(`Deleted`);
    try { await fetch('/api/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) }); } catch (e) {}
    setTimeout(() => setToast(''), 2000);
  };

  if (!mounted) return <div style={{ background: '#000', minHeight: '100vh' }}></div>;

  return (
    <div style={st.viewport}>
      {/* Mesh Background: Deep Apple Style */}
      <div style={st.meshBG}></div>

      {/* Dynamic Island Toast */}
      {toast && <div style={st.islandToast}>{toast}</div>}

      <div style={st.appWindow}>
        {/* SIDEBAR: SF VIBRANCY MATERIAL */}
        <aside style={st.sidebar}>
          <div style={st.sideHeader}>
            <div style={st.appIcon}>B</div>
            <span style={st.brand}>Studio</span>
          </div>
          
          <nav style={st.nav}>
            <button onClick={() => setActiveTab('links')} style={{...st.navBtn, ...(activeTab === 'links' ? st.navActive : {})}}>Campaigns</button>
            <button onClick={() => setActiveTab('stats')} style={{...st.navBtn, ...(activeTab === 'stats' ? st.navActive : {})}}>Insights</button>
          </nav>

          <div style={st.sideFooter}>
            <div style={st.userPill}>
              <div style={st.avatar}>BT</div>
              <span style={st.uName}>binhtienti</span>
            </div>
          </div>
        </aside>

        {/* MAIN CANVAS */}
        <main style={st.main}>
          {loading ? (
            <div style={st.loader}>Syncing with iCloud...</div>
          ) : (
            <div style={st.reveal}>
              <header style={st.topBar}>
                <h1 style={st.title}>{activeTab === 'links' ? 'Links' : 'Analytics'}</h1>
                <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} style={st.appleSearch} />
              </header>

              {activeTab === 'links' ? (
                /* INSET LIST STYLE APPLE SETTINGS */
                <div style={st.scrollBox}>
                  {filteredLinks.map((l, i) => {
                    const net = getNetworkInfo(l.original_url);
                    return (
                      <div key={l.id} style={st.listItem}>
                        <div style={st.itemLead}>
                          <div style={{...st.netIndicator, backgroundColor: net.color}}></div>
                          <div style={st.meta}>
                            <span style={st.slugText}>/{l.slug}</span>
                            <span style={st.urlText}>{l.original_url}</span>
                          </div>
                        </div>
                        <div style={st.itemTrailing}>
                          <span style={st.clickNum}>{clickCounts[l.slug] || 0}</span>
                          <button onClick={() => handleCopy(l.slug)} style={st.appleAction}>Copy</button>
                          <button onClick={() => handleDelete(l.slug)} style={st.appleDestructive}>Delete</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* APPLE HEALTH STYLE WIDGETS */
                <div style={st.scrollBox}>
                  <div style={st.grid}>
                    <div style={st.glassWidget}>
                      <span style={st.wHeader}>TOTAL TRAFFIC</span>
                      <h2 style={st.wVal}>{clickLogs.length.toLocaleString()}</h2>
                    </div>
                    <div style={st.glassWidget}>
                      <span style={st.wHeader}>TOP CAMPAIGN</span>
                      <h2 style={{...st.wVal, fontSize: '1.8rem'}}>/{topLinks[0]?.slug || 'N/A'}</h2>
                    </div>
                  </div>
                  
                  <div style={st.leaderboardWidget}>
                    <span style={st.wHeader}>PERFORMANCE LEADERBOARD</span>
                    <div style={st.chartStack}>
                      {topLinks.slice(0, 5).map(link => (
                        <div key={link.slug} style={st.chartRow}>
                          <div style={st.chartMeta}><span>/{link.slug}</span><span>{link.count}</span></div>
                          <div style={st.chartBase}><div style={{...st.chartFill, width: `${(link.count / (clickLogs.length || 1)) * 100}%`}}></div></div>
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
        body { margin: 0; background: #000; font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif; -webkit-font-smoothing: antialiased; letter-spacing: -0.022em; }
        @keyframes reveal { from { opacity: 0; transform: translateY(10px); filter: blur(10px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
      `}</style>
    </div>
  );
}

const st = {
  viewport: { height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' },
  meshBG: { position: 'absolute', inset: 0, background: 'radial-gradient(at 50% 10%, #1c1c1e 0%, #000 80%)', zIndex: 0 },
  islandToast: { position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(30px)', border: '0.5px solid rgba(255,255,255,0.15)', padding: '10px 24px', borderRadius: '100px', color: '#fff', fontSize: '13px', fontWeight: '600', zIndex: 1000, boxShadow: '0 10px 40px rgba(0,0,0,0.5)' },

  appWindow: { 
    width: '94vw', height: '88vh', background: 'rgba(28, 28, 30, 0.45)', backdropFilter: 'blur(60px) saturate(210%)', 
    borderRadius: '24px', border: '0.5px solid rgba(255,255,255,0.12)', display: 'flex', zIndex: 10, overflow: 'hidden',
    boxShadow: '0 40px 100px rgba(0,0,0,0.6)'
  },

  sidebar: { width: '220px', borderRight: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', padding: '32px 14px' },
  sideHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '12px' },
  appIcon: { width: '28px', height: '28px', background: 'linear-gradient(180deg, #007AFF, #0051FF)', borderRadius: '7px', color: '#fff', fontWeight: '900', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px' },
  brand: { color: '#fff', fontSize: '18px', fontWeight: '700', letterSpacing: '-0.6px' },
  nav: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' },
  navBtn: { background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', padding: '10px 12px', borderRadius: '10px', textAlign: 'left', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: '0.15s' },
  navActive: { background: 'rgba(255,255,255,0.08)', color: '#fff' },
  sideFooter: { paddingTop: '16px', borderTop: '0.5px solid rgba(255,255,255,0.06)' },
  uPill: { display: 'flex', alignItems: 'center', gap: '10px', padding: '6px' },
  avatar: { width: '32px', height: '32px', borderRadius: '50%', background: '#3a3a3c', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '600', fontSize: '11px', color: '#fff' },
  uName: { color: '#fff', fontSize: '13px', fontWeight: '500' },

  main: { flex: 1, display: 'flex', flexDirection: 'column', padding: '50px 60px', overflowY: 'auto' },
  reveal: { animation: 'reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1)' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '45px' },
  title: { fontSize: '38px', fontWeight: '800', letterSpacing: '-1.5px', color: '#fff', margin: 0 },
  appleSearch: { background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '10px', padding: '10px 16px', color: '#fff', width: '220px', outline: 'none', fontSize: '14px' },

  scrollBox: { display: 'flex', flexDirection: 'column', gap: '10px' },
  listItem: { background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '0.5px solid rgba(255,255,255,0.04)' },
  rowLead: { display: 'flex', alignItems: 'center', gap: '18px' },
  netIndicator: { width: '10px', height: '10px', borderRadius: '50%' },
  meta: { display: 'flex', flexDirection: 'column', gap: '2px' },
  slug: { color: '#fff', fontSize: '16px', fontWeight: '700', letterSpacing: '-0.3px' },
  url: { color: 'rgba(255,255,255,0.25)', fontSize: '12px', maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  rowTrail: { display: 'flex', alignItems: 'center', gap: '24px' },
  clickNum: { color: '#fff', fontSize: '14px', fontWeight: '600' },
  appleAction: { background: 'transparent', border: 'none', color: '#007AFF', fontWeight: '600', cursor: 'pointer', fontSize: '14px' },
  appleDestructive: { background: 'transparent', border: 'none', color: '#FF3B30', fontWeight: '600', cursor: 'pointer', fontSize: '14px' },

  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' },
  glassWidget: { background: 'rgba(255,255,255,0.03)', borderRadius: '22px', padding: '28px', border: '0.5px solid rgba(255,255,255,0.05)' },
  wHeader: { color: 'rgba(255,255,255,0.25)', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', display: 'block', marginBottom: '14px' },
  wVal: { color: '#fff', fontSize: '34px', fontWeight: '700', letterSpacing: '-1.5px', margin: 0 },
  leaderboardWidget: { background: 'rgba(255,255,255,0.03)', borderRadius: '24px', padding: '32px', border: '0.5px solid rgba(255,255,255,0.05)' },
  chartStack: { display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '24px' },
  chartRow: { display: 'flex', flexDirection: 'column', gap: '8px' },
  chartMeta: { display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#fff', fontWeight: '500' },
  chartBase: { height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px' },
  chartFill: { height: '100%', background: '#007AFF', borderRadius: '10px' },
  loader: { height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'rgba(255,255,255,0.2)' }
};
