'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Đã chuyển về mã màu HEX thay vì class Tailwind
const getNetworkInfo = (url) => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('dinos.click')) return { name: 'Dinos', bg: '#fef2f2', text: '#dc2626', border: '#fecaca' };
  if (lowerUrl.includes('hl-link')) return { name: 'Hyperlead', bg: '#eef2ff', text: '#4f46e5', border: '#c7d2fe' };
  if (lowerUrl.includes('accesstrade')) return { name: 'Accesstrade', bg: '#fffbeb', text: '#d97706', border: '#fde68a' };
  if (lowerUrl.includes('masoffer')) return { name: 'MasOffer', bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' };
  if (lowerUrl.includes('facebook.com')) return { name: 'Social', bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
  return { name: 'Direct', bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
};

export default function PremiumAdmin() {
  const [links, setLinks] = useState([]);
  const [clickLogs, setClickLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [activeTab, setActiveTab] = useState('links');

  useEffect(() => {
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

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const getLastClickInfo = (slug) => {
    const logs = clickLogs.filter(log => log.slug === slug);
    if (logs.length === 0) return { text: 'Chưa có data', color: '#94a3b8', isDead: false };
    
    logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const diffHours = (new Date() - new Date(logs[0].created_at)) / (1000 * 60 * 60);

    if (diffHours < 1) return { text: 'Vừa cắn số 🔥', color: '#059669', isDead: false }; // Emerald 600
    if (diffHours < 3) return { text: `${Math.floor(diffHours)}h trước`, color: '#d97706', isDead: false }; // Amber 600
    return { text: `Đứng im >${Math.floor(diffHours)}h`, color: '#ef4444', isDead: true }; // Red 500
  };

  const filteredLinks = links.filter(l => 
    l.slug.toLowerCase().includes(search.toLowerCase()) || 
    l.original_url.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (e, slug) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
    showToast(`📋 Đã copy: /${slug}`);
  };

  const handleDelete = async (e, slug) => {
    e.stopPropagation();
    if (!window.confirm(`Xóa vĩnh viễn link /${slug}? Hành động này đéo hoàn tác được.`)) return;
    
    const previousLinks = [...links];
    setLinks(links.filter(l => l.slug !== slug));
    
    try {
      const res = await fetch('/api/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) });
      if (!res.ok) throw new Error('Lỗi Server');
      showToast(`🗑️ Đã xóa /${slug}`);
    } catch (error) {
      setLinks(previousLinks);
      showToast(`❌ Lỗi không xóa được!`);
    }
  };

  // --- THỐNG KÊ DATA ---
  const clickCounts = clickLogs.reduce((acc, log) => { acc[log.slug] = (acc[log.slug] || 0) + 1; return acc; }, {});
  const topLinks = Object.entries(clickCounts)
    .map(([slug, count]) => ({ slug, count, originalUrl: links.find(l => l.slug === slug)?.original_url || 'N/A' }))
    .sort((a, b) => b.count - a.count);

  const processStats = (field) => {
    const counts = clickLogs.reduce((acc, log) => {
      let key = log[field] || 'Unknown';
      if (field === 'referrer') {
        const lower = key.toLowerCase();
        if (lower.includes('facebook')) key = 'Facebook';
        else if (lower.includes('tiktok')) key = 'TikTok';
        else if (lower.includes('threads')) key = 'Threads';
        else if (lower.includes('zalo')) key = 'Zalo';
        else if (key.startsWith('http')) { try { key = new URL(key).hostname; } catch(e){} }
        else key = 'Direct (Trực tiếp)';
      }
      if (field === 'user_agent') {
        const ua = key.toLowerCase();
        if (ua.includes('iphone') || ua.includes('ipad')) key = 'iOS';
        else if (ua.includes('android')) key = 'Android';
        else if (ua.includes('windows')) key = 'Windows';
        else key = 'Khác';
      }
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif' }}>
      
      {/* TOAST ALERTS */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', padding: '12px 24px', borderRadius: '12px', background: toast.includes('❌') ? '#ef4444' : '#0f172a', color: '#fff', fontSize: '0.9rem', fontWeight: '600', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', zIndex: 50 }}>
          {toast}
        </div>
      )}

      {/* SIDEBAR */}
      <aside style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', padding: '24px', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #2563eb, #4f46e5)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)' }}>B</div>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.5px' }}>BINHTIENTI</span>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={() => setActiveTab('links')} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'links' ? '#eff6ff' : 'transparent', color: activeTab === 'links' ? '#2563eb' : '#64748b', fontWeight: '600', transition: 'all 0.2s', fontSize: '0.95rem' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            Quản lý Phễu
          </button>
          <button onClick={() => setActiveTab('stats')} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'stats' ? '#eff6ff' : 'transparent', color: activeTab === 'stats' ? '#2563eb' : '#64748b', fontWeight: '600', transition: 'all 0.2s', fontSize: '0.95rem' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            Báo cáo Traffic
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: '40px 50px', maxWidth: '1200px', boxSizing: 'border-box' }}>
        
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontWeight: '500' }}>Đang tải cục data... ⏳</div>
        ) : activeTab === 'links' ? (
          
          /* TAB 1: QUẢN LÝ LINKS */
          <div>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Chiến dịch Affiliate</h1>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem', fontWeight: '500' }}>Quản lý toàn bộ link rút gọn và kiểm soát sinh tử của phễu mồi.</p>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '12px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '800' }}>{links.length}</div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>Tổng Link Active</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Hệ thống</div>
                </div>
              </div>
            </header>

            {/* BỘ LỌC */}
            <div style={{ backgroundColor: '#ffffff', padding: '6px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '32px', display: 'flex', alignItems: 'center' }}>
              <svg style={{ color: '#94a3b8', marginLeft: '16px' }} width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input 
                type="text" 
                placeholder="Tìm mã camp, slug hoặc url gốc..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                style={{ width: '100%', border: 'none', background: 'transparent', padding: '12px 16px', outline: 'none', fontSize: '0.95rem', fontWeight: '500', color: '#0f172a' }}
              />
            </div>

            {/* BẢNG DATA HIỆN ĐẠI (FLAT TABLE) */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Network</th>
                    <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Mã Phễu (Slug)</th>
                    <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Link Gốc & Tín Hiệu</th>
                    <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLinks.length === 0 ? (
                    <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontWeight: '500' }}>Không có data mài ơi.</td></tr>
                  ) : (
                    filteredLinks.map((l, idx) => {
                      const net = getNetworkInfo(l.original_url);
                      const lastClick = getLastClickInfo(l.slug);
                      const isLast = idx === filteredLinks.length - 1;
                      
                      return (
                        <tr key={l.id} className="admin-row" style={{ borderBottom: isLast ? 'none' : '1px solid #f1f5f9' }}>
                          
                          {/* CỘT 1: NETWORK BADGE */}
                          <td style={{ padding: '16px 24px' }}>
                            <span style={{ backgroundColor: net.bg, color: net.text, border: `1px solid ${net.border}`, padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>
                              {net.name}
                            </span>
                          </td>

                          {/* CỘT 2: SLUG */}
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ color: '#94a3b8', fontWeight: '600' }}>/</span>
                              <span style={{ fontWeight: '800', fontSize: '1rem', letterSpacing: '-0.3px' }}>{l.slug}</span>
                            </div>
                          </td>

                          {/* CỘT 3: ORIGINAL URL & STATUS */}
                          <td style={{ padding: '16px 24px', maxWidth: '300px' }}>
                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#64748b', fontSize: '0.85rem', fontWeight: '500', marginBottom: '6px' }} title={l.original_url}>
                              {l.original_url}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: '600', color: lastClick.color }}>
                              {lastClick.isDead && (
                                <div style={{ position: 'relative', width: '8px', height: '8px' }}>
                                  <div className="animate-ping" style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: '#fca5a5', borderRadius: '50%', opacity: 0.7 }}></div>
                                  <div style={{ position: 'relative', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }}></div>
                                </div>
                              )}
                              {lastClick.text}
                            </div>
                          </td>

                          {/* CỘT 4: ACTIONS */}
                          <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                              <button onClick={(e) => handleCopy(e, l.slug)} title="Copy" className="admin-btn" style={{ background: 'transparent', border: 'none', color: '#94a3b8', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
                              <a href={l.original_url} target="_blank" rel="noopener noreferrer" title="Mở Link" className="admin-btn" style={{ background: 'transparent', border: 'none', color: '#94a3b8', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex' }}><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>
                              <button onClick={(e) => handleDelete(e, l.slug)} title="Xóa" className="admin-btn-danger" style={{ background: 'transparent', border: 'none', color: '#94a3b8', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        ) : (
          
          /* TAB 2: THỐNG KÊ DATA */
          <div>
            <header style={{ marginBottom: '40px' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Báo Cáo Hiệu Suất</h1>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem', fontWeight: '500' }}>Phân tích lượng truy cập thực tế từ các nguồn đổ về.</p>
            </header>

            {/* TỔNG QUAN */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Tổng lượt bấm</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a' }}>{clickLogs.length}</div>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Top 1 Đang Cắn</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#2563eb', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>/{topLinks[0]?.slug || 'N/A'}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#64748b' }}>{topLinks[0]?.count || 0} click</div>
              </div>
              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Tỷ trọng Top 1</div>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: '#059669' }}>
                  {topLinks.length > 0 ? `${Math.round((topLinks[0].count / clickLogs.length) * 100)}%` : '0%'}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: '500', color: '#64748b', marginTop: '4px' }}>trên tổng traffic</div>
              </div>
            </div>

            {/* CHART DATA */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
              {/* Nguồn Traffic */}
              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 24px 0' }}>🌐 Nguồn Traffic Đổ Về</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {processStats('referrer').length === 0 ? <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Chưa có dữ liệu</p> : processStats('referrer').map(([name, count], idx) => {
                    const pct = Math.round((count / clickLogs.length) * 100);
                    return (
                      <div key={name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>
                          <span style={{ color: '#334155' }}>{name}</span>
                          <span style={{ color: '#64748b' }}>{count} ({pct}%)</span>
                        </div>
                        <div style={{ width: '100%', backgroundColor: '#f1f5f9', borderRadius: '999px', height: '8px' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: idx === 0 ? '#3b82f6' : '#cbd5e1', borderRadius: '999px' }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Thiết bị */}
              <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 24px 0' }}>📱 Nền Tảng Thiết Bị</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {processStats('user_agent').length === 0 ? <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Chưa có dữ liệu</p> : processStats('user_agent').map(([name, count], idx) => {
                    const pct = Math.round((count / clickLogs.length) * 100);
                    return (
                      <div key={name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' }}>
                          <span style={{ color: '#334155' }}>{name}</span>
                          <span style={{ color: '#64748b' }}>{count} ({pct}%)</span>
                        </div>
                        <div style={{ width: '100%', backgroundColor: '#f1f5f9', borderRadius: '999px', height: '8px' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: idx === 0 ? '#6366f1' : '#cbd5e1', borderRadius: '999px' }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CSS CHO HOVER & ANIMATION ĐỂ KHÔNG BỊ PHỤ THUỘC TAILWIND */}
      <style dangerouslySetInnerHTML={{__html: `
        .admin-row { transition: background-color 0.2s ease; }
        .admin-row:hover { background-color: #f8fafc !important; }
        .admin-btn { transition: all 0.2s ease; }
        .admin-btn:hover { background-color: #eff6ff !important; color: #2563eb !important; }
        .admin-btn-danger { transition: all 0.2s ease; }
        .admin-btn-danger:hover { background-color: #fef2f2 !important; color: #ef4444 !important; }
        
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .animate-ping { animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
        
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}
