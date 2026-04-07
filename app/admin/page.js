'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// --- CONFIG MÀU SẮC NETWORK (CHUẨN LIGHT THEME) ---
const getNetworkInfo = (url) => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('dinos.click')) return { name: 'Dinos', bg: '#fef2f2', text: '#ef4444', border: '#fca5a5' };
  if (lowerUrl.includes('hl-link')) return { name: 'Hyperlead', bg: '#eef2ff', text: '#6366f1', border: '#a5b4fc' };
  if (lowerUrl.includes('accesstrade')) return { name: 'Accesstrade', bg: '#fffbeb', text: '#f59e0b', border: '#fcd34d' };
  if (lowerUrl.includes('masoffer')) return { name: 'MasOffer', bg: '#ecfdf5', text: '#10b981', border: '#6ee7b7' };
  if (lowerUrl.includes('facebook.com')) return { name: 'Social', bg: '#eff6ff', text: '#3b82f6', border: '#93c5fd' };
  return { name: 'Direct', bg: '#f8fafc', text: '#64748b', border: '#cbd5e1' };
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

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  // --- LOGIC TÍN HIỆU CẮN SỐ ---
  const getLastClickInfo = (slug) => {
    const logs = clickLogs.filter(log => log.slug === slug);
    if (logs.length === 0) return { text: 'Chưa nổ số', color: '#94a3b8', isDead: false };
    
    logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const diffHours = (new Date() - new Date(logs[0].created_at)) / (1000 * 60 * 60);

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

  const handleCopy = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
    showToast(`📋 Đã copy: /${slug}`);
  };

  const handleDelete = async (slug) => {
    const confirm = window.confirm(`Cảnh báo: Má có chắc chắn muốn xóa vĩnh viễn link /${slug} không?`);
    if (!confirm) return;
    const previousLinks = [...links];
    setLinks(links.filter(l => l.slug !== slug));
    
    try {
      const res = await fetch('/api/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) });
      if (!res.ok) throw new Error('Lỗi từ Server');
      showToast(`✅ Đã bay màu /${slug} thành công!`);
    } catch (error) {
      setLinks(previousLinks);
      showToast(`❌ Lỗi không xóa được! Vui lòng thử lại.`);
    }
  };

  // --- THỐNG KÊ TRAFFIC ---
  const clickCounts = clickLogs.reduce((acc, log) => { acc[log.slug] = (acc[log.slug] || 0) + 1; return acc; }, {});
  const topLinks = Object.entries(clickCounts)
    .map(([slug, count]) => {
      const linkData = links.find(l => l.slug === slug);
      return { slug, count, network: linkData ? getNetworkInfo(linkData.original_url).name : 'Unknown' };
    })
    .sort((a, b) => b.count - a.count);

  const referrerCounts = clickLogs.reduce((acc, log) => {
    let ref = log.referrer || 'Direct (Truy cập thẳng)';
    const lowerRef = ref.toLowerCase();
    if (lowerRef.includes('facebook.com')) ref = 'Facebook';
    else if (lowerRef.includes('tiktok.com')) ref = 'TikTok';
    else if (lowerRef.includes('threads.net')) ref = 'Threads';
    else if (lowerRef.includes('zalo')) ref = 'Zalo';
    else if (lowerRef.startsWith('http')) { try { ref = new URL(ref).hostname; } catch(e){} }
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f5f8', color: '#0f172a', fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* TOAST */}
      {toast && (
        <div className="toast-anim" style={{ position: 'fixed', bottom: '24px', right: '24px', background: toast.includes('❌') ? '#ef4444' : '#0f172a', color: '#fff', padding: '14px 24px', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', zIndex: 100, fontWeight: '600', fontSize: '14px' }}>
          {toast}
        </div>
      )}

      {/* SIDEBAR SẠCH SẼ */}
      <aside style={{ width: '280px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', padding: '32px 24px', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #2563eb, #4f46e5)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '18px', boxShadow: '0 4px 12px rgba(37,99,235,0.3)' }}>B</div>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.5px', color: '#0f172a' }}>BINHTIENTI</span>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={() => setActiveTab('links')} className="nav-btn" style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'links' ? '#eff6ff' : 'transparent', color: activeTab === 'links' ? '#2563eb' : '#64748b', fontWeight: '600', fontSize: '15px', transition: 'all 0.2s' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            Quản lý Phễu
          </button>
          <button onClick={() => setActiveTab('stats')} className="nav-btn" style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '14px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: activeTab === 'stats' ? '#eff6ff' : 'transparent', color: activeTab === 'stats' ? '#2563eb' : '#64748b', fontWeight: '600', fontSize: '15px', transition: 'all 0.2s' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            Báo cáo Traffic
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: '40px 50px', maxWidth: '1200px', boxSizing: 'border-box' }}>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94a3b8', fontWeight: '500', fontSize: '1.2rem' }}>Đang tải dữ liệu... ⏳</div>
        ) : activeTab === 'links' ? (
          
          /* TAB 1: QUẢN LÝ LINKS */
          <div className="fade-in">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.5px', color: '#0f172a' }}>Chiến dịch Affiliate</h1>
                <p style={{ color: '#64748b', margin: 0, fontSize: '1rem', fontWeight: '500' }}>Toàn bộ link rút gọn và trạng thái phễu mồi.</p>
              </div>
              <div style={{ background: '#fff', padding: '12px 24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', background: '#eff6ff', color: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: '800' }}>{links.length}</div>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '1rem', color: '#0f172a' }}>Tổng Link</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Hệ thống</div>
                </div>
              </div>
            </header>

            {/* THANH TÌM KIẾM */}
            <div style={{ background: '#fff', padding: '6px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '32px', display: 'flex', alignItems: 'center' }}>
              <svg style={{ color: '#94a3b8', marginLeft: '16px' }} width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input 
                type="text" 
                placeholder="Tìm mã camp, slug hoặc url gốc..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                style={{ width: '100%', border: 'none', background: 'transparent', padding: '14px 16px', outline: 'none', fontSize: '1rem', fontWeight: '500', color: '#0f172a' }}
              />
            </div>

            {/* DANH SÁCH THEO TỪNG CARD NỀN TẢNG (HIỆN ĐẠI HƠN TABLE) */}
            {Object.keys(groupedLinks).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', fontWeight: '500', background: '#fff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>Không tìm thấy link nào.</div>
            ) : (
              Object.entries(groupedLinks).map(([netName, group]) => {
                const isExpanded = search !== '' || expandedGroups[netName];
                return (
                  <div key={netName} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '24px' }}>
                    
                    {/* Header Nhóm */}
                    <div onClick={() => toggleGroup(netName)} className="group-header" style={{ background: '#f8fafc', padding: '20px 24px', borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: group.info.text, boxShadow: `0 0 0 4px ${group.info.bg}` }}></span>
                        <span style={{ fontWeight: '800', color: '#0f172a', letterSpacing: '0.5px', fontSize: '1.1rem' }}>{netName.toUpperCase()}</span>
                        <span style={{ background: '#e2e8f0', color: '#475569', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>{group.items.length} link</span>
                      </div>
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ color: '#94a3b8', transition: 'transform 0.3s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                    
                    {/* Danh Sách Bên Trong Nhóm */}
                    {isExpanded && (
                      <div>
                        {group.items.map((l, idx) => {
                          const lastClick = getLastClickInfo(l.slug);
                          const isLast = idx === group.items.length - 1;
                          return (
                            <div key={l.id} className="link-row" style={{ padding: '20px 24px', borderBottom: isLast ? 'none' : '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1.2fr 2fr 1fr 120px', gap: '20px', alignItems: 'center' }}>
                              
                              {/* 1. Mã Rút Gọn */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ color: '#cbd5e1', fontWeight: '700' }}>/</span>
                                <strong style={{ color: '#0f172a', fontSize: '1.05rem', letterSpacing: '-0.3px' }}>{l.slug}</strong>
                              </div>

                              {/* 2. Link Gốc & Tín Hiệu */}
                              <div style={{ overflow: 'hidden' }}>
                                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#64748b', fontSize: '0.9rem', fontWeight: '500', marginBottom: '6px' }} title={l.original_url}>
                                  {l.original_url}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700', color: lastClick.color }}>
                                  {lastClick.isDead && (
                                    <div style={{ position: 'relative', width: '8px', height: '8px' }}>
                                      <div className="pulse-dot" style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: '#fca5a5', borderRadius: '50%', opacity: 0.7 }}></div>
                                      <div style={{ position: 'relative', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }}></div>
                                    </div>
                                  )}
                                  {lastClick.text}
                                </div>
                              </div>

                              {/* 3. Ngày Lên Camp (Chức năng giữ nguyên) */}
                              <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: '500' }}>
                                {new Date(l.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </div>

                              {/* 4. Thao Tác */}
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button onClick={() => handleCopy(l.slug)} title="Copy" className="action-btn text-slate"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
                                <a href={l.original_url} target="_blank" rel="noopener noreferrer" title="Mở Link" className="action-btn text-slate" style={{ display: 'flex' }}><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>
                                <button onClick={() => handleDelete(l.slug)} title="Xóa" className="action-btn text-red"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
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

          /* =========================================
                      GIAO DIỆN TAB THỐNG KÊ 
             ========================================= */
          <div className="fade-in">
            <header style={{ marginBottom: '40px' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>Báo Cáo Hiệu Suất</h1>
              <p style={{ color: '#64748b', margin: 0, fontSize: '1rem', fontWeight: '500' }}>Phân tích lượng truy cập thực tế từ các phễu mồi.</p>
            </header>

            {/* 3 KHỐI CHỈ SỐ TỔNG QUAN */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: '700' }}>Tổng số Click (All-time)</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a' }}>{clickLogs.length}</div>
              </div>
              <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: '700' }}>Link Top 1 Đang Cắn</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#2563eb', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>/{topLinks[0]?.slug || 'Chưa có'}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: '600' }}>{topLinks[0]?.count || 0} lượt bấm</div>
              </div>
              <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: '700' }}>Tỷ lệ Đóng Góp</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#0f172a', lineHeight: '1.4' }}>
                  {topLinks.length > 0 ? (
                    <>Top 1 chiếm <span style={{ color: '#10b981', fontWeight: '800' }}>{Math.round((topLinks[0].count / clickLogs.length) * 100)}%</span> traffic.</>
                  ) : <span style={{ color: '#94a3b8' }}>Đang đợi data...</span>}
                </div>
              </div>
            </div>

            {/* 2 KHỐI BAR CHART THỐNG KÊ CHI TIẾT */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 24px 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: '800' }}>🌐 Nguồn Traffic</h3>
                {topReferrers.length === 0 ? <p style={{ color: '#94a3b8', fontWeight: '500' }}>Chưa có dữ liệu</p> : 
                  topReferrers.map(([name, count], index) => {
                    const percent = Math.round((count / clickLogs.length) * 100);
                    return (
                      <div key={name} style={{ marginBottom: '18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
                          <span style={{ color: '#334155' }}>{name}</span>
                          <span style={{ color: '#64748b' }}>{count} ({percent}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{ width: `${percent}%`, height: '100%', background: index === 0 ? '#3b82f6' : '#94a3b8', borderRadius: '99px' }}></div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>

              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h3 style={{ margin: '0 0 24px 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: '800' }}>📱 Hệ điều hành</h3>
                {topDevices.length === 0 ? <p style={{ color: '#94a3b8', fontWeight: '500' }}>Chưa có dữ liệu</p> : 
                  topDevices.map(([name, count], index) => {
                    const percent = Math.round((count / clickLogs.length) * 100);
                    return (
                      <div key={name} style={{ marginBottom: '18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>
                          <span style={{ color: '#334155' }}>{name}</span>
                          <span style={{ color: '#64748b' }}>{count} ({percent}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{ width: `${percent}%`, height: '100%', background: index === 0 ? '#10b981' : '#94a3b8', borderRadius: '99px' }}></div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>

            {/* BẢNG XẾP HẠNG */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#0f172a', fontWeight: '800' }}>🔥 Bảng Xếp Hạng Chiến Dịch</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <th style={{ paddingBottom: '16px', fontWeight: '700' }}>TOP</th>
                    <th style={{ paddingBottom: '16px', fontWeight: '700' }}>Mã Rút Gọn</th>
                    <th style={{ paddingBottom: '16px', fontWeight: '700' }}>Nền Tảng</th>
                    <th style={{ paddingBottom: '16px', fontWeight: '700', textAlign: 'right' }}>Tổng Click</th>
                  </tr>
                </thead>
                <tbody>
                  {topLinks.map((link, idx) => (
                    <tr key={link.slug} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '20px 0', color: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : '#64748b', fontWeight: '800', fontSize: '1.1rem' }}>
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

      {/* --- STYLES CHỐNG VỠ & HOVER (DÙNG NỘI TUYẾN 100%) --- */}
      <style dangerouslySetInnerHTML={{__html: `
        .fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .toast-anim { animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        @keyframes pulse { 75%, 100% { transform: scale(2.5); opacity: 0; } }
        .pulse-dot { animation: pulse 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; }
        
        .nav-btn:hover { background-color: #f1f5f9 !important; color: #0f172a !important; }
        .group-header:hover { background-color: #f1f5f9 !important; }
        .link-row:hover { background-color: #f8fafc !important; }
        
        .action-btn { background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 10px; cursor: pointer; transition: all 0.2s ease; outline: none; }
        .action-btn.text-slate { color: #64748b; }
        .action-btn.text-slate:hover { background: #eff6ff; border-color: #bfdbfe; color: #2563eb; }
        .action-btn.text-red { color: #ef4444; }
        .action-btn.text-red:hover { background: #fef2f2; border-color: #fca5a5; color: #dc2626; }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}
