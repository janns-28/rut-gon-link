'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

// Tối ưu hóa nhận diện các network phổ biến - GIỮ Y NGUYÊN MÃ MÀU GỐC CỦA MÀI
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

  // State cho Modal tạo link
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
    const diffHours = (new Date() - lastLogTime) / (1000 * 60 * 60);

    if (diffHours < 1) return { text: 'Vừa cắn số 🔥', color: '#10b981', isDead: false };
    if (diffHours < 3) return { text: `Tầm ${Math.floor(diffHours)}h trước`, color: '#fbbf24', isDead: false };
    return { text: `Đứng im >${Math.floor(diffHours)}h ⚠️`, color: '#ef4444', isDead: true };
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
    const filtered = links.filter(l => l.slug.toLowerCase().includes(search.toLowerCase()) || l.original_url.toLowerCase().includes(search.toLowerCase()));
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
    <div className="flex h-screen overflow-hidden bg-[#0f1115] text-[#e2e8f0] font-sans">
      
      {toast && (
        <div className={`fixed bottom-5 right-5 px-6 py-3 rounded-lg shadow-xl z-50 font-medium text-white transition-all duration-300 ${toast.isError ? 'bg-[#ef4444]' : 'bg-[#10b981]'}`}>
          {toast.text}
        </div>
      )}

      {/* MODAL TẠO LINK MỚI */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-[4px]">
          <div className="bg-[#111318] p-8 rounded-2xl border border-[#1f2937] w-full max-w-[450px]">
            <h2 className="m-0 mb-5 text-[1.4rem] text-[#f8fafc]">Tạo Phễu Mồi Mới 🚀</h2>
            <form onSubmit={handleAddLink} className="flex flex-col gap-4">
              <div>
                <label className="block mb-2 text-[#94a3b8] text-[0.9rem]">Link Đích (Affiliate Link)</label>
                <input 
                  type="url" required placeholder="https://dinos.click/..." value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full p-3 rounded-lg border border-[#374151] bg-[#1e293b] text-[#f8fafc] box-border outline-none"
                />
              </div>
              <div>
                <label className="block mb-2 text-[#94a3b8] text-[0.9rem]">Đuôi Link (Slug) - Để trống sẽ Random</label>
                <div className="flex items-center bg-[#1e293b] border border-[#374151] rounded-lg px-3">
                  <span className="text-[#64748b]">/</span>
                  <input 
                    type="text" placeholder="vay-tien-nhanh" value={customSlug} onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                    className="w-full p-3 py-3 px-2 border-none bg-transparent text-[#f8fafc] outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-2.5">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-3 bg-transparent border border-[#374151] text-[#cbd5e1] rounded-lg cursor-pointer font-semibold">Hủy</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 p-3 border-none text-white rounded-lg cursor-pointer font-semibold transition-colors duration-200" style={{ background: isSubmitting ? '#3b82f680' : '#3b82f6' }}>
                  {isSubmitting ? 'Đang tạo...' : 'Tạo Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-[260px] border-r border-[#1f2937] bg-[#111318] p-6 flex flex-col">
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6]">B</div>
          <span className="text-[1.2rem] font-bold tracking-[0.5px] text-[#f8fafc]">BINHTIENTI</span>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          <button onClick={() => setActiveTab('links')} className={`w-full border-none cursor-pointer p-3 px-4 rounded-lg font-medium flex items-center gap-3 transition-all duration-200 ${activeTab === 'links' ? 'bg-[#1f2937] text-[#f8fafc]' : 'bg-transparent text-[#94a3b8]'}`}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            Quản lý Links
          </button>
          <button onClick={() => setActiveTab('stats')} className={`w-full border-none cursor-pointer p-3 px-4 rounded-lg font-medium flex items-center gap-3 transition-all duration-200 ${activeTab === 'stats' ? 'bg-[#1f2937] text-[#f8fafc]' : 'bg-transparent text-[#94a3b8]'}`}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            Thống kê Traffic
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 h-screen overflow-y-auto px-[50px] py-[40px] box-border">
        
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-[#64748b] text-[1.2rem]">Đang đồng bộ dữ liệu hệ thống... ⏳</div>
          </div>
        ) : activeTab === 'links' ? (
          <div>
            <header className="flex justify-between items-center mb-10">
              <div>
                <h1 className="text-[1.8rem] font-bold text-[#f8fafc] m-0 mb-2">Chiến dịch Affiliate</h1>
                <p className="text-[#94a3b8] m-0 text-[0.95rem]">Theo dõi và quản lý các liên kết chuyển hướng của bạn.</p>
              </div>
              <div className="flex gap-5 items-center">
                <div className="bg-[#1f2937] px-5 py-2 rounded-xl border border-[#374151] flex flex-col items-center">
                  <span className="text-[1.3rem] font-extrabold text-white">{links.length}</span>
                  <span className="text-[0.7rem] text-[#94a3b8] uppercase tracking-[1px]">Tổng Link</span>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[#3b82f6] text-white border-none py-[14px] px-6 rounded-xl font-semibold flex items-center gap-2 cursor-pointer shadow-[0_4px_6px_-1px_rgba(59,130,246,0.3)] transition-transform duration-100 active:scale-95"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
                  Tạo Link Mới
                </button>
              </div>
            </header>

            <div className="flex gap-4 mb-6">
              <div className="relative flex-1 max-w-[400px]">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b]" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input 
                  type="text" placeholder="Tìm kiếm mã hoặc link gốc..." value={search} onChange={(e) => setSearch(e.target.value)} 
                  className="w-full py-3 pr-4 pl-11 rounded-lg border border-[#374151] bg-[#111318] text-[#f8fafc] text-[0.95rem] outline-none transition-all duration-200 box-border" 
                />
              </div>
            </div>

            <div className="bg-[#111318] rounded-2xl border border-[#1f2937] overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]">
              <table className="w-full border-collapse text-left whitespace-nowrap">
                <thead>
                  <tr className="bg-[#181b23] border-b border-[#1f2937]">
                    <th className="p-4 px-6 text-[#94a3b8] font-semibold text-[0.85rem] uppercase tracking-[0.5px]">Mã Rút Gọn</th>
                    <th className="p-4 px-6 text-[#94a3b8] font-semibold text-[0.85rem] uppercase tracking-[0.5px]">Link Gốc & Tín Hiệu</th>
                    <th className="p-4 px-6 text-[#94a3b8] font-semibold text-[0.85rem] uppercase tracking-[0.5px]">Ngày Lên Camp</th>
                    <th className="p-4 px-6 text-[#94a3b8] font-semibold text-[0.85rem] uppercase tracking-[0.5px] text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(groupedLinks).length === 0 ? (
                    <tr><td colSpan="4" className="p-10 text-center text-[#64748b]">Không tìm thấy chiến dịch nào. Hãy tạo phễu mới.</td></tr>
                  ) : (
                    Object.entries(groupedLinks).map(([netName, group]) => {
                      const isExpanded = search !== '' || expandedGroups[netName] !== false;
                      return (
                        <React.Fragment key={netName}>
                          <tr onClick={() => toggleGroup(netName)} className="bg-[#1e293b] border-b border-[#334155] cursor-pointer transition-colors duration-200 select-none">
                            <td colSpan="4" className="p-3 px-6 font-bold" style={{ color: group.info.text }}>
                              <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-2">
                                  <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: group.info.text }}></span>
                                  Nền tảng: {netName.toUpperCase()} <span className="text-[#94a3b8] text-[0.85rem] font-medium ml-1.5">({group.items.length} link)</span>
                                </span>
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={`text-[#94a3b8] transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                              </div>
                            </td>
                          </tr>
                          
                          {isExpanded && group.items.map((l) => {
                            const lastClick = getLastClickInfo(l.slug);
                            return (
                              <tr key={l.id} className="border-b border-[#1f2937] transition-colors duration-150 hover:bg-[#181b23]">
                                <td className="p-4 px-6">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[#64748b]">/</span>
                                    <strong className="text-[#f8fafc] tracking-[0.5px]">{l.slug}</strong>
                                  </div>
                                </td>
                                <td className="p-4 px-6 max-w-[350px]">
                                  <div className="overflow-hidden text-ellipsis text-[#cbd5e1] text-[0.9rem] mb-1" title={l.original_url}>{l.original_url}</div>
                                  <div className="flex items-center gap-1.5 text-[0.8rem] font-medium" style={{ color: lastClick.color }}>
                                    {lastClick.isDead ? <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse"></span> : null}
                                    {lastClick.text}
                                  </div>
                                </td>
                                <td className="p-4 px-6 text-[#94a3b8] text-[0.9rem]">
                                  {new Date(l.created_at).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="p-4 px-6 text-right">
                                  {/* CÁC NÚT ĐƯỢC GIỮ NGUYÊN Y CHANG BẢN GỐC CỦA MÀI, KHÔNG BỊ TÀNG HÌNH HAY GIẤU ĐI */}
                                  <div className="flex gap-2 justify-end">
                                    <button onClick={() => handleCopy(l.slug)} title="Copy" className="bg-[#374151] text-[#d1d5db] border-none p-2 rounded-lg cursor-pointer"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
                                    <a href={l.original_url} target="_blank" rel="noopener noreferrer" title="Mở Link" className="bg-[#374151] text-[#d1d5db] border-none p-2 rounded-lg flex"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>
                                    <button onClick={() => handleDelete(l.slug)} title="Xóa" className="bg-[#374151] text-[#fca5a5] border-none p-2 rounded-lg cursor-pointer"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
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
          /* TAB THỐNG KÊ TRAFFIC CỦA MÀI CHUẨN GỐC */
          <div>
            <header className="mb-10">
              <h1 className="text-[1.8rem] font-bold text-[#f8fafc] m-0 mb-2">Báo Cáo Hiệu Suất</h1>
              <p className="text-[#94a3b8] m-0 text-[0.95rem]">Theo dõi traffic đẩy từ các nền tảng vào phễu.</p>
            </header>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5 mb-[30px]">
              <div className="bg-[#111318] p-6 rounded-2xl border border-[#1f2937] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="text-[#94a3b8] text-[0.85rem] uppercase tracking-[1px] mb-2 font-semibold">Tổng số Click (All-time)</div>
                <div className="text-[2.5rem] font-extrabold text-[#10b981]">{totalClicks}</div>
              </div>
              <div className="bg-[#111318] p-6 rounded-2xl border border-[#1f2937] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]">
                <div className="text-[#94a3b8] text-[0.85rem] uppercase tracking-[1px] mb-2 font-semibold">Link Đang Cắn Khỏe Nhất</div>
                <div className="text-[1.5rem] font-bold text-[#60a5fa] mb-1">/{topLinks[0]?.slug || 'Chưa có'}</div>
                <div className="text-[#cbd5e1] text-[0.9rem]">{topLinks[0]?.count || 0} lượt bấm</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5 mb-[30px]">
              <div className="bg-[#111318] rounded-2xl border border-[#1f2937] p-6">
                <h3 className="m-0 mb-5 text-[1.1rem] text-[#f8fafc]">🌐 Nguồn Traffic Đổ Về</h3>
                {topReferrers.length === 0 ? <p className="text-[#64748b]">Chưa có dữ liệu</p> : 
                  topReferrers.map(([name, count], index) => {
                    const percent = Math.round((count / clickLogs.length) * 100);
                    return (
                      <div key={name} className="mb-4">
                        <div className="flex justify-between mb-[6px] text-[0.9rem]">
                          <span className="text-[#cbd5e1] font-medium">{name}</span>
                          <span className="text-[#94a3b8]">{count} click ({percent}%)</span>
                        </div>
                        <div className="w-full h-2 bg-[#1e293b] rounded-md overflow-hidden">
                          <div className="h-full rounded-md transition-[width] duration-1000 ease-out" style={{ width: `${percent}%`, backgroundColor: index === 0 ? '#3b82f6' : '#6366f1' }}></div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>

              <div className="bg-[#111318] rounded-2xl border border-[#1f2937] p-6">
                <h3 className="m-0 mb-5 text-[1.1rem] text-[#f8fafc]">📱 Tỷ lệ Thiết bị</h3>
                {topDevices.length === 0 ? <p className="text-[#64748b]">Chưa có dữ liệu</p> : 
                  topDevices.map(([name, count], index) => {
                    const percent = Math.round((count / clickLogs.length) * 100);
                    return (
                      <div key={name} className="mb-4">
                        <div className="flex justify-between mb-[6px] text-[0.9rem]">
                          <span className="text-[#cbd5e1] font-medium">{name}</span>
                          <span className="text-[#94a3b8]">{count} click ({percent}%)</span>
                        </div>
                        <div className="w-full h-2 bg-[#1e293b] rounded-md overflow-hidden">
                          <div className="h-full rounded-md transition-[width] duration-1000 ease-out" style={{ width: `${percent}%`, backgroundColor: index === 0 ? '#10b981' : '#34d399' }}></div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>

            <div className="bg-[#111318] rounded-2xl border border-[#1f2937] p-6">
              <h3 className="m-0 mb-5 text-[1.1rem] text-[#f8fafc]">🔥 Bảng Xếp Hạng Camp</h3>
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#1f2937] text-[#94a3b8] text-[0.85rem]">
                    <th className="pb-3 font-semibold">TOP</th>
                    <th className="pb-3 font-semibold">Mã Rút Gọn</th>
                    <th className="pb-3 font-semibold">Nền Tảng</th>
                    <th className="pb-3 font-semibold text-right">Tổng Click</th>
                  </tr>
                </thead>
                <tbody>
                  {topLinks.map((link, idx) => (
                    <tr key={link.slug} className="border-b border-[#1e293b]">
                      <td className="py-4 font-bold" style={{ color: idx === 0 ? '#fbbf24' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : '#64748b' }}>#{idx + 1}</td>
                      <td className="py-4 text-[#f8fafc] font-medium">/{link.slug}</td>
                      <td className="py-4 text-[#94a3b8] text-[0.9rem]">{link.network}</td>
                      <td className="py-4 text-[#10b981] font-bold text-right">{link.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
