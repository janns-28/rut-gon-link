'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// --- GIỮ NGUYÊN LOGIC NETWORK GỐC ---
const getNetworkInfo = (url) => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('dinos.click')) return { name: 'Dinos', color: '#FF3B30' };
  if (lowerUrl.includes('hl-link')) return { name: 'Hyperlead', color: '#5856D6' };
  if (lowerUrl.includes('accesstrade')) return { name: 'Accesstrade', color: '#FF9500' };
  if (lowerUrl.includes('facebook.com')) return { name: 'Social', color: '#007AFF' };
  return { name: 'Direct', color: '#8E8E93' };
};

export default function AppleNativeAdmin() {
  // --- GIỮ NGUYÊN TOÀN BỘ LOGIC DỮ LIỆU CỦA NÍ ---
  const [links, setLinks] = useState([]);
  const [clickLogs, setClickLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
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

  // --- LOGIC THỐNG KÊ TRAFFIC GỐC ---
  const clickCounts = clickLogs.reduce((acc, log) => { acc[log.slug] = (acc[log.slug] || 0) + 1; return acc; }, {});
  const topLinks = Object.entries(clickCounts).map(([slug, count]) => ({ slug, count })).sort((a, b) => b.count - a.count);
  const filteredLinks = links.filter(l => l.slug.toLowerCase().includes(search.toLowerCase()));

  if (!mounted) return <div style={{ background: '#000', minHeight: '100vh' }}></div>;

  return (
    <div style={st.viewport}>
      {/* Background Mesh cực sâu - macOS Sequoia Style */}
      <div style={st.meshBG}></div>

      {/* Dynamic Island Toast */}
      {toast && <div style={st.islandToast}>{toast}</div>}

      <div style={st.macWindow}>
        {/* SIDEBAR: SF VIBRANCY MATERIAL */}
        <aside style={st.sidebar}>
          <div style={st.windowControls}>
            <div style={{...st.dot, background: '#FF5F56'}}></div>
            <div style={{...st.dot, background: '#FFBD2E'}}></div>
            <div style={{...st.dot, background: '#27C93F'}}></div>
          </div>
          
          <nav style={st.sideNav}>
            <button onClick={() => setActiveTab('links')} style={{...st.sideBtn, ...(activeTab === 'links' ? st.sideBtnActive : {})}}>
              <span style={st.btnIcon}>🔗</span> Campaigns
            </button>
            <button onClick={() => setActiveTab('stats')} style={{...st.sideBtn, ...(activeTab === 'stats' ? st.sideBtnActive : {})}}>
              <span style={st.btnIcon}>📊</span> Analytics
            </button>
          </nav>

          <div style={st.sideFooter}>
            <div style={st.profilePill}>
              <div style={st.avatar}>BT</div>
              <span style={st.uName}>binhtienti</span>
            </div>
          </div>
        </aside>

        {/* MAIN CANVAS Area */}
        <main style={st.main}>
          <header style={st.toolbar}>
            <h1 style={st.toolTitle}>{activeTab === 'links' ? 'Links' : 'Insights'}</h1>
            <div style={st.searchContainer}>
              <input 
                type="text" 
                placeholder="Search..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                style={st.macSearch} 
              />
            </div>
          </header>

          <div style={st.contentScroll}>
            {loading ? (
              <div style={st.loader}>Updating...</div>
            ) : activeTab === 'links' ? (
              /* INSET LIST - CHUẨN IOS SETTINGS */
              <div style={st.insetGroup}>
                {filteredLinks.map((l, i) => {
                  const net = getNetworkInfo(l.original_url);
                  return (
                    <div key={l.id} style={{...st.listItem, ...(i === filteredLinks.length -1 ? {border: 'none'} : {})}}>
                      <div style={st.listLead}>
                        <div style={{...st.netDot, backgroundColor: net.color}}></div>
                        <div style={st.textMeta}>
                          <span style={st.slugText}>/{l.slug}</span>
                          <span style={st.urlText}>{l.original_url}</span>
                        </div>
                      </div>
                      <div style={st.listTrail}>
                        <span style={st.clickNum}>{clickCounts[l.slug] || 0}</span>
                        <button onClick={() => handleCopy(l.slug)} style={st.appleLink}>Copy</button>
                        <button onClick={() => handleDelete(l.slug)} style={st.appleRed}>Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* WIDGETS - CHUẨN IPADOS DASHBOARD */
              <div style={st.widgetStack}>
                <div style={st.grid}>
                  <div style={st.widget}>
                    <p style={st.wHeader}>TOTAL CLICKS</p>
                    <h2 style={st.wNum}>{clickLogs.length.toLocaleString()}</h2>
                  </div>
                  <div style={st.widget}>
                    <p style={st.wHeader}>ACTIVE LINKS</p>
                    <h2 style={st.wNum}>{links.length}</h2>
                  </div>
                </div>
                <div style={st.largeWidget}>
                  <p style={st.wHeader}>PERFORMANCE LEADERBOARD</p>
                  <div style={st.chartStack}>
                    {topLinks.slice(0, 5).map(link => (
                      <div key={link.slug} style={st.chartRow}>
                        <div style={st.chartInfo}><span>/{link.slug}</span><span>{link.count}</span></div>
                        <div style={st.chartBase}><div style={{...st.chartFill, width: `${(link.count / (clickLogs.length || 1)) * 100}%`}}></div></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <style jsx global>{`
        body { margin: 0; background: #000; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif; -webkit-font-smoothing: antialiased; letter-spacing: -0.022em; }
        @keyframes reveal { from { opacity: 0; transform: scale(1.02); filter: blur(20px); } to { opacity: 1; transform: scale(1); filter: blur(0); } }
      `}</style>
    </div>
  );
}

const st = {
  viewport: { height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  meshBG: { position: 'absolute', inset: 0, background: 'radial-gradient(at 50% 0%, #1c1c1e 0%, #000 80%)', zIndex: 0 },
  islandToast: { position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(30px)', border: '0.5px solid rgba(255,255,255,0.15)', padding: '10px 24px', borderRadius: '100px', color: '#fff', fontSize: '13px', fontWeight: '600', zIndex: 1000, boxShadow: '0 10px 40px rgba(0,0,0,0.5)' },

  macWindow: { 
    width: '94vw', height: '88vh', background: 'rgba(28, 28, 30, 0.5)', backdropFilter: 'blur(60px) saturate(210%)', 
    borderRadius: '20px', border: '0.5px solid rgba(255,255,255,0.12)', display: 'flex', zIndex: 10, overflow: 'hidden',
    boxShadow: '0 40px 100px rgba(0,0,0,0.6)', animation: 'reveal 1s cubic-bezier(0.16, 1, 0.3, 1)'
  },

  sidebar: { width: '220px', borderRight: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', padding: '16px' },
  windowControls: { display: 'flex', gap: '8px', padding: '8px 12px 32px 12px' },
  dot: { width: '12px', height: '12px', borderRadius: '50%' },
  
  sideNav: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' },
  sideBtn: { background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', padding: '10px 12px', borderRadius: '8px', textAlign: 'left', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: '0.15s', display: 'flex', alignItems: 'center' },
  navActive: { background: 'rgba(255,255,255,0.08)', color: '#fff' },
  btnIcon: { marginRight: '10px', fontSize: '16px' },

  sideFooter: { paddingTop: '16px', borderTop: '0.5px solid rgba(255,255,255,0.06)' },
  profilePill: { display: 'flex', alignItems: 'center', gap: '10px', padding: '6px' },
  avatar: { width: '32px', height: '32px', borderRadius: '50%', background: '#3a3a3c', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '600', fontSize: '11px', color: '#fff' },
  uName: { color: '#fff', fontSize: '13px', fontWeight: '500' },

  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  toolbar: { height: '52px', borderBottom: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' },
  toolTitle: { fontSize: '13px', fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  macSearch: { background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '7px', padding: '6px 12px', color: '#fff', width: '180px', outline: 'none', fontSize: '13px' },

  contentScroll: { flex: 1, overflowY: 'auto', padding: '32px 60px' },
  insetGroup: { background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '0.5px solid rgba(255,255,255,0.05)', overflow: 'hidden' },
  listItem: { padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '0.5px solid rgba(255,255,255,0.04)' },
  listLead: { display: 'flex', alignItems: 'center', gap: '16px' },
  netDot: { width: '8px', height: '8px', borderRadius: '50%' },
  textMeta: { display: 'flex', flexDirection: 'column' },
  slugText: { color: '#fff', fontSize: '15px', fontWeight: '600' },
  urlText: { color: 'rgba(255,255,255,0.25)', fontSize: '12px', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  listTrail: { display: 'flex', alignItems: 'center', gap: '24px' },
  clickNum: { color: '#fff', fontSize: '14px', fontWeight: '600', fontVariantNumeric: 'tabular-nums' },
  appleLink: { background: 'transparent', border: 'none', color: '#007AFF', fontWeight: '600', cursor: 'pointer', fontSize: '13px' },
  appleRed: { background: 'transparent', border: 'none', color: '#FF3B30', fontWeight: '600', cursor: 'pointer', fontSize: '13px' },

  widgetStack: { display: 'flex', flexDirection: 'column', gap: '24px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  widget: { background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '24px', border: '0.5px solid rgba(255,255,255,0.05)' },
  wHeader: { color: 'rgba(255,255,255,0.25)', fontSize: '10px', fontWeight: '800', letterSpacing: '1px', marginBottom: '12px' },
  wNum: { color: '#fff', fontSize: '32px', fontWeight: '700', letterSpacing: '-1.5px', margin: 0 },
  largeWidget: { background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '28px', border: '0.5px solid rgba(255,255,255,0.05)' },
  chartStack: { display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '20px' },
  chartRow: { display: 'flex', flexDirection: 'column', gap: '8px' },
  chartInfo: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#fff', fontWeight: '500' },
  chartBase: { height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px' },
  chartFill: { height: '100%', background: '#007AFF', borderRadius: '10px' },
  loader: { height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'rgba(255,255,255,0.2)' }
};
