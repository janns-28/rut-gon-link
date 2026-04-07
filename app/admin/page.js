'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

// Tối ưu hóa nhận diện các network phổ biến
const getNetworkInfo = (url) => {
  const lowerUrl = url?.toLowerCase() || '';
  if (lowerUrl.includes('dinos.click')) return { name: 'Dinos', bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' };
  if (lowerUrl.includes('hl-link')) return { name: 'Hyperlead', bg: '#e0e7ff', text: '#4f46e5', border: '#a5b4fc' };
  if (lowerUrl.includes('accesstrade')) return { name: 'Accesstrade', bg: '#fef3c7', text: '#d97706', border: '#fcd34d' };
  if (lowerUrl.includes('masoffer')) return { name: 'MasOffer', bg: '#dcfce7', text: '#16a34a', border: '#86efac' };
  if (lowerUrl.includes('facebook.com')) return { name: 'Social', bg: '#dbeafe', text: '#2563eb', border: '#93c5fd' };
  return { name: 'Direct (Khác)', bg: '#f3f4f6', text: '#94a3b8', border: '#4b5563' };
};

export default function PremiumAdmin() {
  const [links, setLinks] = useState([]);
  const [clickLogs, setClickLogs] = useState([]);
  const [totalClicks, setTotalClicks] = useState(0); 

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [activeTab, setActiveTab] = useState('links');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
    const cleanupRealtime = setupRealtime();
    return () => { if (cleanupRealtime) cleanupRealtime(); };
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const { count } = await supabase.from('click_logs').select('*', { count: 'exact', head: true });
      if (count !== null) setTotalClicks(count);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [linksRes, logsRes] = await Promise.all([
        supabase.from('links').select('*').order('created_at', { ascending: false }),
        supabase.from('click_logs').select('*').gte('created_at', thirtyDaysAgo.toISOString()).order('created_at', { ascending: false })
      ]);
      
      if (linksRes.data) setLinks(linksRes.data);
      if (logsRes.data) setClickLogs(logsRes.data);
    } catch (error) {
      showToast('❌ Lỗi tải dữ liệu!', true);
    } finally {
      setLoading(false);
    }
  }

  function setupRealtime() {
    const channel = supabase.channel('custom-all-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'click_logs' }, (payload) => {
        setClickLogs(prev => [payload.new, ...prev]);
        setTotalClicks(prev => prev + 1);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }

  const showToast = (msg, isError = false) => {
    setToast({ text: msg, isError });
    setTimeout(() => setToast(''), 3000);
  };

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!newUrl) return showToast('❌ Quên nhập link gốc rồi kìa!', true);

    setIsSubmitting(true);
    const finalSlug = customSlug.trim() || Math.random().toString(36).substring(2, 8);

    try {
      const { data, error } = await supabase.from('links').insert([{ slug: finalSlug, original_url: newUrl }]).select();
      if (error) throw error;
      setLinks([data[0], ...links]);
      showToast(`✅ Lên camp thành công: /${finalSlug}`);
      setIsModalOpen(false);
      setNewUrl('');
      setCustomSlug('');
    } catch (error) {
      showToast('❌ Lỗi: Slug này có thể đã tồn tại!', true);
    } finally {
      setIsSubmitting(false);
    }
  };

const getLastClickInfo = (slug) => {
    const logs = clickLogs.filter(log => log.slug === slug);
    if (logs.length === 0) return { text: 'Chưa có click', color: '#64748b', isDead: false };
    
    logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const lastLogTime = new Date(logs[0].created_at);
    const now = new Date();
    const diffHours = (now - lastLogTime) / (1000 * 60 * 60);
    const totalClicks = logs.length;

    if (diffHours < 1) {
      // Đếm số lượng click đớp được trong vòng 1 tiếng
      const recentClicks = logs.filter(log => (now - new Date(log.created_at)) / (1000 * 60 * 60) < 1).length;
      return { text: `Vừa cắn ${recentClicks} số 🔥 (Tổng: ${totalClicks})`, color: '#10b981', isDead: false };
    }
    
    if (diffHours < 3) return { text: `Tầm ${Math.floor(diffHours)}h trước (Tổng: ${totalClicks})`, color: '#fbbf24', isDead: false };
    return { text: `Đứng im >${Math.floor(diffHours)}h ⚠️ (Tổng: ${totalClicks})`, color: '#ef4444', isDead: true };
  };

  const handleDelete = async (slug) => {
    const confirm = window.confirm(`Cảnh báo: Xóa vĩnh viễn phễu /${slug}? (Click logs vẫn sẽ được giữ lại để check đối soát)`);
    if (!confirm) return;
    
    const previousLinks = [...links];
    setLinks(links.filter(l => l.slug !== slug));
    
    try {
      const res = await fetch('/api/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) });
      if (!res.ok) throw new Error('Lỗi Server');
      showToast(`🗑️ Đã dọn dẹp /${slug} thành thành công!`);
    } catch (error) {
      setLinks(previousLinks);
      showToast(`❌ Lỗi không xóa được! Vui lòng thử lại.`, true);
    }
  };

  const handleCopy = (slug) => {
    const fullUrl = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    showToast(`📋 Đã copy: /${slug}`);
  };

  const toggleGroup = (netName) => {
    setExpandedGroups(prev => ({ ...prev, [netName]: !prev[netName] }));
  };

  const groupedLinks = useMemo(() => {
    const filtered = links.filter(l => 
      l.slug.toLowerCase().includes(search.toLowerCase()) || 
      l.original_url.toLowerCase().includes(search.toLowerCase())
    );
    return filtered.reduce((acc, link) => {
      const netInfo = getNetworkInfo(link.original_url);
      const netName = netInfo.name;
      if (!acc[netName]) acc[netName] = { info: netInfo, items: [] };
      acc[netName].items.push(link);
      return acc;
    }, {});
  }, [links, search]);

  const { topLinks, topReferrers, topDevices } = useMemo(() => {
    const counts = {}; const refs = {}; const devs = {};

    clickLogs.forEach(log => {
      counts[log.slug] = (counts[log.slug] || 0) + 1;

      let ref = log.referrer || 'Direct (Truy cập thẳng)';
      const lowerRef = ref.toLowerCase();
      if (lowerRef.includes('facebook.com')) ref = 'Facebook';
      else if (lowerRef.includes('tiktok.com')) ref = 'TikTok';
      else if (lowerRef.includes('threads.net')) ref = 'Threads';
      else if (lowerRef.includes('zalo')) ref = 'Zalo';
      else if (lowerRef.includes('instagram.com')) ref = 'Instagram';
      else if (lowerRef.includes('youtube.com')) ref = 'YouTube';
      else if (lowerRef.startsWith('http')) { try { ref = new URL(ref).hostname; } catch(e){} }
      refs[ref] = (refs[ref] || 0) + 1;

      const ua = (log.user_agent || '').toLowerCase();
      let device = 'Khác';
      if (ua.includes('iphone') || ua.includes('ipad')) device = 'iOS (Apple)';
      else if (ua.includes('android')) device = 'Android';
      else if (ua.includes('windows')) device = 'Windows PC';
      else if (ua.includes('mac os') || ua.includes('macintosh')) device = 'MacBook';
      devs[device] = (devs[device] || 0) + 1;
    });

    return {
      topLinks: Object.entries(counts).map(([slug, count]) => {
          const linkData = links.find(l => l.slug === slug);
          return { slug, count, originalUrl: linkData?.original_url || 'N/A', network: linkData ? getNetworkInfo(linkData.original_url).name : 'Unknown' };
        }).sort((a, b) => b.count - a.count),
      topReferrers: Object.entries(refs).sort((a, b) => b[1] - a[1]),
      topDevices: Object.entries(devs).sort((a, b) => b[1] - a[1])
    };
  }, [clickLogs, links]);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#0f1115', color: '#e2e8f0', fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }}>
      
      {toast && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: toast.isError ? '#ef4444' : '#10b981', color: '#fff', padding: '12px 24px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', zIndex: 60, fontWeight: '500', animation: 'slideIn 0.3s ease-out' }}>
          {toast.text}
        </div>
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#111318', padding: '32px', borderRadius: '16px', border: '1px solid #1f2937', width: '100%', maxWidth: '450px', animation: 'fadeIn 0.2s ease-out' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.4rem', color: '#f8fafc' }}>Tạo Phễu Mồi Mới 🚀</h2>
            <form onSubmit={handleAddLink} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>Link Đích (Affiliate Link)</label>
                <input 
                  type="url" required placeholder="https://dinos.click/..." value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #374151', background: '#1e293b', color: '#f8fafc', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>Đuôi Link (Slug) - Để trống sẽ Random</label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#1e293b', border: '1px solid #374151', borderRadius: '8px', padding: '0 12px' }}>
                  <span style={{ color: '#64748b' }}>/</span>
                  <input 
                    type="text" placeholder="vay-tien-nhanh" value={customSlug} onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                    style={{ width: '100%', padding: '12px 8px', border: 'none', background: 'transparent', color: '#f8fafc', outline: 'none' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #374151', color: '#cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Hủy</button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '12px', background: isSubmitting ? '#3b82f680' : '#3b82f6', border: 'none', color: '#fff', borderRadius: '8px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: '600', transition: 'background 0.2s' }}>
                  {isSubmitting ? 'Đang tạo...' : 'Tạo Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <aside style={{ width: '260px', borderRight: '1px solid #1f2937', backgroundColor: '#111318', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>B</div>
          <span style={{ fontSize: '1.2rem', fontWeight: '700', letterSpacing: '0.5px', color: '#f8fafc' }}>BINHTIENTI</span>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <button onClick={() => setActiveTab('links')} style={{ width: '100%', border: 'none', cursor: 'pointer', padding: '12px 16px', borderRadius: '8px', background: activeTab === 'links' ? '#1f2937' : 'transparent', color: activeTab === 'links' ? '#f8fafc' : '#94a3b8', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg> Quản lý Links
          </button>
          <button onClick={() => setActiveTab('stats')} style={{ width: '100%', border: 'none', cursor: 'pointer', padding: '12px 16px', borderRadius: '8px', background: activeTab === 'stats' ? '#1f2937' : 'transparent', color: activeTab === 'stats' ? '#f8fafc' : '#94a3b8', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg> Thống kê Traffic
          </button>
        </nav>
      </aside>

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
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ background: '#1f2937', padding: '8px 20px', borderRadius: '12px', border: '1px solid #374151', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff' }}>{links.length}</span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Tổng Link</span>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)', transition: 'transform 0.1s' }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg> Tạo Link Mới
                </button>
              </div>
            </header>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                <svg style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input 
                  type="text" placeholder="Tìm kiếm mã hoặc link gốc..." value={search} onChange={(e) => setSearch(e.target.value)} 
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
                    <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Không tìm thấy chiến dịch nào. Hãy tạo phễu mới.</td></tr>
                  ) : (
                    Object.entries(groupedLinks).map(([netName, group]) => {
                      const isExpanded = search !== '' || expandedGroups[netName] === true;
                      
                      return (
                        <React.Fragment key={netName}>
                          <tr onClick={() => toggleGroup(netName)} style={{ background: '#1e293b', borderBottom: '1px solid #334155', cursor: 'pointer', transition: 'background 0.2s', userSelect: 'none' }}>
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
                              <tr key={l.id} style={{ borderBottom: '1px solid #1f2937', transition: 'background 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#181b23'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                <td style={{ padding: '16px 24px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: '#64748b' }}>/</span><strong style={{ color: '#f8fafc', letterSpacing: '0.5px' }}>{l.slug}</strong>
                                  </div>
                                </td>
                                <td style={{ padding: '16px 24px', maxWidth: '350px' }}>
                                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '4px' }} title={l.original_url}>{l.original_url}</div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: '500', color: lastClick.color }}>
                                    {lastClick.isDead ? <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 2s infinite' }}></span> : null}
                                    {lastClick.text}
                                  </div>
                                </td>
                                <td style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '0.9rem' }}>
                                  {new Date(l.created_at).toLocaleDateString('vi-VN')}
                                </td>
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
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <header style={{ marginBottom: '40px' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 8px 0' }}>Báo Cáo Hiệu Suất</h1>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>Theo dõi traffic đẩy từ các nền tảng vào phễu.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: '#111318', padding: '24px', borderRadius: '16px', border: '1px solid #1f2937', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' }}>Tổng số Click (All-time)</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#10b981' }}>{totalClicks.toLocaleString()}</div>
              </div>
              <div style={{ background: '#111318', padding: '24px', borderRadius: '16px', border: '1px solid #1f2937', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: '600' }}>Link Đang Cắn Khỏe Nhất</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#60a5fa', marginBottom: '4px' }}>/{topLinks[0]?.slug || 'Chưa có'}</div>
                <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>{topLinks[0]?.count || 0} lượt bấm</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: '#111318', borderRadius: '16px', border: '1px solid #1f2937', padding: '24px' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#f8fafc' }}>🌐 Nguồn Traffic Đổ Về</h3>
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
                <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#f8fafc' }}>📱 Tỷ lệ Thiết bị</h3>
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
              <h3 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', color: '#f8fafc' }}>🔥 Bảng Xếp Hạng Camp</h3>
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
                      <td style={{ padding: '16px 0', color: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : '#64748b', fontWeight: 'bold' }}>#{idx + 1}</td>
                      <td style={{ padding: '16px 0', color: '#f8fafc', fontWeight: '500' }}>/{link.slug}</td>
                      <td style={{ padding: '16px 0', color: '#94a3b8', fontSize: '0.9rem' }}>{link.network}</td>
                      <td style={{ padding: '16px 0', color: '#10b981', fontWeight: '700', textAlign: 'right' }}>{link.count}</td>
                    </tr>
                  ))}
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
