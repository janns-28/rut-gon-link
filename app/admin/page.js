'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Thiết kế lại Badge: Nhỏ, gọn, màu tinh tế hơn
const getNetworkInfo = (url) => {
  const lowerUrl = url?.toLowerCase() || '';
  if (lowerUrl.includes('dinos.click')) return { name: 'Dinos', color: 'bg-red-500/10 text-red-400 border border-red-500/20' };
  if (lowerUrl.includes('hl-link')) return { name: 'Hyperlead', color: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' };
  if (lowerUrl.includes('accesstrade')) return { name: 'Accesstrade', color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' };
  if (lowerUrl.includes('masoffer')) return { name: 'MasOffer', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
  if (lowerUrl.includes('facebook.com')) return { name: 'Social', color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' };
  return { name: 'Direct (Khác)', color: 'bg-slate-800 text-slate-300 border border-slate-700' };
};

export default function PremiumAdmin() {
  const router = useRouter();
  
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
    checkAuthAndFetchData();
    setupRealtime();
  }, []);

  async function checkAuthAndFetchData() {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { /* router.push('/login'); */ }

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

  const getLastClickInfo = (slug) => {
    const logs = clickLogs.filter(log => log.slug === slug);
    if (logs.length === 0) return { text: 'Chưa có click', badge: 'text-slate-500', isDead: false };
    const diffHours = (new Date() - new Date(logs[0].created_at)) / (1000 * 60 * 60);
    if (diffHours < 1) return { text: 'Vừa cắn số 🔥', badge: 'text-emerald-400', isDead: false };
    if (diffHours < 3) return { text: `~ ${Math.floor(diffHours)}h trước`, badge: 'text-amber-400', isDead: false };
    return { text: `>${Math.floor(diffHours)}h đứng ⚠️`, badge: 'text-red-400', isDead: true };
  };

  const toggleGroup = (netName) => setExpandedGroups(prev => ({ ...prev, [netName]: !prev[netName] }));

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
      let ref = log.referrer || 'Direct (Trực tiếp)';
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

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a] text-slate-300 font-sans selection:bg-blue-500/30">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-2.5 rounded-lg shadow-xl border z-50 text-sm font-medium flex items-center gap-2 animate-in slide-in-from-bottom-5 ${toast.isError ? 'bg-red-950/80 border-red-900 text-red-200' : 'bg-emerald-950/80 border-emerald-900 text-emerald-200'}`}>
          <span>{toast.text}</span>
        </div>
      )}

      {/* Modal Cực Gọn Gàng */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] p-6 rounded-xl border border-slate-800 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-semibold text-slate-100 mb-6">Tạo Phễu Mới</h2>
            <form onSubmit={handleAddLink} className="flex flex-col gap-4">
              <div>
                <label className="block mb-1.5 text-xs font-medium text-slate-400">Link Đích (Affiliate Link)</label>
                <input required type="url" placeholder="https://..." value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-700 bg-slate-900/50 text-slate-100 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition" />
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-medium text-slate-400">Custom Slug (Tùy chọn)</label>
                <div className="flex items-center bg-slate-900/50 border border-slate-700 rounded-lg px-3 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition overflow-hidden">
                  <span className="text-slate-500 text-sm">/</span>
                  <input type="text" placeholder="random" value={customSlug} onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                    className="w-full px-2 py-2.5 bg-transparent border-none outline-none text-slate-100 text-sm" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-transparent border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm rounded-lg font-medium transition">Hủy</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-white text-black hover:bg-slate-200 disabled:opacity-50 text-sm rounded-lg font-medium transition">
                  {isSubmitting ? 'Đang tạo...' : 'Tạo Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar: Gọn hơn, tinh tế hơn */}
      <aside className="w-64 border-r border-slate-800 bg-[#0a0a0a] p-5 flex flex-col shrink-0">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-blue-500/20">B</div>
          <span className="text-lg font-bold text-slate-100 tracking-tight">BINHTIENTI</span>
        </div>
        <nav className="flex flex-col gap-1.5 flex-1">
          <button onClick={() => setActiveTab('links')} className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium flex items-center gap-3 transition-colors ${activeTab === 'links' ? 'bg-slate-800/60 text-white' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg> 
            Quản lý Links
          </button>
          <button onClick={() => setActiveTab('stats')} className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium flex items-center gap-3 transition-colors ${activeTab === 'stats' ? 'bg-slate-800/60 text-white' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg> 
            Thống kê Traffic
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto p-8">
          
          {loading ? (
            <div className="h-[60vh] flex items-center justify-center text-slate-500 text-sm font-medium">Đang đồng bộ dữ liệu...</div>
          ) : activeTab === 'links' ? (
            
            <div className="animate-in fade-in duration-300">
              {/* Header Gọn gàng */}
              <header className="flex justify-between items-end mb-8">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-100 tracking-tight mb-1">Chiến dịch Affiliate</h1>
                  <p className="text-slate-400 text-sm">Quản lý các liên kết chuyển hướng của bạn.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg">
                    <span className="text-xs font-medium text-slate-500 uppercase">Links</span>
                    <span className="text-sm font-semibold text-slate-200">{links.length}</span>
                  </div>
                  <button onClick={() => setIsModalOpen(true)} className="bg-white hover:bg-slate-200 text-black px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition active:scale-95">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg> 
                    Tạo Phễu
                  </button>
                </div>
              </header>

              {/* Thanh Search Gọn gàng */}
              <div className="relative mb-6 max-w-md">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input type="text" placeholder="Tìm kiếm slug hoặc link gốc..." value={search} onChange={(e) => setSearch(e.target.value)} 
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-200 text-sm outline-none focus:border-slate-600 transition" />
              </div>

              {/* Bảng Link: Linear Style */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#111]">
                <table className="w-full text-left whitespace-nowrap text-sm">
                  <thead className="bg-slate-900/50 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-5 font-medium text-slate-400 text-xs uppercase tracking-wider">Slug</th>
                      <th className="py-3 px-5 font-medium text-slate-400 text-xs uppercase tracking-wider w-full">Original Link & Status</th>
                      <th className="py-3 px-5 font-medium text-slate-400 text-xs uppercase tracking-wider">Date</th>
                      <th className="py-3 px-5 font-medium text-slate-400 text-xs uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {Object.keys(groupedLinks).length === 0 ? (
                      <tr><td colSpan="4" className="py-12 text-center text-slate-500">Chưa có chiến dịch nào.</td></tr>
                    ) : (
                      Object.entries(groupedLinks).map(([netName, group]) => {
                        const isExpanded = search !== '' || expandedGroups[netName] !== false;
                        return (
                          <React.Fragment key={netName}>
                            {/* Dòng Group Nền tảng: Rất mỏng, ôm sát */}
                            <tr onClick={() => toggleGroup(netName)} className="bg-slate-900/30 hover:bg-slate-800/30 cursor-pointer transition select-none group/row">
                              <td colSpan="4" className="py-2.5 px-5">
                                <div className="flex items-center justify-between">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${group.info.color}`}>
                                    {netName} <span className="opacity-70 ml-1">({group.items.length})</span>
                                  </span>
                                  <svg className={`w-4 h-4 text-slate-600 group-hover/row:text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                              </td>
                            </tr>
                            {/* Dòng Detail: Giảm padding, dồn nội dung */}
                            {isExpanded && group.items.map((l) => {
                              const lastClick = getLastClickInfo(l.slug);
                              return (
                                <tr key={l.id} className="hover:bg-slate-800/20 transition group/item">
                                  <td className="py-3 px-5">
                                    <div className="flex items-center gap-0.5 font-mono text-slate-200">
                                      <span className="text-slate-600">/</span>{l.slug}
                                    </div>
                                  </td>
                                  <td className="py-3 px-5 max-w-[400px]">
                                    <div className="flex flex-col gap-1">
                                      <div className="truncate text-slate-400 hover:text-slate-300 transition cursor-default" title={l.original_url}>{l.original_url}</div>
                                      <div className={`flex items-center gap-1.5 text-[11px] font-medium ${lastClick.badge}`}>
                                        {lastClick.isDead && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                                        {lastClick.text}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-5 text-slate-500 text-[13px]">{new Date(l.created_at).toLocaleDateString('vi-VN')}</td>
                                  <td className="py-3 px-5">
                                    <div className="flex gap-1.5 justify-end opacity-0 group-hover/item:opacity-100 transition-opacity">
                                      <button onClick={() => handleCopy(l.slug)} title="Copy" className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-md transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
                                      <a href={l.original_url} target="_blank" rel="noopener noreferrer" title="Mở Link" className="p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-md transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>
                                      <button onClick={() => handleDelete(l.slug)} title="Xóa" className="p-1.5 text-red-500/70 hover:text-red-400 hover:bg-red-500/10 rounded-md transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
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
            /* TAB STATS */
            <div className="animate-in fade-in duration-300">
              <header className="mb-8 border-b border-slate-800 pb-6">
                <h1 className="text-2xl font-semibold text-slate-100 tracking-tight mb-1">Thống Kê Traffic</h1>
                <p className="text-slate-400 text-sm">Dữ liệu 30 ngày qua.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-[#111] p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Tổng Clicks</div>
                  <div className="text-3xl font-bold text-slate-100">{totalClicks.toLocaleString()}</div>
                </div>
                <div className="bg-[#111] p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Camp Top 1</div>
                  <div className="flex items-end gap-3">
                    <span className="text-2xl font-bold text-blue-400">/{topLinks[0]?.slug || '---'}</span>
                    <span className="text-sm text-slate-400 mb-1">{topLinks[0]?.count || 0} clicks</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="bg-[#111] rounded-xl border border-slate-800 p-6">
                  <h3 className="text-sm font-semibold text-slate-300 mb-5">Nguồn Truy Cập</h3>
                  {topReferrers.length === 0 ? <p className="text-slate-600 text-sm">Chưa có dữ liệu</p> : 
                    topReferrers.slice(0,5).map(([name, count]) => {
                      const percent = Math.round((count / clickLogs.length) * 100);
                      return (
                        <div key={name} className="mb-4 last:mb-0">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-slate-300">{name}</span>
                            <span className="text-slate-500">{percent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-400 rounded-full" style={{ width: `${percent}%` }}></div>
                          </div>
                        </div>
                      )
                    })
                  }
                </div>

                <div className="bg-[#111] rounded-xl border border-slate-800 p-6">
                  <h3 className="text-sm font-semibold text-slate-300 mb-5">Thiết Bị</h3>
                  {topDevices.length === 0 ? <p className="text-slate-600 text-sm">Chưa có dữ liệu</p> : 
                    topDevices.map(([name, count]) => {
                      const percent = Math.round((count / clickLogs.length) * 100);
                      return (
                        <div key={name} className="mb-4 last:mb-0">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-slate-300">{name}</span>
                            <span className="text-slate-500">{percent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-400 rounded-full" style={{ width: `${percent}%` }}></div>
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
