'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const getNetworkInfo = (url) => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('dinos.click')) return { name: 'Dinos', color: '#dc2626', bg: '#fef2f2' };
  if (lowerUrl.includes('hl-link')) return { name: 'Hyperlead', color: '#4f46e5', bg: '#eef2ff' };
  if (lowerUrl.includes('accesstrade')) return { name: 'Accesstrade', color: '#d97706', bg: '#fffbeb' };
  if (lowerUrl.includes('masoffer')) return { name: 'MasOffer', color: '#059669', bg: '#ecfdf5' };
  return { name: 'Direct', color: '#475569', bg: '#f8fafc' };
};

export default function PremiumAdmin() {
  const [links, setLinks] = useState([]);
  const [clickLogs, setClickLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [activeTab, setActiveTab] = useState('links');
  const [expandedGroups, setExpandedGroups] = useState({});

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

  const getLastClickInfo = (slug) => {
    const logs = clickLogs.filter(log => log.slug === slug);
    if (logs.length === 0) return { text: 'Chưa nổ số', color: '#94a3b8' };
    logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const diffHours = (new Date() - new Date(logs[0].created_at)) / (1000 * 60 * 60);
    if (diffHours < 1) return { text: 'Vừa cắn số 🔥', color: '#10b981' };
    if (diffHours < 3) return { text: `${Math.floor(diffHours)}h trước`, color: '#f59e0b' };
    return { text: `Đứng im >${Math.floor(diffHours)}h ⚠️`, color: '#ef4444' };
  };

  const filteredLinks = links.filter(l => 
    l.slug.toLowerCase().includes(search.toLowerCase()) || 
    l.original_url.toLowerCase().includes(search.toLowerCase())
  );

  const groupedLinks = filteredLinks.reduce((acc, link) => {
    const netName = getNetworkInfo(link.original_url).name;
    if (!acc[netName]) acc[netName] = [];
    acc[netName].push(link);
    return acc;
  }, {});

  const handleCopy = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
    setToast(`📋 Đã copy /${slug}`);
    setTimeout(() => setToast(''), 2500);
  };

  // --- UI COMPONENTS STYLES ---
  const containerStyle = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    // Font quốc dân: Inter kết hợp font hệ thống chuẩn
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif'
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  };

  return (
    <div style={containerStyle}>
      {toast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: '8px', zIndex: 100, fontWeight: '500', fontSize: '14px' }}>
          {toast}
        </div>
      )}

      {/* SIDEBAR */}
      <aside style={{ width: '240px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', padding: '24px', position: 'sticky', top: 0, height: '100vh', boxSizing: 'border-box' }}>
        <div style={{ fontWeight: '800', fontSize: '20px', marginBottom: '32px', color: '#2563eb', letterSpacing: '-0.5px' }}>BINHTIENTI</div>
        <nav>
          <button onClick={() => setActiveTab('links')} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: activeTab === 'links' ? '#eff6ff' : 'transparent', color: activeTab === 'links' ? '#2563eb' : '#64748b', fontWeight: '600', marginBottom: '8px', textAlign: 'left' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            Quản lý Phễu
          </button>
          <button onClick={() => setActiveTab('stats')} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', background: activeTab === 'stats' ? '#eff6ff' : 'transparent', color: activeTab === 'stats' ? '#2563eb' : '#64748b', fontWeight: '600', textAlign: 'left' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            Báo cáo Traffic
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, padding: '40px', maxWidth: '1100px', boxSizing: 'border-box' }}>
        {loading ? (
          <div style={{ color: '#94a3b8', textAlign: 'center', marginTop: '100px' }}>Đang nạp data...</div>
        ) : activeTab === 'links' ? (
          <div>
            <header style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-1px' }}>Chiến dịch Affiliate</h1>
              <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>Quản lý hệ thống link rút gọn của má.</p>
            </header>

            {/* THANH TÌM KIẾM */}
            <div style={{ ...cardStyle, padding: '8px 16px', marginBottom: '24px', display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input type="text" placeholder="Tìm mã hoặc link gốc..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', border: 'none', padding: '12px', fontSize: '15px', outline: 'none', fontWeight: '500' }} />
            </div>

            {/* DANH SÁCH THEO Ô NỀN TẢNG */}
            {Object.entries(groupedLinks).map(([netName, items]) => (
              <div key={netName} style={{ ...cardStyle, marginBottom: '20px' }}>
                <div style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: '700', fontSize: '14px', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Nền tảng: {netName} ({items.length})
                </div>
                {items.map((l, idx) => {
                  const signal = getLastClickInfo(l.slug);
                  return (
                    <div key={l.id} style={{ padding: '16px 20px', borderBottom: idx === items.length - 1 ? 'none' : '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>/{l.slug}</div>
                        <div style={{ fontSize: '13px', color: '#94a3b8', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.original_url}</div>
                      </div>
                      <div style={{ flex: 1, textAlign: 'center', fontSize: '14px', fontWeight: '600', color: signal.color }}>
                        {signal.text}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleCopy(l.slug)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Copy</button>
                        <a href={l.original_url} target="_blank" rel="noreferrer" style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600', textDecoration: 'none', color: '#000' }}>Mở</a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          /* TAB THỐNG KÊ RÚT GỌN */
          <div>
             <header style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-1px' }}>Hiệu Suất Traffic</h1>
            </header>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <div style={{ ...cardStyle, padding: '20px' }}>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '8px' }}>TỔNG CLICK</div>
                <div style={{ fontSize: '32px', fontWeight: '800' }}>{clickLogs.length}</div>
              </div>
              <div style={{ ...cardStyle, padding: '20px' }}>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '8px' }}>TOP 1 SLUG</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#2563eb' }}>/{topLinks[0]?.slug || 'N/A'}</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
