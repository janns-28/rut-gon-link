'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Tối ưu hóa nhận diện các network phổ biến và thiết kế lại badge
const getNetworkInfo = (url) => {
  const lowerUrl = url?.toLowerCase() || '';
  if (lowerUrl.includes('dinos.click')) return { name: 'Dinos', color: 'bg-red-500/10 text-red-400 border border-red-500/30' };
  if (lowerUrl.includes('hl-link')) return { name: 'Hyperlead', color: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' };
  if (lowerUrl.includes('accesstrade')) return { name: 'Accesstrade', color: 'bg-amber-500/10 text-amber-400 border border-amber-500/30' };
  if (lowerUrl.includes('masoffer')) return { name: 'MasOffer', color: 'bg-green-500/10 text-green-400 border border-green-500/30' };
  if (lowerUrl.includes('facebook.com')) return { name: 'Social', color: 'bg-blue-500/10 text-blue-400 border border-blue-500/30' };
  return { name: 'Direct (Khác)', color: 'bg-slate-700/50 text-slate-400 border border-slate-600/50' };
};

export default function PremiumAdmin() {
  const router = useRouter();
  
  // States giữ nguyên chức năng cũ
  const [links, setLinks] = useState([]);
  const [clickLogs, setClickLogs] = useState([]);
  const [totalClicks, setTotalClicks] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [activeTab, setActiveTab] = useState('links');

  // Modal states giữ nguyên
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkAuthAndFetchData();
    setupRealtime();
  }, []);

  // 1. Kiểm tra Auth và Fetch Data (Giữ nguyên logic logic)
  async function checkAuthAndFetchData() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // router.push('/login'); 
        // return; 
      }

      // Đếm tổng click
      const { count } = await supabase.from('click_logs').select('*', { count: 'exact', head: true });
      if (count !== null) setTotalClicks(count);

      // Tải logs 30 ngày gần nhất
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

  // 2. Realtime (Giữ nguyên logic)
  function setupRealtime() {
    const channel = supabase.channel('realtime_clicks')
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

  // 3. Xử lý link (Giữ nguyên logic)
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

  const handleCopy = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
    showToast(`📋 Đã copy: /${slug}`);
  };

  const handleDelete = async (slug) => {
    if (!window.confirm(`Xóa vĩnh viễn phễu /${slug}? (Click logs vẫn sẽ được giữ lại để check đối soát)`)) return;
    
    const previousLinks = [...links];
    setLinks(links.filter(l => l.slug !== slug));
    
    try {
      const res = await fetch('/api/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) });
      if (!res.ok) throw new Error();
      showToast(`🗑️ Đã dọn dẹp /${slug}`);
    } catch (error) {
      setLinks(previousLinks);
      showToast(`❌ Lỗi không xóa được!`, true);
    }
  };

  // 4. Phân tích data (Giữ nguyên logic)
  const getLastClickInfo = (slug) => {
    const logs = clickLogs.filter(log => log.slug === slug);
    if (logs.length === 0) return { text: 'Chưa có click (30 ngày)', badgeColor: 'bg-slate-700 text-slate-400', isDead: false };
    
    const lastLogTime = new Date(logs[0].created_at);
    const diffHours = (new Date() - lastLogTime) / (1000 * 60 * 60);

    if (diffHours < 1) return { text: 'Vừa cắn số 🔥', badgeColor: 'bg-emerald-500/10 text-emerald-400', isDead: false };
    if (diffHours < 3) return { text: `~ ${Math.floor(diffHours)}h trước`, badgeColor: 'bg-amber-500/10 text-amber-400', isDead: false };
    return { text: `>${Math.floor(diffHours)}h đứng ⚠️`, badgeColor: 'bg-red-500/10 text-red-400', isDead: true };
  };

  const toggleGroup = (netName) => {
    setExpandedGroups(prev => ({ ...prev, [netName]: !prev[netName] }));
  };

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
    const counts = {}; const refs = {}; const devs = {};
    clickLogs.forEach(log => {
      counts[log.slug] = (counts[log.slug] || 0) + 1;
      let ref = log.referrer || 'Direct (Truy cập thẳng)';
      const lowerRef = ref.toLowerCase();
      if (lowerRef.includes('facebook')) ref = 'Facebook';
      else if (lowerRef.includes('tiktok')) ref = 'TikTok';
      else if (lowerRef.includes('zalo')) ref = 'Zalo';
      else if (ref.startsWith('http')) { try { ref = new URL(ref).hostname; } catch(e){} }
      refs[ref] = (refs[ref] || 0) + 1;
      const ua = (log.user_agent || '').toLowerCase();
      let device = 'Khác';
      if (ua.includes('iphone') || ua.includes('ipad')) device = 'iOS (Apple)';
      else if (ua.includes('android')) device = 'Android';
      else if (ua.includes('windows')) device = 'Windows PC';
      else if (ua.includes('mac')) device = 'MacBook';
      devs[device] = (devs[device] || 0) + 1;
    });
    return {
      topLinks: Object.entries(counts).map(([slug, count]) => {
        const linkData = links.find(l => l.slug === slug);
        return { slug, count, network: linkData ? getNetworkInfo(linkData.original_url).name : 'Unknown' };
      }).sort((a, b) => b.count - a.count),
      topReferrers: Object.entries(refs).sort((a, b) => b[1] - a[1]),
      topDevices: Object.entries(devs).sort((a, b) => b[1] - a[1])
    };
  }, [clickLogs, links]);

  // 5. Giao diện Tailwind MỚI
  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      
      {/* Toast Notification (Thiết kế lại) */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-2xl z-50 font-semibold flex items-center gap-3 animate-in slide-in-from-bottom-5 ${toast.isError ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
          <span>{toast.text}</span>
        </div>
      )}

      {/* Modal Tạo Link (Thiết kế lại, backdrop blur) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-extrabold text-slate-50 mb-7 flex items-center gap-3">Tạo Phễu Mồi Mới <span className="animate-pulse">🚀</span></h2>
            <form onSubmit={handleAddLink} className="flex flex-col gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-400">Link Đích (Affiliate Link)</label>
                <input required type="url" placeholder="https://dinos.click/..." value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-700 bg-slate-800 text-slate-50 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition" />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-400">Đuôi Link (Slug) - Để trống sẽ Random</label>
                <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl px-4 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition">
                  <span className="text-slate-500 font-mono">/</span>
                  <input type="text" placeholder="vay-tien-nhanh" value={customSlug} onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                    className="w-full p-3 bg-transparent border-none outline-none text-slate-50 font-mono" />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-3 border border-slate-700 text-slate-300 rounded-xl font-bold hover:bg-slate-800 transition active:scale-95">Hủy</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 p-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-bold transition active:scale-95">
                  {isSubmitting ? 'Đang tạo...' : 'Tạo Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar (Cố định, màu Slate900) */}
      <aside className="w-[280px] border-r border-slate-800 bg-slate-900 p-7 flex flex-col shrink-0">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/20">B</div>
          <span className="text-2xl font-black tracking-tighter text-slate-50">BINHTIENTI<span className="text-blue-500">.</span></span>
        </div>
        <nav className="flex flex-col gap-3 flex-1">
          <button onClick={() => setActiveTab('links')} className={`w-full text-left p-4 rounded-xl font-semibold flex items-center gap-3.5 transition group active:scale-[0.98] ${activeTab === 'links' ? 'bg-slate-800 text-slate-50 shadow-inner' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'}`}>
            <svg className={`w-5 h-5 ${activeTab === 'links' ? 'text-blue-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg> 
            <span>Quản lý Links</span>
            {activeTab === 'links' && <span className="ml-auto w-1.5 h-6 bg-blue-500 rounded-full"></span>}
          </button>
          <button onClick={() => setActiveTab('stats')} className={`w-full text-left p-4 rounded-xl font-semibold flex items-center gap-3.5 transition group active:scale-[0.98] ${activeTab === 'stats' ? 'bg-slate-800 text-slate-50 shadow-inner' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'}`}>
            <svg className={`w-5 h-5 ${activeTab === 'stats' ? 'text-blue-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg> 
            <span>Thống kê Traffic</span>
            {activeTab === 'stats' && <span className="ml-auto w-1.5 h-6 bg-blue-500 rounded-full"></span>}
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto p-10 bg-slate-950/50">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-lg font-medium animate-pulse">Đang đồng bộ dữ liệu hệ thống... ⏳</div>
        ) : activeTab === 'links' ? (
          
          /* TAB LINKS (Thiết kế lại, Card-based) */
          <div className="animate-in fade-in duration-300">
            <header className="flex justify-between items-center mb-10 pb-6 border-b border-slate-800">
              <div>
                <h1 className="text-4xl font-extrabold text-slate-50 tracking-tighter mb-2">Chiến dịch Affiliate</h1>
                <p className="text-slate-400 text-lg font-medium">Theo dõi và quản lý các liên kết chuyển hướng của bạn.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-slate-900 px-6 py-3 rounded-xl border border-slate-800 text-center shadow-inner">
                  <div className="text-sm font-semibold text-slate-400 text-center tracking-widest uppercase">Tổng Link</div>
                  <div className="text-2xl font-black text-white">{links.length}</div>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-7 py-4 rounded-xl font-bold flex items-center gap-2.5 shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg> 
                  Tạo Phễu Mới
                </button>
              </div>
            </header>

            {/* Thanh Search mới */}
            <div className="relative max-w-md mb-8 group">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 w-5 h-5 transition-colors" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input type="text" placeholder="Tìm kiếm mã hoặc link gốc..." value={search} onChange={(e) => setSearch(e.target.value)} 
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-50 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-slate-500 transition shadow-inner" />
            </div>

            {/* Bảng Link mới (Card container) */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl shadow-slate-950/30">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-slate-950/60 border-b border-slate-800">
                  <tr>
                    <th className="p-5 text-sm font-bold text-slate-400 uppercase tracking-wider">Mã Rút Gọn</th>
                    <th className="p-5 text-sm font-bold text-slate-400 uppercase tracking-wider">Link Gốc & Tín Hiệu</th>
                    <th className="p-5 text-sm font-bold text-slate-400 uppercase tracking-wider">Ngày Lên Camp</th>
                    <th className="p-5 text-sm font-bold text-slate-400 uppercase tracking-wider text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-medium">
                  {Object.keys(groupedLinks).length === 0 ? (
                    <tr><td colSpan="4" className="p-16 text-center text-slate-500 text-lg font-medium">Hệ thống đang chờ phễu mồi đầu tiên của ông... 🚀</td></tr>
                  ) : (
                    Object.entries(groupedLinks).map(([netName, group]) => {
                      const isExpanded = search !== '' || expandedGroups[netName] !== false;
                      return (
                        <React.Fragment key={netName}>
                          {/* Row Nền tảng thiết kế lại */}
                          <tr onClick={() => toggleGroup(netName)} className="bg-slate-800 cursor-pointer hover:bg-slate-700 transition select-none">
                            <td colSpan="4" className="p-4 pl-6">
                              <div className="flex items-center justify-between">
                                <span className={`font-extrabold text-base flex items-center gap-2 px-3 py-1 rounded-lg ${group.info.color}`}>
                                  Nền tảng: {netName.toUpperCase()} 
                                  <span className="opacity-60 text-sm font-bold ml-1">({group.items.length})</span>
                                </span>
                                <svg className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                              </div>
                            </td>
                          </tr>
                          {/* Row Link chi tiết */}
                          {isExpanded && group.items.map((l) => {
                            const lastClick = getLastClickInfo(l.slug);
                            return (
                              <tr key={l.id} className="hover:bg-slate-800/40 transition">
                                <td className="p-5 pl-8">
                                  <div className="flex items-center gap-1 font-mono text-base">
                                    <span className="text-slate-500">/</span>
                                    <strong className="text-slate-50 tracking-wide font-bold">{l.slug}</strong>
                                  </div>
                                </td>
                                <td className="p-5 max-w-[380px]">
                                  <div className="truncate text-slate-300 mb-1.5 font-normal" title={l.original_url}>{l.original_url}</div>
                                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${lastClick.badgeColor}`}>
                                    {lastClick.isDead && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                                    {lastClick.text}
                                  </div>
                                </td>
                                <td className="p-5 text-slate-400">{new Date(l.created_at).toLocaleDateString('vi-VN')}</td>
                                <td className="p-5">
                                  <div className="flex gap-2 justify-end">
                                    <button onClick={() => handleCopy(l.slug)} title="Copy link" className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition active:scale-95"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
                                    <a href={l.original_url} target="_blank" rel="noopener noreferrer" title="Mở Link Gốc" className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition active:scale-95"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>
                                    <button onClick={() => handleDelete(l.slug)} title="Xóa" className="p-2.5 bg-slate-800 hover:bg-red-950/70 text-red-400 hover:text-red-300 rounded-lg transition active:scale-95"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
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
          /* TAB STATS (Thiết kế lại, Clean & Professional) */
          <div className="animate-in fade-in duration-300">
            <header className="mb-10 pb-6 border-b border-slate-800">
              <h1 className="text-4xl font-extrabold text-slate-50 tracking-tighter mb-2">Báo Cáo Hiệu Suất 📈</h1>
              <p className="text-slate-400 text-lg font-medium">Theo dõi traffic đẩy từ các nền tảng (Dữ liệu 30 ngày qua).</p>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-900 p-7 rounded-2xl border border-slate-800 shadow-2xl shadow-slate-950/20">
                <div className="text-slate-400 text-smuppercase tracking-widest font-bold mb-2">Tổng số Click <span className="text-slate-600">(All-time)</span></div>
                <div className="text-5xl font-black text-emerald-500 tracking-tighter">{totalClicks.toLocaleString()}</div>
              </div>
              <div className="bg-slate-900 p-7 rounded-2xl border border-slate-800 shadow-2xl shadow-slate-950/20">
                <div className="text-slate-400 text-sm uppercase tracking-widest font-bold mb-2.5">Camp Hiệu Quả Nhất</div>
                <div className="text-3xl font-extrabold text-blue-400 mb-1 tracking-tight">/{topLinks[0]?.slug || 'Chưa có'}</div>
                <div className="text-slate-300 font-medium">{topLinks[0]?.count || 0} clicks (Nền tảng: {topLinks[0]?.network || '...'})</div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 mb-8">
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-7 shadow-2xl shadow-slate-950/20">
                <h3 className="text-xl font-bold text-slate-100 mb-7 flex items-center gap-2"><span className="text-lg">🌐</span> Nguồn Traffic Đổ Về</h3>
                {topReferrers.length === 0 ? <p className="text-slate-500 font-medium p-6 text-center">Chưa có đủ dữ liệu</p> : 
                  topReferrers.map(([name, count], index) => {
                    const percent = Math.round((count / clickLogs.length) * 100);
                    return (
                      <div key={name} className="mb-5">
                        <div className="flex justify-between text-sm mb-2 font-medium">
                          <span className="text-slate-200">{name}</span>
                          <span className="text-slate-400">{count} clicks <span className="text-slate-500">({percent}%)</span></span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-700">
                          <div className={`h-full rounded-full transition-all duration-1000 ${index === 0 ? 'bg-blue-500 shadow-lg shadow-blue-500/30' : 'bg-blue-600/70'}`} style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>

              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-7 shadow-2xl shadow-slate-950/20">
                <h3 className="text-xl font-bold text-slate-100 mb-7 flex items-center gap-2"><span className="text-lg">📱</span> Thiết Bị Sử Dụng</h3>
                {topDevices.length === 0 ? <p className="text-slate-500 font-medium p-6 text-center">Chưa có đủ dữ liệu</p> : 
                  topDevices.map(([name, count], index) => {
                    const percent = Math.round((count / clickLogs.length) * 100);
                    return (
                      <div key={name} className="mb-5">
                        <div className="flex justify-between text-sm mb-2 font-medium">
                          <span className="text-slate-200">{name}</span>
                          <span className="text-slate-400">{count} clicks <span className="text-slate-500">({percent}%)</span></span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-700">
                          <div className={`h-full rounded-full transition-all duration-1000 ${index === 0 ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-emerald-600/70'}`} style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>

            {/* Ranking Table */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-7 shadow-2xl shadow-slate-950/20">
              <h3 className="text-xl font-bold text-slate-100 mb-5 flex items-center gap-2"><span className="text-lg">🔥</span> Bảng Xếp Hạng Camp (30 ngày)</h3>
              <table className="w-full text-left">
                <thead className="border-b border-slate-800 Text-sm">
                  <tr>
                    <th className="pb-4 font-bold text-slate-400 tracking-wider">TOP</th>
                    <th className="pb-4 font-bold text-slate-400 tracking-wider">Mã Rút Gọn</th>
                    <th className="pb-4 font-bold text-slate-400 tracking-wider">Nền Tảng</th>
                    <th className="pb-4 font-bold text-slate-400 tracking-wider text-right">Tổng Click</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {topLinks.slice(0, 10).map((link, idx) => (
                    <tr key={link.slug} className="hover:bg-slate-800/30 transition">
                      <td className={`py-4 font-extrabold text-base ${idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-700' : 'text-slate-500'}`}>#{idx + 1}</td>
                      <td className="py-4 font-mono text-base font-bold text-slate-50">/{link.slug}</td>
                      <td className="py-4 text-slate-400">{link.network}</td>
                      <td className="py-4 text-emerald-400 font-extrabold text-lg text-right">{link.count.toLocaleString()}</td>
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
