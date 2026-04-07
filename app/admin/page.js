'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// --- CONFIG MÀU SẮC NETWORK NHẸ NHÀNG HƠN ---
const getNetworkInfo = (url) => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('dinos.click')) return { name: 'Dinos', color: 'text-red-600 bg-red-50 border-red-200' };
  if (lowerUrl.includes('hl-link')) return { name: 'Hyperlead', color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
  if (lowerUrl.includes('accesstrade')) return { name: 'Accesstrade', color: 'text-amber-600 bg-amber-50 border-amber-200' };
  if (lowerUrl.includes('masoffer')) return { name: 'MasOffer', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  return { name: 'Direct', color: 'text-slate-600 bg-slate-100 border-slate-200' };
};

export default function PremiumAdmin() {
  const [links, setLinks] = useState([]);
  const [clickLogs, setClickLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
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
    setTimeout(() => setToast(''), 3000);
  };

  const getLastClickInfo = (slug) => {
    const logs = clickLogs.filter(log => log.slug === slug);
    if (logs.length === 0) return { text: 'Chưa có data', style: 'text-slate-400', isDead: false };
    
    logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const diffHours = (new Date() - new Date(logs[0].created_at)) / (1000 * 60 * 60);

    if (diffHours < 1) return { text: 'Vừa cắn số 🔥', style: 'text-emerald-600 font-semibold', isDead: false };
    if (diffHours < 3) return { text: `${Math.floor(diffHours)}h trước`, style: 'text-amber-500 font-medium', isDead: false };
    return { text: `Đứng im >${Math.floor(diffHours)}h`, style: 'text-red-500 font-semibold', isDead: true };
  };

  const filteredLinks = links.filter(l => 
    l.slug.toLowerCase().includes(search.toLowerCase()) || 
    l.original_url.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (e, slug) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
    showToast(`📋 Đã copy: /${slug}`);
  };

  const handleDelete = async (e, slug) => {
    e.stopPropagation();
    if (!window.confirm(`Xóa vĩnh viễn link /${slug}? Hành động này đéo hoàn tác được.`)) return;
    
    const previousLinks = [...links];
    setLinks(links.filter(l => l.slug !== slug));
    
    try {
      const res = await fetch('/api/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) });
      if (!res.ok) throw new Error('Lỗi Server');
      showToast(`🗑️ Đã xóa /${slug}`);
    } catch (error) {
      setLinks(previousLinks);
      showToast(`❌ Lỗi không xóa được!`);
    }
  };

  // --- THỐNG KÊ DATA ---
  const clickCounts = clickLogs.reduce((acc, log) => { acc[log.slug] = (acc[log.slug] || 0) + 1; return acc; }, {});
  const topLinks = Object.entries(clickCounts)
    .map(([slug, count]) => ({ slug, count, originalUrl: links.find(l => l.slug === slug)?.original_url || 'N/A' }))
    .sort((a, b) => b.count - a.count);

  const processStats = (field) => {
    const counts = clickLogs.reduce((acc, log) => {
      let key = log[field] || 'Unknown';
      if (field === 'referrer') {
        const lower = key.toLowerCase();
        if (lower.includes('facebook')) key = 'Facebook';
        else if (lower.includes('tiktok')) key = 'TikTok';
        else if (lower.includes('threads')) key = 'Threads';
        else if (lower.includes('zalo')) key = 'Zalo';
        else if (key.startsWith('http')) { try { key = new URL(key).hostname; } catch(e){} }
        else key = 'Direct (Trực tiếp)';
      }
      if (field === 'user_agent') {
        const ua = key.toLowerCase();
        if (ua.includes('iphone') || ua.includes('ipad')) key = 'iOS';
        else if (ua.includes('android')) key = 'Android';
        else if (ua.includes('windows')) key = 'Windows';
        else key = 'Khác';
      }
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-100">
      
      {/* TOAST ALERTS */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-xl shadow-2xl text-sm font-semibold z-50 transform transition-all flex items-center gap-2 ${toast.includes('❌') ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`}>
          {toast}
        </div>
      )}

      {/* SIDEBAR TỐI GIẢN */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col z-10 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/20">
            B
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">BINHTIENTI</span>
        </div>
        
        <nav className="flex flex-col gap-2">
          <button onClick={() => setActiveTab('links')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'links' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            Quản lý Phễu
          </button>
          <button onClick={() => setActiveTab('stats')} className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'stats' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            Báo cáo Traffic
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 md:p-12 max-w-7xl mx-auto overflow-y-auto">
        
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-400 font-medium">Đang tải cục data... ⏳</div>
        ) : activeTab === 'links' ? (
          
          /* TAB 1: QUẢN LÝ LINKS */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Chiến dịch Affiliate</h1>
                <p className="text-slate-500 font-medium">Quản lý toàn bộ link rút gọn và kiểm soát sinh tử của phễu mồi.</p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">{links.length}</div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">Tổng Link Active</div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Hệ thống</div>
                  </div>
                </div>
              </div>
            </header>

            {/* BỘ LỌC */}
            <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm mb-8 flex items-center">
              <svg className="w-5 h-5 text-slate-400 ml-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input 
                type="text" 
                placeholder="Tìm mã camp, slug hoặc url gốc..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="w-full bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-400 font-medium px-4 py-3 outline-none"
              />
            </div>

            {/* BẢNG DATA HIỆN ĐẠI (FLAT TABLE) */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Network</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Mã Phễu (Slug)</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Link Gốc & Tín Hiệu</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLinks.length === 0 ? (
                    <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-medium">Không có data mài ơi.</td></tr>
                  ) : (
                    filteredLinks.map((l) => {
                      const net = getNetworkInfo(l.original_url);
                      const lastClick = getLastClickInfo(l.slug);
                      
                      return (
                        <tr key={l.id} className="hover:bg-slate-50 transition-colors group">
                          {/* CỘT 1: NETWORK BADGE */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${net.color}`}>
                              {net.name}
                            </span>
                          </td>

                          {/* CỘT 2: SLUG */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400 font-medium">/</span>
                              <span className="text-slate-900 font-bold text-base tracking-tight">{l.slug}</span>
                            </div>
                          </td>

                          {/* CỘT 3: ORIGINAL URL & STATUS */}
                          <td className="px-6 py-4">
                            <div className="max-w-md">
                              <div className="truncate text-slate-500 text-sm font-medium mb-1" title={l.original_url}>
                                {l.original_url}
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                {lastClick.isDead && (
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                  </span>
                                )}
                                <span className={lastClick.style}>{lastClick.text}</span>
                              </div>
                            </div>
                          </td>

                          {/* CỘT 4: ACTIONS */}
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => handleCopy(e, l.slug)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Copy">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                              </button>
                              <a href={l.original_url} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Mở Link">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                              </a>
                              <button onClick={(e) => handleDelete(e, l.slug)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        ) : (
          
          /* TAB 2: THỐNG KÊ DATA */
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-10">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Báo Cáo Hiệu Suất</h1>
              <p className="text-slate-500 font-medium">Phân tích lượng truy cập thực tế từ các nguồn đổ về.</p>
            </header>

            {/* TỔNG QUAN */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Tổng lượt bấm</div>
                <div className="text-4xl font-black text-slate-900">{clickLogs.length}</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Top 1 Đang Cắn</div>
                <div className="text-2xl font-bold text-blue-600 truncate mb-1">/{topLinks[0]?.slug || 'N/A'}</div>
                <div className="text-sm font-medium text-slate-500">{topLinks[0]?.count || 0} click</div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Tỷ trọng Top 1</div>
                <div className="text-3xl font-bold text-emerald-500">
                  {topLinks.length > 0 ? `${Math.round((topLinks[0].count / clickLogs.length) * 100)}%` : '0%'}
                </div>
                <div className="text-sm font-medium text-slate-500 mt-1">trên tổng traffic</div>
              </div>
            </div>

            {/* CHART DATA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Nguồn Traffic */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span className="text-blue-500">🌐</span> Nguồn Traffic Đổ Về
                </h3>
                <div className="space-y-4">
                  {processStats('referrer').map(([name, count], idx) => {
                    const pct = Math.round((count / clickLogs.length) * 100);
                    return (
                      <div key={name}>
                        <div className="flex justify-between text-sm mb-2 font-medium">
                          <span className="text-slate-700">{name}</span>
                          <span className="text-slate-500">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className={`h-2 rounded-full ${idx === 0 ? 'bg-blue-500' : 'bg-slate-300'}`} style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Thiết bị */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span className="text-indigo-500">📱</span> Nền Tảng Thiết Bị
                </h3>
                <div className="space-y-4">
                  {processStats('user_agent').map(([name, count], idx) => {
                    const pct = Math.round((count / clickLogs.length) * 100);
                    return (
                      <div key={name}>
                        <div className="flex justify-between text-sm mb-2 font-medium">
                          <span className="text-slate-700">{name}</span>
                          <span className="text-slate-500">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className={`h-2 rounded-full ${idx === 0 ? 'bg-indigo-500' : 'bg-slate-300'}`} style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
