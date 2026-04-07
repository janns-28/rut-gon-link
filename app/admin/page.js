'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const getNetworkInfo = (url) => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('dinos.click')) return { name: 'Dinos', bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' };
  if (lowerUrl.includes('hl-link')) return { name: 'Hyperlead', bg: '#e0e7ff', text: '#4f46e5', border: '#a5b4fc' };
  if (lowerUrl.includes('accesstrade')) return { name: 'Accesstrade', bg: '#fef3c7', text: '#d97706', border: '#fcd34d' };
  if (lowerUrl.includes('masoffer')) return { name: 'MasOffer', bg: '#dcfce7', text: '#16a34a', border: '#86efac' };
  if (lowerUrl.includes('facebook.com')) return { name: 'Social', bg: '#dbeafe', text: '#2563eb', border: '#93c5fd' };
  return { name: 'Direct', bg: '#f3f4f6', text: '#4b5563', border: '#d1d5db' };
};

export default function PremiumAdmin() {
  const [links, setLinks] = useState([]);
  const [clickLogs, setClickLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});
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

  const getLastClickInfo = (slug) => {
    const logs = clickLogs.filter(log => log.slug === slug);
    if (logs.length === 0) return { text: 'Chưa có click', color: '#64748b', isDead: false };
    
    logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const lastLogTime = new Date(logs[0].created_at);
    const diffHours = (new Date() - lastLogTime) / (1000 * 60 * 60);

    if (diffHours < 1) return { text: 'Vừa cắn số 🔥', color: '#10b981', isDead: false };
    if (diffHours < 3) return { text: `Tầm ${Math.floor(diffHours)}h trước`, color: '#fbbf24', isDead: false };
    return { text: `Đứng im >${Math.floor(diffHours)}h ⚠️`, color: '#ef4444', isDead: true };
  };

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
    const confirm = window.confirm(`Cảnh báo: Ông có chắc chắn muốn xóa vĩnh viễn link /${slug} không?`);
    if (!confirm) return;
    const previousLinks = [...links];
    setLinks(links.filter(l => l.slug !== slug));
    setToast(`🗑️ Đang dọn dẹp /${slug}...`);
    try {
      const res = await fetch('/api/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) });
      if (!res.ok) throw new Error('Lỗi từ Server');
      setToast(`✅ Đã bay màu /${slug} thành công!`);
      setTimeout(() => setToast(''), 3000);
    } catch (error) {
      setLinks(previousLinks);
      setToast(`❌ Lỗi không xóa được! Vui lòng thử lại.`);
      setTimeout(() => setToast(''), 3000);
    }
  };

  const clickCounts = clickLogs.reduce((acc, log) => {
    acc[log.slug] = (acc[log.slug] || 0) + 1;
    return acc;
  }, {});
  const topLinks = Object.entries(clickCounts)
    .map(([slug, count]) => {
      const linkData = links.find(l => l.slug === slug);
      return { 
        slug, 
        count, 
        originalUrl: linkData?.original_url || 'N/A',
        network: linkData ? getNetworkInfo(linkData.original_url).name : 'Unknown'
      };
    })
    .sort((a, b) => b.count - a.count);

  const referrerCounts = clickLogs.reduce((acc, log) => {
    let ref = log.referrer || 'Direct (Truy cập thẳng)';
    const lowerRef = ref.toLowerCase();
    if (lowerRef.includes('facebook.com')) ref = 'Facebook';
    else if (lowerRef.includes('tiktok.com')) ref = 'TikTok';
    else if (lowerRef.includes('threads.net')) ref = 'Threads';
    else if (lowerRef.includes('zalo')) ref = 'Zalo';
    else if (lowerRef.includes('instagram.com')) ref = 'Instagram';
    else if (lowerRef.includes('youtube.com')) ref = 'YouTube';
    else if (lowerRef.startsWith('http')) {
      try { ref = new URL(ref).hostname; } catch(e){}
    }
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
    else if (ua.includes('mac os') || ua.includes('macintosh')) device = 'MacBook';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {});
  const topDevices = Object.entries(deviceCounts).sort((a, b) => b[1] - a[1]);

  return (
    // Đã fix lỗi scroll: height: 100vh và overflow: hidden cho thẻ cha
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#0f1115', color: '#e2e8f0', fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif' }}>
      
      {toast && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: toast.includes('❌') ? '#ef4444' : '#10b981', color: '#fff', padding: '12px 24px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', zIndex: 50, fontWeight: '500', animation: 'slideIn 0.3s ease-out' }}>
          {toast}
        </div>
      )}

      {/* SIDEBAR */}
      <aside style={{ width: '260px', borderRight: '1px solid #1f2937', backgroundColor: '#111318', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>B</div>
          <span style={{ fontSize: '1.2rem', fontWeight: '700', letterSpacing: '0.5px', color: '#f8fafc' }}>BINHTIENTI</span>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            onClick={() => setActiveTab('links')}
            style={{ width: '100%', border: 'none', cursor: 'pointer', padding: '12px 16px', borderRadius: '8px', background: activeTab === 'links' ? '#1f2937' : 'transparent', color: activeTab === 'links' ? '#f8fafc' : '#94a3b8', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            Quản lý Links
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            style={{ width: '100%', border: 'none', cursor: 'pointer', padding: '12px 16px', borderRadius: '8px', background: activeTab === 'stats' ? '#1f2937' : 'transparent', color: activeTab === 'stats' ? '#f8fafc' : '#94a3b8', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            Thống kê Traffic
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT: Đã fix lỗi scroll: height 100vh và overflowY auto */}
      <main style={{ flex: 1, height: '100vh', overflowY: 'auto', padding: '40px 50px', boxSizing: 'border-box' }}>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div style={{ color: '#64748b', fontSize: '1.2rem' }}>Đang đồng bộ dữ liệu hệ thống... ⏳</div>
          </div>
        ) : activeTab === 'links' ? (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 8px 0' }}>Chiến dịch Affiliate</h1>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>Theo dõi và quản lý các liên kết chuyển hướng của bạn.</p>
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ background: '#1f2937', padding: '12px 24px', borderRadius: '12px', border: '1px solid #374151', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff' }}>{links.length}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>Tổng Link</span>
                </div>
              </div>
            </header>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                <svg style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input 
                  type="text" 
                  placeholder="Tìm kiếm mã hoặc link gốc..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: '10px', border: '1px solid #374151', background: '#111318', color: '#f8fafc', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }} 
                />
              </div>
            </div>

            <div style={{ background: '#111318', borderRadius: '16px', border: '1px solid #1f2937', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
                <thead>
                  <tr style={{ background: '#181b23', borderBottom: '1px solid #1f2937' }}>
                    <th style={{ padding: '16px 24px', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mã Rút Gọn</th>
                    <th style={{ padding: '16px 24px', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Link Gốc & Tín Hiệu</th>
                    <th style={{ padding: '16px 24px', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ngày Lên Camp</th>
                    <th style={{ padding: '16px 24px', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(groupedLinks).length === 0 ? (
                    <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Không tìm thấy chiến dịch nào.</td></tr>
                  ) : (
                    Object.entries(groupedLinks).map(([netName, group]) => {
                      const isExpanded = search !== '' || expandedGroups[netName];
                      return (
                        <React.Fragment key={netName}>
                          <tr onClick={() => toggleGroup(netName)} style={{ background: '#1e293b', borderBottom: '1px solid #334155', cursor: 'pointer', transition: 'background 0.2s', userSelect: 'none' }} onMouseEnter={(e) => e.currentTarget.style.background = '#334155'} onMouseLeave={(e) => e.currentTarget.style.background = '#1e293b'}>
                            <td colSpan="4" style={{ padding: '12px 24px', fontWeight: '700', color: group.info.text }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: group.info.text }}></span>
                                  Nền tảng: {netName.toUpperCase()} <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '500', marginLeft: '6px' }}>({group.items.length} link)</span>
                                </span>
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: '#94a3b8', transition: 'transform 0.3s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                              </div>
                            </td>
                          </tr>
                          
                          {isExpanded && group.items.map((l) => {
                            const lastClick = getLastClickInfo(l.slug);
                            return (
                              <tr key={l.id} style={{ borderBottom: '1px solid #1f2937', transition: 'background 0.15s', animation: 'fadeIn 0.2s ease-out' }} onMouseEnter={(e) => e.currentTarget.style.background = '#181b23'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                {/* MÃ RÚT GỌN */}
                                <td style={{ padding: '16px 24px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: '#64748b' }}>/</span>
                                    <strong style={{ color: '#f8fafc', letterSpacing: '0.5px' }}>{l.slug}</strong>
                                  </div>
                                </td>
                                
                                {/* LINK GỐC VÀ TÍN HIỆU CẮN SỐ */}
                                <td style={{ padding: '16px 24px', maxWidth: '350px' }}>
                                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '4px' }} title={l.original_url}>{l.original_url}</div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '500', color: lastClick.color }}>
                                    {lastClick.isDead ? (
                                      <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 2s infinite' }}></span>
                                    ) : null}
                                    {lastClick.text}
                                  </div>
                                </td>

                                {/* NGÀY LÊN CAMP */}
                                <td style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '0.9rem' }}>
                                  {new Date(l.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </td>
                                
                                {/* THAO TÁC */}
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button onClick={() => handleCopy(l.slug)} title="Copy" style={{ background: '#374151', color: '#d1d5db', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
                                    <a href={l.original_url} target="_blank" rel="noopener noreferrer" title="Mở Link" style={{ background: '#374151', color: '#d1d5db', border: 'none', padding: '8px', borderRadius: '8px', display: 'flex' }}><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>
                                    <button onClick={() => handleDelete(l.slug)} title="Xóa" style={{ background: '#374151', color: '#fca5a5', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* =========================================
                      GIAO DIỆN TAB THỐNG KÊ 
             ========================================= */
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <header style={{ marginBottom: '40px' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 8px 0' }}>Báo Cáo Hiệu Suất</h1>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>Phân tích lượng truy cập thực tế từ các phễu mồi.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: '#111318', padding: '24px', borderRadius: '16px', border: '1px solid #1f2937', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' }}>Tổng số Click (All-time)</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#10b981' }}>{clickLogs.length}</div>
              </div>
              <div style={{ background: '#111318', padding: '24px', borderRadius: '16px', border: '1px solid #1f2937', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' }}>Link Top 1 Đang Cắn</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#60a5fa', marginBottom: '4px' }}>/{topLinks[0]?.slug || 'Chưa có'}</div>
                <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>{topLinks[0]?.count || 0} lượt bấm</div>
              </div>
              <div style={{ background: '#111318', padding: '24px', borderRadius: '16px', border: '1px solid #1f2937', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' }}>Tỷ lệ Đóng Góp</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#f8fafc', lineHeight: '1.4' }}>
                  {topLinks.length > 0 ? (
                    <>Top 1 chiếm <span style={{ color: '#f43f5e' }}>{Math.round((topLinks[0].count / clickLogs.length) * 100)}%</span> traffic.</>
                  ) : 'Đang đợi data...'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: '#111318', borderRadius: '16px', border: '1px solid #1f2937', padding: '24px' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#f8fafc' }}>🌐 Phân bổ Nguồn Traffic</h3>
                {topReferrers.length === 0 ? <p style={{ color: '#64748b' }}>Chưa có dữ liệu</p> : 
                  topReferrers.map(([name, count], index) => {
                    const percent = Math.round((count / clickLogs.length) * 100);
                    return (
                      <div key={name} style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                          <span style={{ color: '#cbd5e1', fontWeight: '500' }}>{name}</span>
                          <span style={{ color: '#94a3b8' }}>{count} click ({percent}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${percent}%`, height: '100%', background: index === 0 ? '#3b82f6' : '#6366f1', borderRadius: '4px', transition: 'width 1s ease-out' }}></div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>

              <div style={{ background: '#111318', borderRadius: '16px', border: '1px solid #1f2937', padding: '24px' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#f8fafc' }}>📱 Tỷ lệ Hệ điều hành</h3>
                {topDevices.length === 0 ? <p style={{ color: '#64748b' }}>Chưa có dữ liệu</p> : 
                  topDevices.map(([name, count], index) => {
                    const percent = Math.round((count / clickLogs.length) * 100);
                    return (
                      <div key={name} style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                          <span style={{ color: '#cbd5e1', fontWeight: '500' }}>{name}</span>
                          <span style={{ color: '#94a3b8' }}>{count} click ({percent}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${percent}%`, height: '100%', background: index === 0 ? '#10b981' : '#34d399', borderRadius: '4px', transition: 'width 1s ease-out' }}></div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>

            <div style={{ background: '#111318', borderRadius: '16px', border: '1px solid #1f2937', padding: '24px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#f8fafc' }}>🔥 Bảng Xếp Hạng Chiến Dịch</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1f2937', color: '#94a3b8', fontSize: '0.85rem' }}>
                    <th style={{ paddingBottom: '12px', fontWeight: '600' }}>TOP</th>
                    <th style={{ paddingBottom: '12px', fontWeight: '600' }}>Mã Rút Gọn</th>
                    <th style={{ paddingBottom: '12px', fontWeight: '600' }}>Nền Tảng</th>
                    <th style={{ paddingBottom: '12px', fontWeight: '600', textAlign: 'right' }}>Tổng Click</th>
                  </tr>
                </thead>
                <tbody>
                  {topLinks.map((link, idx) => (
                    <tr key={link.slug} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '16px 0', color: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : '#64748b', fontWeight: 'bold' }}>
                        #{idx + 1}
                      </td>
                      <td style={{ padding: '16px 0', color: '#f8fafc', fontWeight: '500' }}>/{link.slug}</td>
                      <td style={{ padding: '16px 0', color: '#94a3b8', fontSize: '0.9rem' }}>{link.network}</td>
                      <td style={{ padding: '16px 0', color: '#10b981', fontWeight: '700', textAlign: 'right' }}>{link.count}</td>
                    </tr>
                  ))}
                  {topLinks.length === 0 && <tr><td colSpan="4" style={{ padding: '20px 0', textAlign: 'center', color: '#64748b' }}>Chưa có click nào được ghi nhận.</td></tr>}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
      `}} />
    </div>
  );
}
