'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const getNetworkInfo = (url) => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('dinos.click')) return { name: 'Dinos', color: '#ef4444' };
  if (lowerUrl.includes('hl-link')) return { name: 'Hyperlead', color: '#6366f1' };
  if (lowerUrl.includes('accesstrade')) return { name: 'Accesstrade', color: '#f59e0b' };
  if (lowerUrl.includes('masoffer')) return { name: 'MasOffer', color: '#10b981' };
  return { name: 'Direct', color: '#94a3b8' };
};

export default function PremiumAdmin() {
  const [links, setLinks] = useState([]);
  const [clickLogs, setClickLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [activeTab, setActiveTab] = useState('links');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [linksRes, logsRes] = await Promise.all([
      supabase.from('links').select('*').order('created_at', { ascending: false }),
      supabase.from('click_logs').select('*').order('created_at', { ascending: false })
    ]);
    if (linksRes.data) setLinks(linksRes.data);
    if (logsRes.data) setClickLogs(logsRes.data);
    setLoading(false);
  }

  // --- LOGIC MỚI: BẬT/TẮT LINK ---
  const toggleStatus = async (slug, currentStatus) => {
    const { error } = await supabase
      .from('links')
      .update({ is_active: !currentStatus })
      .eq('slug', slug);

    if (!error) {
      setLinks(links.map(l => l.slug === slug ? { ...l, is_active: !currentStatus } : l));
      setToast(`${!currentStatus ? '✅ Đã kích hoạt' : '⏸️ Đã tạm dừng'} /${slug}`);
      setTimeout(() => setToast(''), 2000);
    }
  };

  // --- TÍNH TOÁN LAST CLICK (CẢNH BÁO DIE LINK) ---
  const getLastClick = (slug) => {
    const lastLog = clickLogs.find(log => log.slug === slug);
    if (!lastLog) return null;
    const diff = (new Date() - new Date(lastLog.created_at)) / (1000 * 60 * 60); // Tính theo giờ
    return { time: new Date(lastLog.created_at), hoursAgo: diff };
  };

  const filteredLinks = links.filter(l => 
    l.slug.toLowerCase().includes(search.toLowerCase()) || 
    l.original_url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#09090b', color: '#fafafa', fontFamily: 'sans-serif' }}>
      {toast && <div style={{ position: 'fixed', top: '20px', right: '20px', background: '#27272a', border: '1px solid #3f3f46', padding: '12px 20px', borderRadius: '8px', zIndex: 100 }}>{toast}</div>}

      {/* SIDEBAR TỐI GIẢN */}
      <aside style={{ width: '240px', borderRight: '1px solid #27272a', padding: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '30px', background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>BINHTIENTI ADS</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button onClick={() => setActiveTab('links')} style={{ textAlign: 'left', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: activeTab === 'links' ? '#27272a' : 'transparent', color: '#fff' }}>🔗 Quản lý Links</button>
          <button onClick={() => setActiveTab('stats')} style={{ textAlign: 'left', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: activeTab === 'stats' ? '#27272a' : 'transparent', color: '#fff' }}>📊 Thống kê Realtime</button>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: '40px' }}>
        {activeTab === 'links' ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
              <input 
                placeholder="Tìm mã camp..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                style={{ background: '#18181b', border: '1px solid #27272a', padding: '10px 15px', borderRadius: '8px', color: '#fff', width: '300px' }}
              />
              <div style={{ color: '#71717a' }}>Đang chạy: <b>{links.filter(l => l.is_active).length}</b> | Tạm dừng: <b>{links.filter(l => !l.is_active).length}</b></div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ color: '#71717a', borderBottom: '1px solid #27272a', textAlign: 'left' }}>
                    <th style={{ padding: '15px' }}>Trạng thái</th>
                    <th style={{ padding: '15px' }}>Mã (Slug)</th>
                    <th style={{ padding: '15px' }}>Lần cuối có khách</th>
                    <th style={{ padding: '15px' }}>Network</th>
                    <th style={{ padding: '15px' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLinks.map(l => {
                    const lastClick = getLastClick(l.slug);
                    const isCold = lastClick && lastClick.hoursAgo > 5; // Quá 5 tiếng ko có click là "nguội"
                    const net = getNetworkInfo(l.original_url);

                    return (
                      <tr key={l.id} style={{ borderBottom: '1px solid #18181b', opacity: l.is_active ? 1 : 0.5 }}>
                        <td style={{ padding: '15px' }}>
                          <input 
                            type="checkbox" 
                            checked={l.is_active} 
                            onChange={() => toggleStatus(l.slug, l.is_active)}
                            style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                          />
                        </td>
                        <td style={{ padding: '15px' }}>
                           <span style={{ fontWeight: 'bold' }}>/{l.slug}</span>
                        </td>
                        <td style={{ padding: '15px' }}>
                          {lastClick ? (
                            <span style={{ color: isCold ? '#ef4444' : '#10b981', fontSize: '0.9rem' }}>
                              {isCold ? '⚠️ ' : '🔥 '}
                              {lastClick.time.toLocaleTimeString('vi-VN')} ({Math.floor(lastClick.hoursAgo)}h trước)
                            </span>
                          ) : 'Chưa có click'}
                        </td>
                        <td style={{ padding: '15px' }}>
                          <span style={{ background: `${net.color}22`, color: net.color, padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {net.name}
                          </span>
                        </td>
                        <td style={{ padding: '15px' }}>
                          <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/${l.slug}`)} style={{ background: 'none', border: '1px solid #3f3f46', color: '#fff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>Copy</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* PHẦN THỐNG KÊ GIỮ NGUYÊN HOẶC NÂNG CẤP THÊM BIỂU ĐỒ */
          <div style={{ color: '#71717a' }}>Tab thống kê đang được tối ưu dữ liệu realtime...</div>
        )}
      </main>
    </div>
  );
}
