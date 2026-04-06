'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Nền tảng Network - Giữ nguyên logic cốt lõi của ní
const getNetworkInfo = (url) => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('dinos.click')) return { name: 'Dinos', color: '#FF3B30' };
  if (lowerUrl.includes('hl-link')) return { name: 'Hyperlead', color: '#5856D6' };
  if (lowerUrl.includes('accesstrade')) return { name: 'Accesstrade', color: '#FF9500' };
  if (lowerUrl.includes('masoffer')) return { name: 'MasOffer', color: '#34C759' };
  if (lowerUrl.includes('facebook.com')) return { name: 'Social', color: '#007AFF' };
  return { name: 'Direct', color: '#8E8E93' };
};

export default function AppleProStudio() {
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
    setTimeout(() => setToast(''), 2000);
  };

  const handleDelete = async (slug) => {
    if (!window.confirm(`Delete /${slug}?`)) return;
    setLinks(links.filter(l => l.slug !== slug));
    setToast(`Deleted`);
    try { await fetch('/api/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) }); } catch (e) {}
    setTimeout(() => setToast(''), 2000);
  };

  // Logic Thống kê
  const clickCounts = clickLogs.reduce((acc, log) => { acc[log.slug] = (acc[log.slug] || 0) + 1; return acc; }, {});
  const topLinks = Object.entries(clickCounts).map(([slug, count]) => ({ slug, count })).sort((a, b) => b.count - a.count);

  if (!mounted) return <div style={{ background: '#000', minHeight: '100vh' }}></div>;

  return (
    <div style={st.viewport}>
      {/* Mesh Background - Deep Space Style */}
      <div style={st.meshBG}></div>

      {/* Dynamic Island Notification */}
      {toast && <div style={st.islandToast}>{toast}</div>}

      <div style={st.windowCanvas}>
        {/* SIDEBAR: VIBRANT BLUR */}
        <aside style={st.sidebar}>
          <div style={st.sideHeader}>
            <div style={st.appIcon}>B</div>
            <h2 style={st.brandTitle}>Studio</h2>
          </div>
          
          <div style={st.sideNav}>
            <button onClick={() => setActiveTab('links')} style={{...st.sideBtn, ...(activeTab === 'links' ? st.sideBtnActive : {})}}>
              Campaigns
            </button>
            <button onClick={() => setActiveTab('stats')} style={{...st.sideBtn, ...(activeTab === 'stats' ? st.sideBtnActive : {})}}>
              Analytics
            </button>
          </div>

          <div style={st.sideFooter}>
            <div style={st.profilePill}>
              <div style={st.avatar}>BT</div>
              <span style={st.uName}>binhtienti</span>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main style={st.main}>
          {loading ? (
            <div style={st.loader}>Syncing...</div>
          ) : (
            <div style={st.scrollContainer}>
              <header style={st.topBar}>
                <h1 style={st.title}>{activeTab === 'links' ? 'Links' : 'Performance'}</h1>
                <div style={st.searchWrapper}>
                  <input 
                    type="text" 
                    placeholder="Search campaigns..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    style={st.searchField} 
                  />
                </div>
              </header>

              {activeTab === 'links' ? (
                /* INSET GROUPED LIST: APPLE STYLE */
                <div style={st.stack}>
                  {links.filter(l => l.slug.includes(search)).map((l, i) => {
                    const net = getNetworkInfo(l.original_url);
                    return (
                      <div key={l.id} style={st.listItem}>
                        <div style={st.itemLead}>
                          <div style={{...st.netDot, backgroundColor: net.color}}></div>
                          <div style={st.itemMeta}>
                            <span style={st.slugText}>/{l.slug}</span>
                            <span style={st.urlText}>{l.original_url}</span>
                          </div>
                        </div>
                        <div style={st.itemTrailing}>
                          <span style={st.clickBadge}>{clickCounts[l.slug] || 0} clicks</span>
                          <button onClick={() => handleCopy(l.slug)} style={st.appleBtn}>Copy</button>
                          <button onClick={() => handleDelete(l.slug)} style={st.appleBtnDestructive}>Delete</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* ANALYTICS: MODULAR STYLE */
                <div style={st.stack}>
                  <div style={st.statsGrid}>
                    <div style={st.glassCard}>
                      <span style={st.cardHeader}>TOTAL TRAFFIC</span>
                      <h3 style={st.cardValue}>{clickLogs.length.toLocaleString()}</h3>
                    </div>
                    <div style={st.glassCard}>
                      <span style={st.cardHeader}>ACTIVE CAMPAIGNS</span>
                      <h3 style={st.cardValue}>{links.length}</h3>
                    </div>
                  </div>

                  <div style={st.leaderboardCard}>
                    <span style={st.cardHeader}>TOP PERFORMING SLUGS</span>
                    <div style={st.chartStack}>
                      {topLinks.slice(0, 5).map(link => (
                        <div key={link.slug} style={st.chartRow}>
                          <div style={st.chartLabel}><span>/{link.slug}</span><span>{link.count}</span></div>
                          <div style={st.chartBase}>
                            <div style={{...st.chartFill, width: `${(link.count / (clickLogs.length || 1)) * 100}%`}}></div>
                          </div>
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
        body { margin: 0; background: #000; font-family: 'Inter', -apple-system, sans-serif; -webkit-font-smoothing: antialiased; letter-spacing: -0.02em; }
        ::-webkit-scrollbar { width: 0px; }
      `}</style>
    </div>
  );
}

const st = {
  viewport: { height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' },
  meshBG: { position: 'absolute', inset: 0, background: 'radial-gradient(at 50% 20%, #1c1c1e 0%, #000 80%)', zIndex: 0 },
  
  islandToast: { position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(30px)', color: '#fff', padding: '10px 24px', borderRadius: '100px', fontSize: '13px', fontWeight: '600', zIndex: 1000, border: '0.5px solid rgba(255,255,255,0.15)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' },

  windowCanvas: { 
    width: '94vw', height: '88vh', background: 'rgba(28, 28, 30, 0.45)', backdropFilter: 'blur(60px) saturate(200%)', 
    borderRadius: '24px', border: '0.5px solid rgba(255,255,255,0.12)', display: 'flex', zIndex: 10, overflow: 'hidden',
    boxShadow: '0 40px 100px rgba(0,0,0,0.6)'
  },

  // Sidebar macOS Sequoia Style
  sidebar: { width: '220px', borderRight: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', padding: '32px 16px' },
  sideHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '8px' },
  appIcon: { width: '28px', height: '28px', background: 'linear-gradient(180deg, #007AFF, #0051FF)', borderRadius: '6px', color: '#fff', fontWeight: '900', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px' },
  brandTitle: { color: '#fff', fontSize: '18px', fontWeight: '700', letterSpacing: '-0.5px', margin: 0 },
  sideNav: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' },
  sideBtn: { background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', padding: '10px 12px', borderRadius: '8px', textAlign: 'left', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: '0.15s' },
  sideBtnActive: { background: 'rgba(255,255,255,0.08)', color: '#fff' },
  sideFooter: { paddingTop: '16px', borderTop: '0.5px solid rgba(255,255,255,0.06)' },
  profilePill: { display: 'flex', alignItems: 'center', gap: '10px', padding: '6px' },
  avatar: { width: '32px', height: '32px', borderRadius: '50%', background: '#3a3a3c', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '600', fontSize: '11px', color: '#fff' },
  uName: { color: '#fff', fontSize: '13px', fontWeight: '500' },

  // Main Content
  main: { flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' },
  scrollContainer: { flex: 1, overflowY: 'auto', padding: '48px 60px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '40px' },
  title: { fontSize: '34px', fontWeight: '800', letterSpacing: '-1.2px', color: '#fff', margin: 0 },
  searchField: { background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '10px', padding: '10px 16px', color: '#fff', width: '220px', outline: 'none', fontSize: '13px' },

  stack: { display: 'flex', flexDirection: 'column', gap: '12px' },
  listItem: { 
    background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '16px 20px', 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '0.5px solid rgba(255,255,255,0.04)' 
  },
  itemLead: { display: 'flex', alignItems: 'center', gap: '16px' },
  netDot: { width: '8px', height: '8px', borderRadius: '50%' },
  itemMeta: { display: 'flex', flexDirection: 'column', gap: '2px' },
  slugText: { color: '#fff', fontSize: '16px', fontWeight: '600', letterSpacing: '-0.3px' },
  urlText: { color: 'rgba(255,255,255,0.3)', fontSize: '12px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  itemTrailing: { display: 'flex', alignItems: 'center', gap: '16px' },
  clickBadge: { color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: '500' },
  appleBtn: { background: 'transparent', border: 'none', color: '#007AFF', fontWeight: '600', cursor: 'pointer', fontSize: '13px' },
  appleBtnDestructive: { background: 'transparent', border: 'none', color: '#FF3B30', fontWeight: '600', cursor: 'pointer', fontSize: '13px' },

  // Stats Card
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' },
  glassCard: { background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '0.5px solid rgba(255,255,255,0.05)', padding: '24px' },
  cardHeader: { color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: '700', letterSpacing: '1px', display: 'block', marginBottom: '12px' },
  cardValue: { color: '#fff', fontSize: '32px', fontWeight: '700', letterSpacing: '-1px', margin: 0 },
  leaderboardCard: { background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '0.5px solid rgba(255,255,255,0.05)', padding: '32px' },
  chartStack: { display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' },
  chartRow: { display: 'flex', flexDirection: 'column', gap: '8px' },
  chartLabel: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#fff', fontWeight: '500' },
  chartBase: { height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' },
  chartFill: { height: '100%', background: '#007AFF', borderRadius: '10px' },
  loader: { height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '14px' }
};
