'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const getNetworkInfo = (url) => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('dinos.click')) return { name: 'Dinos', bg: 'rgba(255, 59, 48, 0.1)', text: '#FF3B30', border: 'rgba(255, 59, 48, 0.2)' };
  if (lowerUrl.includes('hl-link')) return { name: 'Hyperlead', bg: 'rgba(88, 86, 214, 0.1)', text: '#5E5CE6', border: 'rgba(88, 86, 214, 0.2)' };
  if (lowerUrl.includes('accesstrade')) return { name: 'Accesstrade', bg: 'rgba(255, 149, 0, 0.1)', text: '#FF9F0A', border: 'rgba(255, 149, 0, 0.2)' };
  if (lowerUrl.includes('masoffer')) return { name: 'MasOffer', bg: 'rgba(52, 199, 89, 0.1)', text: '#32D74B', border: 'rgba(52, 199, 89, 0.2)' };
  if (lowerUrl.includes('facebook.com')) return { name: 'Social', bg: 'rgba(0, 122, 255, 0.1)', text: '#0A84FF', border: 'rgba(0, 122, 255, 0.2)' };
  return { name: 'Direct', bg: 'rgba(142, 142, 147, 0.1)', text: '#98989D', border: 'rgba(142, 142, 147, 0.2)' };
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
        slug, count, originalUrl: linkData?.original_url || 'N/A', network: linkData ? getNetworkInfo(linkData.original_url).name : 'Unknown'
      };
    }).sort((a, b) => b.count - a.count);

  const referrerCounts = clickLogs.reduce((acc, log) => {
    let ref = log.referrer || 'Direct (Truy cập thẳng)';
    const lowerRef = ref.toLowerCase();
    if (lowerRef.includes('facebook.com')) ref = 'Facebook';
    else if (lowerRef.includes('tiktok.com')) ref = 'TikTok';
    else if (lowerRef.includes('threads.net')) ref = 'Threads';
    else if (lowerRef.includes('zalo')) ref = 'Zalo';
    else if (lowerRef.includes('instagram.com')) ref = 'Instagram';
    else if (lowerRef.includes('youtube.com')) ref = 'YouTube';
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
    else if (ua.includes('mac os') || ua.includes('macintosh')) device = 'MacBook';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {});
  const topDevices = Object.entries(deviceCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#000000', color: '#F5F5F7', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', letterSpacing: '-0.3px', backgroundImage: 'radial-gradient(circle at 50% 0%, #1c1c1e 0%, #000 80%)' }}>
      
      {toast && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: 'rgba(28, 28, 30, 0.8)', backdropFilter: 'blur(30px)', color: '#fff', padding: '12px 24px', borderRadius: '14px', border: '0.5px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', zIndex: 50, fontWeight: '600', animation: 'slideIn 0.3s ease-out' }}>
          {toast}
        </div>
      )}

      {/* SIDEBAR - CẬP NHẬT GIAO DIỆN KÍNH MỜ VÀ BORDER 0.5px */}
      <aside style={{ width: '260px', borderRight: '0.5px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(28, 28, 30, 0.3)', backdropFilter: 'blur(40px)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #0A84FF, #5E5CE6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>B</div>
          <span style={{ fontSize: '1.2rem', fontWeight: '700', letterSpacing: '-0.5px', color: '#FFFFFF' }}>BINHTIENTI</span>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            onClick={() => setActiveTab('links')}
            style={{ width: '100%', border: 'none', cursor: 'pointer', padding: '12px 16px', borderRadius: '10px', background: activeTab === 'links' ? 'rgba(255, 255, 255, 0.1)' : 'transparent', color: activeTab === 'links' ? '#FFFFFF' : '#98989D', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            Quản lý Links
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            style={{ width: '100%', border: 'none', cursor: 'pointer', padding: '12px 16px', borderRadius: '10px', background: activeTab === 'stats' ? 'rgba(255, 255, 255, 0.1)' : 'transparent', color: activeTab === 'stats' ? '#FFFFFF' : '#98989D', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            Thống kê Traffic
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: '40px 50px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div style={{ color: '#8E8E93', fontSize: '1.2rem', fontWeight: '500' }}>Đang đồng bộ dữ liệu hệ thống... ⏳</div>
          </div>
        ) : activeTab === 'links' ? (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-1px', color: '#FFFFFF', margin: '0 0 8px 0' }}>Chiến dịch Affiliate</h1>
                <p style={{ color: '#98989D', margin: 0, fontSize: '0.95rem' }}>Theo dõi và quản lý các liên kết chuyển hướng của bạn.</p>
              </div>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '12px 24px', borderRadius: '16px', border: '0.5px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-1px' }}>{links.length}</span>
                  <span style={{ fontSize: '0.75rem', color: '#8E8E93', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>Tổng Link</span>
                </div>
              </div>
            </header>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                <svg style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#8E8E93' }} width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input type="text" placeholder="Tìm kiếm mã hoặc link gốc..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: '12px', border: '0.5px solid rgba(255, 255, 255, 0.1)', background: 'rgba(255, 255, 255, 0.05)', color: '#FFFFFF', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }} />
              </div>
            </div>

            {/* BẢNG DỮ LIỆU - APPLE GLASS STYLE */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '20px', border: '0.5px solid rgba(255, 255, 255, 0.08)', overflow: 'hidden', backdropFilter: 'blur(20px)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '0.5px solid rgba(255, 255, 255, 0.08)' }}>
                    <th style={{ padding: '16px 24px', color: '#8E8E93', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mã Rút Gọn</th>
                    <th style={{ padding: '16px 24px', color: '#8E8E93', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Link Gốc</th>
                    <th style={{ padding: '16px 24px', color: '#8E8E93', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ngày Lên Camp</th>
                    <th style={{ padding: '16px 24px', color: '#8E8E93', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(groupedLinks).length === 0 ? (
                    <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#8E8E93' }}>Không tìm thấy chiến dịch nào.</td></tr>
                  ) : (
                    Object.entries(groupedLinks).map(([netName, group]) => {
                      const isExpanded = search !== '' || expandedGroups[netName];
                      return (
                        <React.Fragment key={netName}>
                          <tr onClick={() => toggleGroup(netName)} style={{ background: 'rgba(255, 255, 255, 0.01)', borderBottom: '0.5px solid rgba(255, 255, 255, 0.04)', cursor: 'pointer', transition: 'background 0.2s', userSelect: 'none' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)'}>
                            <td colSpan="4" style={{ padding: '16px 24px', fontWeight: '700', color: group.info.text }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: group.info.text }}></span>
                                  {netName.toUpperCase()} <span style={{ color: '#8E8E93', fontSize: '0.85rem', fontWeight: '500', marginLeft: '6px' }}>({group.items.length} links)</span>
                                </span>
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ color: '#8E8E93', transition: 'transform 0.3s ease', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                              </div>
                            </td>
                          </tr>
                          
                          {isExpanded && group.items.map((l) => (
                            <tr key={l.id} style={{ borderBottom: '0.5px solid rgba(255, 255, 255, 0.04)', transition: 'background 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                              <td style={{ padding: '16px 24px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><strong style={{ color: '#FFFFFF', letterSpacing: '0px' }}>/{l.slug}</strong></div></td>
                              <td style={{ padding: '16px 24px', maxWidth: '350px' }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', color: '#98989D', fontSize: '0.9rem' }} title={l.original_url}>{l.original_url}</div></td>
                              <td style={{ padding: '16px 24px', color: '#8E8E93', fontSize: '0.9rem' }}>{new Date(l.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                              <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                  <button onClick={() => handleCopy(l.slug)} title="Copy" style={{ background: 'transparent', color: '#0A84FF', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Copy</button>
                                  <button onClick={() => handleDelete(l.slug)} title="Xóa" style={{ background: 'transparent', color: '#FF3B30', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Delete</button>
                                </div>
                              </td>
                            </tr>
                          ))}
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
                      TAB THỐNG KÊ TRAFFIC
             ========================================= */
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <header style={{ marginBottom: '40px' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-1px', color: '#FFFFFF', margin: '0 0 8px 0' }}>Báo Cáo Hiệu Suất</h1>
              <p style={{ color: '#98989D', margin: 0, fontSize: '0.95rem' }}>Phân tích lượng truy cập thực tế từ các phễu mồi.</p>
            </header>

            {/* 3 THẺ TỔNG QUAN - APPLE GLASS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '24px', borderRadius: '20px', border: '0.5px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ color: '#8E8E93', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: '700' }}>Tổng số Click (All-time)</div>
                <div style={{ fontSize: '2.8rem', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-1.5px' }}>{clickLogs.length}</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '24px', borderRadius: '20px', border: '0.5px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ color: '#8E8E93', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: '700' }}>Link Top 1 Đang Cắn</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0A84FF', marginBottom: '4px', letterSpacing: '-1px' }}>/{topLinks[0]?.slug || 'N/A'}</div>
                <div style={{ color: '#98989D', fontSize: '0.9rem', fontWeight: '500' }}>{topLinks[0]?.count || 0} lượt bấm</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '24px', borderRadius: '20px', border: '0.5px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ color: '#8E8E93', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: '700' }}>Tỷ lệ Đóng Góp</div>
                <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#F5F5F7', lineHeight: '1.4' }}>
                  {topLinks.length > 0 ? (
                    <>Top 1 chiếm <span style={{ color: '#FF3B30' }}>{Math.round((topLinks[0].count / clickLogs.length) * 100)}%</span> traffic.</>
                  ) : 'Đang đợi data...'}
                </div>
              </div>
            </div>

            {/* PHẦN BIỂU ĐỒ BARS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '20px', border: '0.5px solid rgba(255, 255, 255, 0.08)', padding: '32px' }}>
                <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', color: '#FFFFFF', fontWeight: '700' }}>Phân bổ Nguồn Traffic</h3>
                {topReferrers.length === 0 ? <p style={{ color: '#8E8E93' }}>Chưa có dữ liệu</p> : 
                  topReferrers.map(([name, count], index) => {
                    const percent = Math.round((count / clickLogs.length) * 100);
                    return (
                      <div key={name} style={{ marginBottom: '18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem' }}>
                          <span style={{ color: '#FFFFFF', fontWeight: '600' }}>{name}</span>
                          <span style={{ color: '#8E8E93' }}>{count} click ({percent}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ width: `${percent}%`, height: '100%', background: index === 0 ? '#0A84FF' : '#5E5CE6', borderRadius: '10px' }}></div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '20px', border: '0.5px solid rgba(255, 255, 255, 0.08)', padding: '32px' }}>
                <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', color: '#FFFFFF', fontWeight: '700' }}>Tỷ lệ Hệ điều hành</h3>
                {topDevices.length === 0 ? <p style={{ color: '#8E8E93' }}>Chưa có dữ liệu</p> : 
                  topDevices.map(([name, count], index) => {
                    const percent = Math.round((count / clickLogs.length) * 100);
                    return (
                      <div key={name} style={{ marginBottom: '18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem' }}>
                          <span style={{ color: '#FFFFFF', fontWeight: '600' }}>{name}</span>
                          <span style={{ color: '#8E8E93' }}>{count} click ({percent}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ width: `${percent}%`, height: '100%', background: index === 0 ? '#34C759' : '#32ADE6', borderRadius: '10px' }}></div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>

            {/* BẢNG XẾP HẠNG */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '20px', border: '0.5px solid rgba(255, 255, 255, 0.08)', padding: '32px' }}>
              <h3 style={{ margin: '0 0 24px 0', fontSize: '1.2rem', color: '#FFFFFF', fontWeight: '700' }}>Bảng Xếp Hạng Chiến Dịch</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '0.5px solid rgba(255, 255, 255, 0.08)', color: '#8E8E93', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <th style={{ paddingBottom: '12px', fontWeight: '600' }}>TOP</th>
                    <th style={{ paddingBottom: '12px', fontWeight: '600' }}>Mã Rút Gọn</th>
                    <th style={{ paddingBottom: '12px', fontWeight: '600' }}>Nền Tảng</th>
                    <th style={{ paddingBottom: '12px', fontWeight: '600', textAlign: 'right' }}>Tổng Click</th>
                  </tr>
                </thead>
                <tbody>
                  {topLinks.map((link, idx) => (
                    <tr key={link.slug} style={{ borderBottom: '0.5px solid rgba(255, 255, 255, 0.04)' }}>
                      <td style={{ padding: '16px 0', color: idx === 0 ? '#FFD60A' : idx === 1 ? '#8E8E93' : idx === 2 ? '#FF9F0A' : '#636366', fontWeight: 'bold' }}>
                        #{idx + 1}
                      </td>
                      <td style={{ padding: '16px 0', color: '#FFFFFF', fontWeight: '600' }}>/{link.slug}</td>
                      <td style={{ padding: '16px 0', color: '#8E8E93', fontSize: '0.9rem' }}>{link.network}</td>
                      <td style={{ padding: '16px 0',
