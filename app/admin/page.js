'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Tối ưu hóa nhận diện các network phổ biến
const getNetworkInfo = (url) => {
  const lowerUrl = url?.toLowerCase() || '';
  if (lowerUrl.includes('dinos.click')) return { name: 'Dinos', color: 'text-red-500' };
  if (lowerUrl.includes('hl-link')) return { name: 'Hyperlead', color: 'text-indigo-500' };
  if (lowerUrl.includes('accesstrade')) return { name: 'Accesstrade', color: 'text-amber-500' };
  if (lowerUrl.includes('masoffer')) return { name: 'MasOffer', color: 'text-green-500' };
  if (lowerUrl.includes('facebook.com')) return { name: 'Social', color: 'text-blue-500' };
  return { name: 'Direct (Khác)', color: 'text-slate-400' };
};

export default function PremiumAdmin() {
  const router = useRouter();
  
  // State quản lý dữ liệu
  const [links, setLinks] = useState([]);
  const [clickLogs, setClickLogs] = useState([]); // Chỉ lưu log 30 ngày gần nhất
  const [totalClicks, setTotalClicks] = useState(0); // Tổng click All-time
  
  // State UI
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [activeTab, setActiveTab] = useState('links');

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkAuthAndFetchData();
    setupRealtime();
  }, []);

  // 1. Kiểm tra quyền và Tối ưu Fetch Data
  async function checkAuthAndFetchData() {
    try {
      setLoading(true);
      // Kiểm tra user đã đăng nhập chưa (Bảo mật)
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // router.push('/login'); // Bỏ comment dòng này khi bạn có trang login
        // return; 
      }

      // Lấy danh sách link
      const linksPromise = supabase.from('links').select('*').order('created_at', { ascending: false });
      
      // Lấy TỔNG click All-time (nhanh, không tốn RAM)
      const countPromise = supabase.from('click_logs').select('*', { count: 'exact', head: true });
      
      // Chỉ lấy log của 30 ngày gần nhất để phân tích (Tối ưu performance)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const logsPromise = supabase.from('click_logs')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      const [linksRes, countRes, logsRes] = await Promise.all([linksPromise, countPromise, logsPromise]);
      
      if (linksRes.data) setLinks(linksRes.data);
      if (countRes.count !== null) setTotalClicks(countRes.count);
      if (logsRes.data) setClickLogs(logsRes.data);
      
    } catch (error) {
      showToast('❌ Lỗi tải dữ liệu!', true);
    } finally {
      setLoading(false);
    }
  }

  // 2. Realtime: Lắng nghe click mới mà không cần F5
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
    setTimeout(() => setToast(null), 3000);
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

  const handleDelete = async (slug) => {
    if (!window.confirm(`Xóa vĩnh viễn phễu /${slug}? (Vẫn giữ click logs để đối soát)`)) return;
    
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

  const handleCopy = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
    showToast(`📋 Đã copy: /${slug}`);
  };

  const getLastClickInfo = (slug) => {
    const logs = clickLogs.filter(log => log.slug === slug);
    if (logs.length === 0) return { text: 'Chưa có click 30 ngày qua', color: 'text-slate-500', isDead: false };
    
    const lastLogTime = new Date(logs[0].created_at);
    const diffHours = (new Date() - lastLogTime) / (1000 * 60 * 60);

    if (diffHours < 1) return { text: 'Vừa cắn số 🔥', color: 'text-emerald-500', isDead: false };
    if (diffHours < 3) return { text: `Tầm ${Math.floor(diffHours)}h trước`, color: 'text-amber-500', isDead: false };
    return { text: `Đứng im >${Math.floor(diffHours)}h ⚠️`, color: 'text-red-500', isDead: true };
  };

  const toggleGroup = (netName) => setExpandedGroups(prev => ({ ...prev, [netName]: !prev[netName] }));

  // Data processing (Memoized)
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

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200 font-sans">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 px-6 py-3 rounded-lg shadow-xl z-50 font-medium animate-bounce ${toast.isError ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
          {toast.text}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-slate-50 mb-6">Tạo Phễu Mồi Mới 🚀</h2>
            <form onSubmit={handleAddLink} className="flex flex-col gap-5">
              <div>
                <label className="block mb-2 text-sm text-slate-400">Link Đích (Affiliate Link)</label>
                <input required type="url" placeholder="https://dinos.click/..." value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full p-3 rounded-lg border border-slate-700 bg-slate-800 text-slate-50 outline-none focus:border-blue-500 transition-colors" />
              </div>
              <div>
                <label className="block mb-2 text-sm text-slate-400">Đuôi Link (Slug) - Để trống sẽ Random</label>
                <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-3 focus-within:border-blue-500 transition-colors">
                  <span className="text-slate-500">/</span>
                  <input type="text" placeholder="vay-tien-nhanh" value={customSlug} onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                    className="w-full p-3 bg-transparent border-none outline-none text-slate-50" />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-3 border border-slate-700 text-slate-300 rounded-lg font-semibold hover:bg-slate-800 transition-colors">Hủy</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 p-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-lg font-semibold transition-colors">
                  {isSubmitting ? 'Đang tạo...' : 'Tạo Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-[260px] border-r border-slate-800 bg-slate-900 p-6 flex flex-col shrink-0">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center font-bold text-white">B</div>
          <span className="text-xl font-bold tracking-wide text-slate-50">BINHTIENTI</span>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          <button onClick={() => setActiveTab('links')} className={`w-full text-left p-3 rounded-lg font-medium flex items-center gap-3 transition-colors ${activeTab === 'links' ? 'bg-slate-800 text-slate-50' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg> Quản lý Links
          </button>
          <button onClick={() => setActiveTab('stats')} className={`w-full text-left p-3 rounded-lg font-medium flex items-center gap-3 transition-colors ${activeTab === 'stats' ? 'bg-slate-800 text-slate-50' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg> Thống kê Traffic
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto p-10">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-lg">Đang đồng bộ dữ liệu hệ thống... ⏳</div>
        ) : activeTab === 'links' ? (
          
          /* TAB LINKS */
          <div className="animate-in fade-in duration-300">
            <header className="flex justify-between items-center mb-10">
              <div>
                <h1 className="text-3xl font-bold text-slate-50 mb-2">Chiến dịch Affiliate</h1>
                <p className="text-slate-400">Theo dõi và quản lý các liên kết chuyển hướng của bạn.</p>
              </div>
              <div className="flex items-center gap-5">
                <div className="bg-slate-800 px-5 py-2 rounded-xl border border-slate-700 flex flex-col items-center">
                  <span className="text-xl font-extrabold text-white">{links.length}</span>
                  <span className="text-xs text-slate-400 uppercase tracking-widest">Tổng Link</span>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg> Tạo Link Mới
                </button>
              </div>
            </header>

            <div className="relative max-w-md mb-6">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input type="text" placeholder="Tìm kiếm mã hoặc link gốc..." value={search} onChange={(e) => setSearch(e.target.value)} 
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-900 text-slate-50 outline-none focus:border-slate-500 transition-colors" />
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
              <table className="w-full text-left whitespace-nowrap">
                <thead className="bg-slate-950/50 border-b border-slate-800">
                  <tr>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Mã Rút Gọn</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Link Gốc & Tín Hiệu</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Ngày Lên Camp</th>
                    <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {Object.keys(groupedLinks).length === 0 ? (
                    <tr><td colSpan="4" className="p-10 text-center text-slate-500">Không tìm thấy chiến dịch nào. Hãy tạo phễu mới.</td></tr>
                  ) : (
                    Object.entries(groupedLinks).map(([netName, group]) => {
                      const isExpanded = search !== '' || expandedGroups[netName] !== false;
                      return (
                        <React.Fragment key={netName}>
                          <tr onClick={() => toggleGroup(netName)} className="bg-slate-800/50 cursor-pointer hover:bg-slate-800 transition-colors select-none">
                            <td colSpan="4" className={`p-3 font-bold ${group.info.color}`}>
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                  Nền tảng: {netName.toUpperCase()} <span className="text-slate-400 text-sm font-medium ml-2">({group.items.length} link)</span>
                                </span>
                                <svg className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path></svg>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && group.items.map((l) => {
                            const lastClick = getLastClickInfo(l.slug);
                            return (
                              <tr key={l.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-500">/</span>
                                    <strong className="text-slate-50 tracking-wide">{l.slug}</strong>
                                  </div>
                                </td>
                                <td className="p-4 max-w-[350px]">
                                  <div className="truncate text-slate-300 text-sm mb-1" title={l.original_url}>{l.original_url}</div>
                                  <div className={`flex items-center gap-2 text-xs font-medium ${lastClick.color}`}>
                                    {lastClick.isDead && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                                    {lastClick.text}
                                  </div>
                                </td>
                                <td className="p-4 text-slate-400 text-sm">{new Date(l.created_at).toLocaleDateString('vi-VN')}</td>
                                <td className="p-4">
                                  <div className="flex gap-2 justify-end">
                                    <button onClick={() => handleCopy(l.slug)} title="Copy" className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
                                    <a href={l.original_url} target="_blank" rel="noopener noreferrer" title="Mở Link" className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>
                                    <button onClick={() => handleDelete(l.slug)} title="Xóa" className="p-2 bg-slate-800 hover:bg-red-500/20 text-red-400 hover:text-red-500 rounded-lg transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
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
            <header className="mb-10">
              <h1 className="text-3xl font-bold text-slate-50 mb-2">Báo Cáo Hiệu Suất</h1>
              <p className="text-slate-400">Theo dõi traffic đẩy từ các nền tảng vào phễu (Dữ liệu 30 ngày qua).</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
                <div className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-2">Tổng số Click (All-time)</div>
                <div className="text-4xl font-black text-emerald-500">{totalClicks.toLocaleString()}</div>
              </div>
              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm">
                <div className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-2">Link Đang Cắn Khỏe Nhất</div>
                <div className="text-2xl font-bold text-blue-400 mb-1">/{topLinks[0]?.slug || 'Chưa có'}</div>
                <div className="text-slate-300 text-sm">{topLinks[0]?.count || 0} lượt bấm (30 ngày)</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                <h3 className="text-lg font-bold text-slate-50 mb-6">🌐 Nguồn Traffic Đổ Về</h3>
                {topReferrers.length === 0 ? <p className="text-slate-500">Chưa có dữ liệu</p> : 
                  topReferrers.map(([name, count], index) => {
                    const percent = Math.round((count / clickLogs.length) * 100);
                    return (
                      <div key={name} className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-300 font-medium">{name}</span>
                          <span className="text-slate-400">{count} click ({percent}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ${index === 0 ? 'bg-blue-500' : 'bg-indigo-500'}`} style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>

              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                <h3 className="text-lg font-bold text-slate-50 mb-6">📱 Tỷ lệ Thiết bị</h3>
                {topDevices.length === 0 ? <p className="text-slate-500">Chưa có dữ liệu</p> : 
                  topDevices.map(([name, count], index) => {
                    const percent = Math.round((count / clickLogs.length) * 100);
                    return (
                      <div key={name} className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-300 font-medium">{name}</span>
                          <span className="text-slate-400">{count} click ({percent}%)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-1000 ${index === 0 ? 'bg-emerald-500' : 'bg-teal-400'}`} style={{ width: `${percent}%` }}></div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <h3 className="text-lg font-bold text-slate-50 mb-4">🔥 Bảng Xếp Hạng Camp (30 ngày)</h3>
              <table className="w-full text-left">
                <thead className="border-b border-slate-800 text-slate-400 text-sm">
                  <tr>
                    <th className="pb-3 font-semibold">TOP</th>
                    <th className="pb-3 font-semibold">Mã Rút Gọn</th>
                    <th className="pb-3 font-semibold">Nền Tảng</th>
                    <th className="pb-3 font-semibold text-right">Click</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {topLinks.slice(0, 10).map((link, idx) => (
                    <tr key={link.slug}>
                      <td className={`py-4 font-bold ${idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-700' : 'text-slate-500'}`}>#{idx + 1}</td>
                      <td className="py-4 text-slate-50 font-medium">/{link.slug}</td>
                      <td className="py-4 text-slate-400 text-sm">{link.network}</td>
                      <td className="py-4 text-emerald-500 font-bold text-right">{link.count}</td>
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
