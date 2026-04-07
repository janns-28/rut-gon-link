'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

// ==========================================
// 1. UTILS & HELPERS
// ==========================================
const getNetworkInfo = (url) => {
  const lowerUrl = url?.toLowerCase() || '';
  if (lowerUrl.includes('dinos.click')) return { name: 'Dinos', colorClass: 'text-red-500 bg-red-500' };
  if (lowerUrl.includes('hl-link')) return { name: 'Hyperlead', colorClass: 'text-indigo-500 bg-indigo-500' };
  if (lowerUrl.includes('accesstrade')) return { name: 'Accesstrade', colorClass: 'text-amber-500 bg-amber-500' };
  if (lowerUrl.includes('masoffer')) return { name: 'MasOffer', colorClass: 'text-green-500 bg-green-500' };
  if (lowerUrl.includes('facebook.com')) return { name: 'Social', colorClass: 'text-blue-500 bg-blue-500' };
  return { name: 'Direct (Khác)', colorClass: 'text-slate-400 bg-slate-400' };
};

// ==========================================
// 2. SUB-COMPONENTS
// ==========================================
const Toast = ({ message, isError }) => (
  <div className={`fixed bottom-5 right-5 px-6 py-3 rounded-lg shadow-lg z-50 font-medium animate-[slideIn_0.3s_ease-out] text-white ${isError ? 'bg-red-500' : 'bg-emerald-500'}`}>
    {message}
  </div>
);

const CreateLinkModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [newUrl, setNewUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[#111318] p-8 rounded-2xl border border-gray-800 w-full max-w-md animate-[fadeIn_0.2s_ease-out]">
        <h2 className="text-2xl font-bold text-slate-50 mb-6">Tạo Phễu Mồi Mới 🚀</h2>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(newUrl, customSlug); setNewUrl(''); setCustomSlug(''); }} className="flex flex-col gap-4">
          <div>
            <label className="block mb-2 text-sm text-slate-400">Link Đích (Affiliate Link)</label>
            <input 
              type="url" required placeholder="https://dinos.click/..." 
              value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-700 bg-slate-800 text-slate-50 outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm text-slate-400">Đuôi Link (Slug) - Để trống sẽ Random</label>
            <div className="flex items-center bg-slate-800 border border-gray-700 rounded-lg px-3 focus-within:border-blue-500 transition-colors">
              <span className="text-slate-500">/</span>
              <input 
                type="text" placeholder="vay-tien-nhanh" 
                value={customSlug} onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                className="w-full p-3 border-none bg-transparent text-slate-50 outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 border border-gray-700 text-slate-300 rounded-lg font-semibold hover:bg-gray-800 transition">Hủy</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 transition">
              {isSubmitting ? 'Đang tạo...' : 'Tạo Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Sidebar = ({ activeTab, setActiveTab }) => (
  <aside className="w-[260px] border-r border-gray-800 bg-[#111318] p-6 flex flex-col">
    <div className="flex items-center gap-3 mb-10">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center font-bold text-white">B</div>
      <span className="text-xl font-bold tracking-wide text-slate-50">BINHTIENTI</span>
    </div>
    <nav className="flex flex-col gap-2 flex-1">
      <button onClick={() => setActiveTab('links')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'links' ? 'bg-gray-800 text-slate-50' : 'text-slate-400 hover:text-slate-200 hover:bg-gray-800/50'}`}>
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
        Quản lý Links
      </button>
      <button onClick={() => setActiveTab('stats')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === 'stats' ? 'bg-gray-800 text-slate-50' : 'text-slate-400 hover:text-slate-200 hover:bg-gray-800/50'}`}>
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
        Thống kê Traffic
      </button>
    </nav>
  </aside>
);

// ==========================================
// 3. MAIN COMPONENT (GOD COMPONENT SPLIT)
// ==========================================
export default function PremiumAdmin() {
  const [links, setLinks] = useState([]);
  const [clickLogs, setClickLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [activeTab, setActiveTab] = useState('links');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    // Tạm thời giữ lại cách fetch cũ, nhưng về lâu dài hãy gọi supabase.rpc('get_traffic_stats')
    const [linksRes, logsRes] = await Promise.all([
      supabase.from('links').select('*').order('created_at', { ascending: false }),
      supabase.from('click_logs').select('*') 
    ]);
    if (linksRes.data) setLinks(linksRes.data);
    if (logsRes.data) setClickLogs(logsRes.data);
    setLoading(false);
  }

  const showToast = (msg, isError = false) => {
    setToast({ message: msg, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddLink = async (newUrl, customSlug) => {
    if (!newUrl) return showToast('❌ Quên nhập link gốc rồi kìa!', true);
    setIsSubmitting(true);
    const finalSlug = customSlug.trim() || Math.random().toString(36).substring(2, 8);

    try {
      const { data, error } = await supabase.from('links').insert([{ slug: finalSlug, original_url: newUrl }]).select();
      if (error) throw error;
      setLinks([data[0], ...links]);
      showToast(`✅ Lên camp thành công: /${finalSlug}`);
      setIsModalOpen(false);
    } catch (error) {
      showToast('❌ Lỗi: Slug này có thể đã tồn tại!', true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm(`Xóa vĩnh viễn phễu /${slug}? (Click logs vẫn giữ lại đối soát)`)) return;
    const previousLinks = [...links];
    setLinks(links.filter(l => l.slug !== slug));
    
    try {
      const res = await fetch('/api/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) });
      if (!res.ok) throw new Error();
      showToast(`🗑️ Đã dọn dẹp /${slug} thành công!`);
    } catch (error) {
      setLinks(previousLinks);
      showToast(`❌ Lỗi không xóa được!`, true);
    }
  };

  // ==========================================
  // 4. MEMOIZED DATA CALCULATIONS (TỐI ƯU HIỆU NĂNG)
  // ==========================================
  const groupedLinks = useMemo(() => {
    const filtered = links.filter(l => l.slug.toLowerCase().includes(search.toLowerCase()) || l.original_url.toLowerCase().includes(search.toLowerCase()));
    return filtered.reduce((acc, link) => {
      const netInfo = getNetworkInfo(link.original_url);
      if (!acc[netInfo.name]) acc[netInfo.name] = { info: netInfo, items: [] };
      acc[netInfo.name].items.push(link);
      return acc;
    }, {});
  }, [links, search]);

  const { topLinks, topReferrers, topDevices } = useMemo(() => {
    const counts = {};
    const refs = {};
    const devs = {};

    clickLogs.forEach(log => {
      // Đếm link
      counts[log.slug] = (counts[log.slug] || 0) + 1;
      
      // Đếm Referrer
      let ref = log.referrer || 'Direct (Truy cập thẳng)';
      const lowerRef = ref.toLowerCase();
      if (lowerRef.includes('facebook')) ref = 'Facebook';
      else if (lowerRef.includes('tiktok')) ref = 'TikTok';
      else if (lowerRef.includes('zalo')) ref = 'Zalo';
      else if (lowerRef.startsWith('http')) { try { ref = new URL(ref).hostname; } catch(e){} }
      refs[ref] = (refs[ref] || 0) + 1;

      // Đếm thiết bị
      const ua = (log.user_agent || '').toLowerCase();
      let device = 'Khác';
      if (ua.includes('iphone') || ua.includes('ipad')) device = 'iOS (Apple)';
      else if (ua.includes('android')) device = 'Android';
      else if (ua.includes('windows')) device = 'Windows PC';
      else if (ua.includes('mac')) device = 'MacBook';
      devs[device] = (devs[device] || 0) + 1;
    });

    const formattedTopLinks = Object.entries(counts)
      .map(([slug, count]) => ({ slug, count, network: getNetworkInfo(links.find(l => l.slug === slug)?.original_url).name }))
      .sort((a, b) => b.count - a.count);

    return {
      topLinks: formattedTopLinks,
      topReferrers: Object.entries(refs).sort((a, b) => b[1] - a[1]),
      topDevices: Object.entries(devs).sort((a, b) => b[1] - a[1])
    };
  }, [clickLogs, links]);

  // ==========================================
  // RENDER UI
  // ==========================================
  return (
    <div className="flex h-screen overflow-hidden bg-[#0f1115] text-slate-200 font-sans">
      {toast && <Toast message={toast.message} isError={toast.isError} />}
      
      <CreateLinkModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleAddLink} 
        isSubmitting={isSubmitting} 
      />

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 h-screen overflow-y-auto p-10 box-border">
        {loading ? (
          <div className="flex justify-center items-center h-full text-slate-500 text-xl">Đang đồng bộ dữ liệu... ⏳</div>
        ) : activeTab === 'links' ? (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            <header className="flex justify-between items-center mb-10">
              <div>
                <h1 className="text-3xl font-bold text-slate-50 mb-2">Chiến dịch Affiliate</h1>
                <p className="text-slate-400">Theo dõi và quản lý các liên kết chuyển hướng của bạn.</p>
              </div>
              <div className="flex items-center gap-5">
                <div className="bg-gray-800 px-6 py-2 rounded-xl border border-gray-700 flex flex-col items-center">
                  <span className="text-2xl font-extrabold text-white">{links.length}</span>
                  <span className="text-xs text-slate-400 uppercase tracking-widest">Tổng Link</span>
                </div>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-blue-500/20"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
                  Tạo Link Mới
                </button>
              </div>
            </header>

            <div className="relative max-w-md mb-8">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input 
                type="text" placeholder="Tìm kiếm mã hoặc link gốc..." 
                value={search} onChange={(e) => setSearch(e.target.value)} 
                className="w-full py-3 pl-11 pr-4 rounded-xl border border-gray-700 bg-[#111318] focus:border-blue-500 outline-none transition-colors text-slate-50" 
              />
            </div>

            <div className="bg-[#111318] rounded-2xl border border-gray-800 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#181b23] border-b border-gray-800">
                    <th className="p-5 text-sm font-semibold text-slate-400 uppercase tracking-wider">Mã Rút Gọn</th>
                    <th className="p-5 text-sm font-semibold text-slate-400 uppercase tracking-wider">Link Gốc</th>
                    <th className="p-5 text-sm font-semibold text-slate-400 uppercase tracking-wider">Ngày Lên Camp</th>
                    <th className="p-5 text-sm font-semibold text-slate-400 uppercase tracking-wider text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(groupedLinks).length === 0 ? (
                    <tr><td colSpan="4" className="p-10 text-center text-slate-500">Không tìm thấy chiến dịch nào.</td></tr>
                  ) : (
                    Object.entries(groupedLinks).map(([netName, group]) => {
                      const isExpanded = search !== '' || expandedGroups[netName] !== false;
                      return (
                        <React.Fragment key={netName}>
                          <tr onClick={() => setExpandedGroups(p => ({...p, [netName]: !p[netName]}))} className="bg-slate-800/50 border-b border-gray-700 cursor-pointer hover:bg-slate-800 transition">
                            <td colSpan="4" className="p-4 font-bold text-slate-200">
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                  <span className={`w-2.5 h-2.5 rounded-full ${group.info.colorClass}`}></span>
                                  {netName.toUpperCase()} <span className="text-sm font-medium text-slate-400 ml-2">({group.items.length} link)</span>
                                </span>
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && group.items.map((l) => (
                            <tr key={l.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                              <td className="p-5 flex items-center gap-2">
                                <span className="text-slate-500">/</span>
                                <strong className="text-slate-50 tracking-wide">{l.slug}</strong>
                              </td>
                              <td className="p-5 max-w-[350px]">
                                <div className="truncate text-slate-300 text-sm" title={l.original_url}>{l.original_url}</div>
                              </td>
                              <td className="p-5 text-slate-400 text-sm">{new Date(l.created_at).toLocaleDateString('vi-VN')}</td>
                              <td className="p-5 text-right">
                                <div className="flex gap-2 justify-end">
                                  <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/${l.slug}`); showToast(`📋 Đã copy: /${l.slug}`); }} className="p-2 bg-gray-700 text-slate-300 rounded-lg hover:bg-gray-600 transition"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
                                  <a href={l.original_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-700 text-slate-300 rounded-lg hover:bg-gray-600 transition"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>
                                  <button onClick={() => handleDelete(l.slug)} className="p-2 bg-gray-700 text-red-400 rounded-lg hover:bg-red-500/20 transition"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
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
          <div className="animate-[fadeIn_0.3s_ease-out]">
            <header className="mb-10">
              <h1 className="text-3xl font-bold text-slate-50 mb-2">Báo Cáo Hiệu Suất</h1>
              <p className="text-slate-400">Theo dõi traffic đẩy từ các nền tảng vào phễu.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-[#111318] p-6 rounded-2xl border border-gray-800 shadow-sm">
                <div className="text-slate-400 text-sm uppercase tracking-wider font-semibold mb-2">Tổng số Click (All-time)</div>
                <div className="text-4xl font-extrabold text-emerald-500">{clickLogs.length}</div>
              </div>
              <div className="bg-[#111318] p-6 rounded-2xl border border-gray-800 shadow-sm">
                <div className="text-slate-400 text-sm uppercase tracking-wider font-semibold mb-2">Link Đang Cắn Khỏe Nhất</div>
                <div className="text-2xl font-bold text-blue-400 mb-1">/{topLinks[0]?.slug || 'Chưa có'}</div>
                <div className="text-slate-300 text-sm">{topLinks[0]?.count || 0} lượt bấm</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-[#111318] p-6 rounded-2xl border border-gray-800">
                <h3 className="text-lg font-bold text-slate-50 mb-6">🌐 Nguồn Traffic Đổ Về</h3>
                {topReferrers.map(([name, count], index) => {
                  const percent = Math.round((count / clickLogs.length) * 100) || 0;
                  return (
                    <div key={name} className="mb-4">
                      <div className="flex justify-between text-sm mb-2"><span className="text-slate-300 font-medium">{name}</span><span className="text-slate-400">{count} click ({percent}%)</span></div>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden"><div style={{width: `${percent}%`}} className={`h-full rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-indigo-500'}`}></div></div>
                    </div>
                  )
                })}
              </div>

              <div className="bg-[#111318] p-6 rounded-2xl border border-gray-800">
                <h3 className="text-lg font-bold text-slate-50 mb-6">📱 Tỷ lệ Thiết bị</h3>
                {topDevices.map(([name, count], index) => {
                  const percent = Math.round((count / clickLogs.length) * 100) || 0;
                  return (
                    <div key={name} className="mb-4">
                      <div className="flex justify-between text-sm mb-2"><span className="text-slate-300 font-medium">{name}</span><span className="text-slate-400">{count} click ({percent}%)</span></div>
                      <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden"><div style={{width: `${percent}%`}} className={`h-full rounded-full ${index === 0 ? 'bg-emerald-500' : 'bg-green-400'}`}></div></div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
