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
  const [activeTab, setActiveTab] = useState('links'); // 'links' hoặc 'stats'

  useEffect(() => {
    async function fetchData() {
      // Tải song song cả Links và Click Logs
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

  // --- XỬ LÝ DỮ LIỆU TAB LINKS ---
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

  // --- XỬ LÝ DỮ LIỆU TAB THỐNG KÊ ---
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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f1115', color: '#e2e8f0', fontFamily: '"Inter", system-ui, sans-serif' }}>
      
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

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: '40px 50px', overflowY: 'auto' }}>
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
                <input type="text" placeholder="Tìm kiếm mã hoặc link gốc..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: '10px', border: '1px solid #374151', background: '#111318', color: '#f8fafc', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ background: '#111318', borderRadius: '16px', border: '1px solid #1f2937', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
                <thead>
                  <tr style={{ background: '#181b23', borderBottom: '1px solid #1f2937' }}>
                    <th style={{ padding: '16px 24px', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mã Rút Gọn</th>
                    <th style={{ padding: '16px 24px', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Link Gốc</th>
                    <th style={{ padding: '16px 24px', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ngày Lên Camp</th>
                    <th style={{ padding: '16px 24px', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedLinks).map(([netName, group]) => {
                    const isExpanded = search !== '' || expandedGroups[netName];
                    return (
                      <React.Fragment key={netName}>
                        <tr onClick={() => toggleGroup(netName)} style={{ background: '#1e293b', cursor: 'pointer' }}>
                          <td colSpan="4" style={{ padding: '12px 24px', fontWeight: '700', color: group.info.text }}>
                            {netName.toUpperCase()} ({group.items.length} link)
                          </td>
                        </tr>
                        {isExpanded && group.items.map((l) => (
                          <tr key={l.id} style={{ borderBottom: '1px solid #1f2937' }}>
                            <td style={{ padding: '16px 24px' }}>/{l.slug}</td>
                            <td style={{ padding: '16px 24px', maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.original_url}</td>
                            <td style={{ padding: '16px 24px' }}>{new Date(l.created_at).toLocaleDateString('vi-VN')}</td>
                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                              <button onClick={() => handleCopy(l.slug)}>Copy</button>
                              <button onClick={() => handleDelete(l.slug)} style={{ color: '#fca5a5', marginLeft: '10px' }}>Xóa</button>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* THỐNG KÊ TRAFFIC */
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#f8fafc', marginBottom: '40px' }}>Báo Cáo Hiệu Suất</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: '#111318', padding: '24px', borderRadius: '16px', border: '1px solid #1f2937' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Tổng số Click</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#10b981' }}>{clickLogs.length}</div>
              </div>
            </div>
            {/* Các thành phần phân tích traffic khác tương tự file page.js */}
          </div>
        )}
      </main>
    </div>
  );
}
