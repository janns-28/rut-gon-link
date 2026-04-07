'use client';
import React, { useState, useEffect } from 'react';
// Giả sử mày đã config cái này trong file /lib/supabase.js
import { supabase } from '@/lib/supabase';

// --- CONFIG MÀU SẮC NETWORK (GIAO DIỆN TỐI NÊN DÙNG MÀU SÁNG HƠN) ---
const getNetworkInfo = (url) => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('dinos.click')) return { name: 'Dinos', color: '#fca5a5', bg: '#450a0a' }; // Red 300, 950
  if (lowerUrl.includes('hl-link')) return { name: 'Hyperlead', color: '#c7d2fe', bg: '#1e1b4b' }; // Indigo 200, 950
  if (lowerUrl.includes('accesstrade')) return { name: 'Accesstrade', color: '#fde68a', bg: '#451a03' }; // Amber 200, 950
  if (lowerUrl.includes('masoffer')) return { name: 'MasOffer', color: '#a7f3d0', bg: '#064e3b' }; // Emerald 200, 950
  if (lowerUrl.includes('facebook.com')) return { name: 'Social', color: '#93c5fd', bg: '#172554' }; // Blue 300, 950
  return { name: 'Direct', color: '#e2e8f0', bg: '#1f2937' }; // Slate 200, 800
};

export default function PremiumAdmin() {
  const [links, setLinks] = useState([]);
  const [clickLogs, setClickLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [activeTab, setActiveTab] = useState('links'); // 'links' hoặc 'stats'

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
    setTimeout(() => setToast(''), 2500);
  };

  // --- LOGIC BÁO ĐỘNG SỐNG CHẾT (MÀU TÍN HIỆU) ---
  const getLastClickInfo = (slug) => {
    const logs = clickLogs.filter(log => log.slug === slug);
    if (logs.length === 0) return { text: 'Chưa có data', color: '#94a3b8', isDead: false };
    
    logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const lastLogTime = new Date(logs[0].created_at);
    const now = new Date();
    const diffHours = (now - lastLogTime) / (1000 * 60 * 60);

    if (diffHours < 1) return { text: 'Vừa cắn số 🔥', color: '#10b981', isDead: false }; // Emerald 500
    if (diffHours < 3) return { text: `${Math.floor(diffHours)}h trước`, color: '#fbbf24', isDead: false }; // Amber 400
    return { text: `Đứng im >${Math.floor(diffHours)}h`, color: '#ef4444', isDead: true }; // Red 500
  };

  const filteredLinks = links.filter(l => 
    l.slug.toLowerCase().includes(search.toLowerCase()) || 
    l.original_url.toLowerCase().includes(search.toLowerCase())
  );

  // Gom nhóm thông minh (Hơn cái list lộn xộn cũ của má)
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
    showToast(`📋 Đã copy: /${slug}`);
  };

  const handleDelete = async (slug) => {
    const confirm = window.confirm(`Cảnh báo: Má có chắc chắn muốn xóa vĩnh viễn link /${slug} không? Hành động này đéo hoàn tác được.`);
    if (!confirm) return;
    
    // Optimistic UI (Xóa luôn trong state cho mượt, nếu lỗi API thì nạp lại data)
    const previousLinks = [...links];
    setLinks(links.filter(l => l.slug !== slug));
    
    try {
      const res = await fetch('/api/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) });
      if (!res.ok) throw new Error('Lỗi từ Server');
      showToast(`✅ Đã xóa /${slug} thành công!`);
    } catch (error) {
      setLinks(previousLinks);
      showToast(`❌ Lỗi không xóa được! Vui lòng kiểm tra lại API.`);
    }
  };

  // --- XỬ LÝ DỮ LIỆU TAB THỐNG KÊ (Giữ nguyên logic của má) ---
  const clickCounts = clickLogs.reduce((acc, log) => { acc[log.slug] = (acc[log.slug] || 0) + 1; return acc; }, {});
  const topLinks = Object.entries(clickCounts)
    .map(([slug, count]) => ({ slug, count, originalUrl: links.find(l => l.slug === slug)?.original_url || 'N/A' }))
    .sort((a, b) => b.count - a.count);

  const referrerCounts = clickLogs.reduce((acc, log) => {
    let ref = log.referrer || 'Direct (Truy cập thẳng)';
    const lowerRef = ref.toLowerCase();
    if (lowerRef.includes('facebook.com')) ref = 'Facebook';
    else if (lowerRef.includes('tiktok.com')) ref = 'TikTok';
    else if (lowerRef.includes('threads.net')) ref = 'Threads';
    else if (lowerRef.includes('zalo')) ref = 'Zalo';
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
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {});
  const topDevices = Object.entries(deviceCounts).sort((a, b) => b[1] - a[1]);

  // CSS classes bôi vào các thẻ div thay vì dùng Tailwind (màu sắc Dark mode chuẩn Fintech)
  const cardStyle = { background: '#111318', padding: '24px', borderRadius: '16px', border: '1px solid #1f2937', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
  const actionBtnStyle = { background: '#1f2937', color: '#cbd5e1', border: '1px solid #374151', padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', outline: 'none', transition: 'all 0.15s' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f1115', color: '#e2e8f0', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif' }}>
      
      {/* TOAST ALERTS */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', padding: '12px 24px', borderRadius: '12px', background: toast.includes('❌') ? '#ef4444' : '#10b981', color: '#fff', fontSize: '0.9rem', fontWeight: '600', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', zIndex: 50 }}>
          {toast}
        </div>
      )}

      {/* SIDEBAR TỐI GIẢN */}
      <aside style={{ width: '260px', borderRight: '1px solid #1f2937', backgroundColor: '#111318', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>B</div>
          <span style={{ fontSize: '1.2rem', fontWeight: '700', letterSpacing: '0.5px', color: '#f8fafc' }}>BINHTIENTI</span>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={() => setActiveTab('links')} style={{ ...actionBtnStyle, width: '100%', border: 'none', background: activeTab === 'links' ? '#1f2937' : 'transparent', color: activeTab === 'links' ? '#f8fafc' : '#94a3b8', fontWeight: '600', gap: '12px' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            Quản lý Links
          </button>
          <button onClick={() => setActiveTab('stats')} style={{ ...actionBtnStyle, width: '100%', border: 'none', background: activeTab === 'stats' ? '#1f2937' : 'transparent', color: activeTab === 'stats' ? '#f8fafc' : '#94a3b8', fontWeight: '600', gap: '12px' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            Thống kê Traffic
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: '40px 50px', overflowY: 'auto' }}>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>Đang nạp dữ liệu hệ thống... ⏳</div>
        ) : activeTab === 'links' ? (
          
          /* =========================================
                      GIAO DIỆN TAB QUẢN LÝ
             ========================================= */
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Chiến dịch Affiliate</h1>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem', fontWeight: '500' }}>Theo dõi sức khỏe và kiểm soát sinh tử của toàn bộ luồng traffic.</p>
              </div>
              <div style={{ ...cardStyle, padding: '12px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff' }}>{links.length}</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px', fontWith: '600' }}>Tổng Link</span>
              </div>
            </header>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                <svg style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input type="text" placeholder="Tìm kiếm mã rút gọn hoặc link gốc..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: '12px', border: '1px solid #1f2937', background: '#111318', color: '#f8fafc', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* BỐ CỤC GOM NHÓM NỀN TẢNG (CHỐNG LẠN MẮT) */}
            {Object.keys(groupedLinks).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>Chưa có link nào phù hợp. Bơm view đi mài ơi.</div>
            ) : (
              Object.entries(groupedLinks).map(([netName, group]) => {
                const isExpanded = search !== '' || expandedGroups[netName];
                return (
                  <div key={netName} style={{ background: '#111318', borderRadius: '16px', border: '1px solid #1f2937', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}>
                    
                    {/* Header của Ô Nền Tảng */}
                    <div onClick={() => toggleGroup(netName)} style={{ background: '#181b23', padding: '16px 24px', borderBottom: isExpanded ? '1px solid #1f2937' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none' }} className="group-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: group.info.color }}></span>
                        <span style={{ fontWeight: '800', color: group.info.color, letterSpacing: '0.5px' }}>{netName.toUpperCase()}</span>
                        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>({group.items.length} links)</span>
                      </div>
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ color: '#64748b', transition: 'transform 0.3s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                    
                    {/* BẢNG LINKS BÊN TRONG NỀN TẢNG */}
                    {isExpanded && (
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
                        <thead>
                          <tr style={{ color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            <th style={{ padding: '16px 24px', fontWeight: '600' }}>Mã Rút Gọn</th>
                            <th style={{ padding: '16px 24px', fontWeight: '600' }}>Link Chuyển Hướng</th>
                            <th style={{ padding: '16px 24px', fontWeight: '600' }}>Lần cuối có khách bấm</th>
                            <th style={{ padding: '16px 24px', fontWeight: '600', textAlign: 'right' }}>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.items.map((l) => {
                            const lastClick = getLastClickInfo(l.slug);
                            return (
                              <tr key={l.id} style={{ borderTop: '1px solid #1f2937' }} className="admin-row">
                                <td style={{ padding: '16px 24px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span style={{ color: '#64748b' }}>/</span><strong style={{ color: '#f8fafc', letterSpacing: '0.5px', fontSize: '1rem' }}>{l.slug}</strong></div>
                                </td>
                                <td style={{ padding: '16px 24px', maxWidth: '300px' }}>
                                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#cbd5e1', fontSize: '0.9rem' }} title={l.original_url}>{l.original_url}</div>
                                </td>
                                
                                {/* CỘT TÍN HIỆU (NHÁY ĐỎ NẾU CHẾT LINK) */}
                                <td style={{ padding: '16px 24px', color: lastClick.color, fontWeight: '600', fontSize: '0.85rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {lastClick.isDead && <div className="animate-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>}
                                    {lastClick.text}
                                  </div>
                                </td>
                                
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button onClick={() => handleCopy(l.slug)} title="Copy" style={actionBtnStyle} className="btn-action-copy"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
                                    <a href={l.original_url} target="_blank" rel="noopener noreferrer" title="Mở Link" style={actionBtnStyle} className="btn-action-open"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>
                                    <button onClick={() => handleDelete(l.slug)} title="Xóa" style={{ ...actionBtnStyle, color: '#fca5a5', border: '1px solid #7f1d1d' }} className="btn-action-delete"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                );
              })
            )}
          </div>

        ) : (
          
          /* =========================================
                      GIAO DIỆN TAB THỐNG KÊ
             ========================================= */
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <header style={{ marginBottom: '40px' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f8fafc', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Báo Cáo Hiệu Suất</h1>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>Phân tích lượng truy cập thực tế từ các phễu mồi.</p>
            </header>

            {/* Ô CHỈ SỐ LỚN (Giao diện sạch sẽ) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={cardStyle}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' }}>Tổng số Click (All-time)</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#10b981' }}>{clickLogs.length}</div>
              </div>
              <div style={cardStyle}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' }}>Link Top 1 Đang Cắn</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#60a5fa', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>/{topLinks[0]?.slug || 'Chưa có'}</div>
                <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>{topLinks[0]?.count || 0} lượt bấm</div>
              </div>
              <div style={cardStyle}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' }}>Tỷ lệ Đóng Góp</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc', lineHeight: '1.4' }}>
                  {topLinks.length > 0 ? (
                    <>Top 1 chiếm <span style={{ color: '#f43f5e', fontWeight: '800' }}>{Math.round((topLinks[0].count / clickLogs.length) * 100)}%</span> traffic.</>
                  ) : 'Chưa có data mài ơi.'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              {/* Nguồn Traffic */}
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#f8fafc', fontWeight: '700' }}>🌐 Phân bổ Nguồn Traffic</h3>
                {topReferrers.length === 0 ? <p style={{ color: '#64748b' }}>Chưa có data.</p> : 
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

              {/* Thiết bị */}
              <div style={cardStyle}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#f8fafc', fontWeight: '700' }}>📱 Hệ điều hành của khách vay</h3>
                {topDevices.length === 0 ? <p style={{ color: '#64748b' }}>Chưa có data.</p> : 
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

            {/* BẢNG XẾP HẠNG (CHÍNH ZÁC) */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#f8fafc', fontWeight: '700' }}>🔥 Bảng Xếp Hạng Chiến Dịch</h3>
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

      {/* CHỈ DÙNG STYLE ĐỂ ĐỊNH NGHĨA ANIMATION VÀ HOVER (KHÔNG DÙNG CLASS NGOÀI) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
        .admin-row:hover { background-color: #16181e; }
        .group-header:hover { background-color: #1f2937 !important; }
        .animate-pulse { animation: pulse 1.5s infinite; }
        .btn-action-copy:hover { border: 1px solid #3b82f6 !important; background-color: #172554 !important; color: #f8fafc !important; }
        .btn-action-open:hover { border: 1px solid #8b5cf6 !important; background-color: #1e1b4b !important; color: #f8fafc !important; }
        .btn-action-delete:hover { background-color: #450a0a !important; color: #fff !important; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #4b5563; }
      `}} />
    </div>
  );
}
