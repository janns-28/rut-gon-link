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
  return { name: 'Direct', bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' };
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
    if (logs.length === 0) return { text: 'Chưa nổ số', color: '#94a3b8', isDead: false };
    
    logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const lastLogTime = new Date(logs[0].created_at);
    const now = new Date();
    const diffHours = (now - lastLogTime) / (1000 * 60 * 60);

    if (diffHours < 1) return { text: 'Vừa cắn số 🔥', color: '#10b981', isDead: false };
    if (diffHours < 3) return { text: `Tầm ${Math.floor(diffHours)}h trước`, color: '#f59e0b', isDead: false };
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

  const handleCopy = (e, slug) => {
    e.stopPropagation();
    const fullUrl = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setToast(`📋 Đã copy: /${slug}`);
    setTimeout(() => setToast(''), 2500);
  };

  const handleDelete = async (e, slug) => {
    e.stopPropagation();
    const confirm = window.confirm(`Cảnh báo: Má có chắc chắn muốn xóa vĩnh viễn link /${slug} không?`);
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

  // CSS classes chuẩn style "từng ô" của ảnh SaaS B2B
  const cardStyle = { background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', overflow: 'hidden' };
  const actionBtnStyle = { background: '#f1f5f9', color: '#64748b', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', transition: 'all 0.2s' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f5f8', color: '#1e293b', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif' }}>
      
      {toast && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: toast.includes('❌') ? '#ef4444' : '#10b981', color: '#fff', padding: '12px 24px', borderRadius: '10px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', zIndex: 50, fontWeight: '500', animation: 'slideIn 0.3s ease-out' }}>
          {toast}
        </div>
      )}

      {/* SIDEBAR */}
      <aside style={{ width: '260px', borderRight: '1px solid #e2e8f0', backgroundColor: '#ffffff', padding: '24px', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff', fontSize: '1.1rem', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)' }}>B</div>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '0.2px', color: '#0f172a' }}>BINHTIENTI</span>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            onClick={() => setActiveTab('links')}
            style={{ width: '100%', border: 'none', cursor: 'pointer', padding: '12px 16px', borderRadius: '10px', background: activeTab === 'links' ? '#eff6ff' : 'transparent', color: activeTab === 'links' ? '#2563eb' : '#64748b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            Quản lý Links
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            style={{ width: '100%', border: 'none', cursor: 'pointer', padding: '12px 16px', borderRadius: '10px', background: activeTab === 'stats' ? '#eff6ff' : 'transparent', color: activeTab === 'stats' ? '#2563eb' : '#64748b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            Thống kê Traffic
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: '40px 50px', overflowY: 'auto' }}>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div style={{ color: '#94a3b8', fontSize: '1.2rem', fontWeight: '500' }}>Đang đồng bộ dữ liệu hệ thống... ⏳</div>
          </div>
        ) : activeTab === 'links' ? (
          <div style={{ animation: 'fadeIn 0.3s ease-out', maxWidth: '1000px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>Chiến dịch Affiliate</h1>
                <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>Quản lý các liên kết chuyển hướng của bạn theo từng "ô" Nền Tảng.</p>
              </div>
            </header>

            {/* Ô 1: Thanh Tìm Kiếm & Thống Kê Nhanh */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
              <div style={{ ...cardStyle, position: 'relative', flex: 1, display: 'flex', alignItems: 'center', padding: '4px' }}>
                <svg style={{ position: 'absolute', left: '16px', color: '#94a3b8' }} width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input type="text" placeholder="Tìm kiếm mã rút gọn hoặc link gốc..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', padding: '12px 16px 12px 44px', border: 'none', background: 'transparent', color: '#0f172a', fontSize: '0.95rem', fontWeight: '500', outline: 'none' }} />
              </div>
              <div style={{ ...cardStyle, padding: '0 24px', display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{links.length}</span>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>TỔNG LINK</span>
              </div>
            </div>

            {/* CÁC Ô NỀN TẢNG (NETWORK CARDS) */}
            {Object.keys(groupedLinks).length === 0 ? (
              <div style={{ ...cardStyle, padding: '60px', textAlign: 'center', color: '#64748b', fontWeight: '500' }}>Không tìm thấy link nào phù hợp.</div>
            ) : (
              Object.entries(groupedLinks).map(([netName, group]) => {
                const isExpanded = search !== '' || expandedGroups[netName];
                return (
                  <div key={netName} style={{ ...cardStyle, marginBottom: '24px' }}>
                    {/* Header của Ô */}
                    <div onClick={() => toggleGroup(netName)} style={{ padding: '20px 24px', background: '#f8fafc', borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'} onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: group.info.text, boxShadow: `0 0 8px ${group.info.text}66` }}></span>
                        <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.05rem', letterSpacing: '0.5px' }}>{netName.toUpperCase()}</span>
                        <span style={{ background: '#e2e8f0', color: '#475569', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>{group.items.length} link</span>
                      </div>
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ color: '#64748b', transition: 'transform 0.3s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                    
                    {/* Danh sách link bên trong Ô */}
                    {isExpanded && (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {group.items.map((l, index) => {
                          const lastClick = getLastClickInfo(l.slug);
                          const isLastItem = index === group.items.length - 1;
                          return (
                            <div key={l.id} style={{ display: 'flex', alignItems: 'center', padding: '20px 24px', borderBottom: isLastItem ? 'none' : '1px solid #e2e8f0', transition: 'background 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                              
                              {/* Cột 1: Mã Rút Gọn */}
                              <div style={{ flex: '1', minWidth: '150px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ color: '#94a3b8', fontWeight: '600' }}>/</span>
                                  <strong style={{ color: '#0f172a', letterSpacing: '0.3px', fontSize: '1rem' }}>{l.slug}</strong>
                                </div>
                              </div>

                              {/* Cột 2: Link Gốc & Tín Hiệu */}
                              <div style={{ flex: '2', padding: '0 20px', minWidth: '300px' }}>
                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', color: '#475569', fontSize: '0.9rem', marginBottom: '6px', fontWeight: '500', whiteSpace: 'nowrap', maxWidth: '350px' }} title={l.original_url}>{l.original_url}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '600', color: lastClick.color }}>
                                  {lastClick.isDead ? (
                                    <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 2s infinite' }}></span>
                                  ) : null}
                                  {lastClick.text}
                                </div>
                              </div>

                              {/* Cột 3: Thao tác */}
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button onClick={(e) => handleCopy(e, l.slug)} title="Copy" style={actionBtnStyle} onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'} onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
                                <a onClick={(e) => e.stopPropagation()} href={l.original_url} target="_blank" rel="noopener noreferrer" title="Mở Link" style={{...actionBtnStyle, textDecoration: 'none'}} onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'} onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>
                                <button onClick={(e) => handleDelete(e, l.slug)} title="Xóa" style={{...actionBtnStyle, color: '#ef4444', background: '#fee2e2'}} onMouseEnter={(e) => e.currentTarget.style.background = '#fecaca'} onMouseLeave={(e) => e.currentTarget.style.background = '#fee2e2'}><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <header style={{ marginBottom: '40px' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Báo Cáo Hiệu Suất</h1>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>Phân tích lượng truy cập thực tế từ các phễu mồi.</p>
            </header>

            {/* CÁC Ô CHỈ SỐ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              <div style={{ ...cardStyle, padding: '24px' }}>
                <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: '700' }}>Tổng số Click (All-time)</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a' }}>{clickLogs.length}</div>
              </div>
              <div style={{ ...cardStyle, padding: '24px' }}>
                <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: '700' }}>Link Top 1 Đang Cắn</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#2563eb', marginBottom: '4px' }}>/{topLinks[0]?.slug || 'Chưa có'}</div>
                <div style={{ color: '#475569', fontSize: '0.9rem', fontWeight: '500' }}>{topLinks[0]?.count || 0} lượt bấm</div>
              </div>
              <div style={{ ...cardStyle, padding: '24px' }}>
                <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: '700' }}>Tỷ lệ Đóng Góp</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a', lineHeight: '1.4' }}>
                  {topLinks.length > 0 ? (
                    <>Top 1 chiếm <span style={{ color: '#10b981' }}>{Math.round((topLinks[0].count / clickLogs.length) * 100)}%</span> traffic.</>
                  ) : 'Đang đợi data...'}
                </div>
              </div>
            </div>

            {/* CÁC Ô BIỂU ĐỒ NGUỒN & THIẾT BỊ */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
              <div style={{ ...cardStyle, padding: '24px' }}>
                <h3 style={{ margin: '0 0 24px 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: '700' }}>🌐 Phân bổ Nguồn Traffic</h3>
                {topReferrers.length === 0 ? <p style={{ color: '#94a3b8' }}>Chưa có dữ liệu</p> : 
                  topReferrers.map(([name, count], index) => {
                    const percent = Math.round((count / clickLogs.length) * 100);
                    return (
                      <div key={name} style={{ marginBottom: '18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                          <span style={{ color: '#1e293b', fontWeight: '600' }}>{name}</span>
                          <span style={{ color: '#64748b', fontWeight: '500' }}>{count} click ({percent}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${percent}%`, height: '100%', background: index === 0 ? '#3b82f6' : '#8b5cf6', borderRadius: '4px', transition: 'width 1s ease-out' }}></div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>

              <div style={{ ...cardStyle, padding: '24px' }}>
                <h3 style={{ margin: '0 0 24px 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: '700' }}>📱 Tỷ lệ Hệ điều hành</h3>
                {topDevices.length === 0 ? <p style={{ color: '#94a3b8' }}>Chưa có dữ liệu</p> : 
                  topDevices.map(([name, count], index) => {
                    const percent = Math.round((count / clickLogs.length) * 100);
                    return (
                      <div key={name} style={{ marginBottom: '18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                          <span style={{ color: '#1e293b', fontWeight: '600' }}>{name}</span>
                          <span style={{ color: '#64748b', fontWeight: '500' }}>{count} click ({percent}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${percent}%`, height: '100%', background: index === 0 ? '#10b981' : '#34d399', borderRadius: '4px', transition: 'width 1s ease-out' }}></div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>

            {/* Ô BẢNG XẾP HẠNG */}
            <div style={{ ...cardStyle, padding: '24px' }}>
              <h3 style={{ margin: '0 0 24px 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: '700' }}>🔥 Bảng Xếp Hạng Chiến Dịch</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                    <th style={{ paddingBottom: '16px', fontWeight: '700' }}>TOP</th>
                    <th style={{ paddingBottom: '16px', fontWeight: '700' }}>Mã Rút Gọn</th>
                    <th style={{ paddingBottom: '16px', fontWeight: '700' }}>Nền Tảng</th>
                    <th style={{ paddingBottom: '16px', fontWeight: '700', textAlign: 'right' }}>Tổng Click</th>
                  </tr>
                </thead>
                <tbody>
                  {topLinks.map((link, idx) => (
                    <tr key={link.slug} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '20px 0', color: idx === 0 ? '#f59e0b' : idx === 1 ? '#64748b' : idx === 2 ? '#b45309' : '#94a3b8', fontWeight: '800', fontSize: '1.1rem' }}>
                        #{idx + 1}
                      </td>
                      <td style={{ padding: '20px 0', color: '#0f172a', fontWeight: '700' }}>/{link.slug}</td>
                      <td style={{ padding: '20px 0', color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>{link.network}</td>
                      <td style={{ padding: '20px 0', color: '#10b981', fontWeight: '800', textAlign: 'right', fontSize: '1.1rem' }}>{link.count}</td>
                    </tr>
                  ))}
                  {topLinks.length === 0 && <tr><td colSpan="4" style={{ padding: '24px 0', textAlign: 'center', color: '#94a3b8', fontWeight: '500' }}>Chưa có click nào được ghi nhận.</td></tr>}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}
