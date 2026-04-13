'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

// Nhận diện Network để tô màu Badge
const getNetworkInfo = (url) => {
  const lowerUrl = url?.toLowerCase() || '';
  if (lowerUrl.includes('dinos.click')) return { name: 'Dinos', color: '#f59e0b', bg: '#f59e0b' }; // Vàng
  if (lowerUrl.includes('hl-link')) return { name: 'Hyperlead', color: '#3b82f6', bg: '#3b82f6' }; // Xanh dương
  if (lowerUrl.includes('accesstrade')) return { name: 'Accesstrade', color: '#10b981', bg: '#10b981' }; // Xanh lá
  if (lowerUrl.includes('masoffer')) return { name: 'MasOffer', color: '#8b5cf6', bg: '#8b5cf6' }; // Tím
  return { name: 'Test', color: '#eab308', bg: '#eab308' }; // Trùng màu chữ Test trong ảnh
};

export default function DeepBlueDashboard() {
  const [links, setLinks] = useState([]);
  const [clickLogs, setClickLogs] = useState([]);
  const [totalClicks, setTotalClicks] = useState(0); 
  const [clicksToday, setClicksToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [fontLoaded, setFontLoaded] = useState(false);

  // States khác (ẩn bớt để code gọn, chỉ tập trung UI Dashboard)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    // Dùng font Inter y hệt ảnh gốc
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    setFontLoaded(true);

    fetchData();
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
        supabase.from('click_logs').select('*').gte('created_at', thirtyDaysAgo.toISOString()).order('created_at', { ascending: false }).limit(300)
      ]);

      if (linksRes.data) setLinks(linksRes.data);
      if (logsRes.data) {
        setClickLogs(logsRes.data);
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        setClicksToday(logsRes.data.filter(log => new Date(log.created_at) >= startOfToday).length);
      }
    } catch (error) {
      // Bỏ qua lỗi hiển thị
    } finally {
      setLoading(false);
    }
  }

  const { processedLinks, networkCount } = useMemo(() => {
    const networks = new Set();
    let result = links.map(link => {
        networks.add(getNetworkInfo(link.original_url).name);
        const linkLogs = clickLogs.filter(log => log.slug === link.slug);
        const count = linkLogs.length;
        const uniqueIPs = new Set(linkLogs.map(l => l.ip_address)).size;
        const mobileClicks = linkLogs.filter(l => (l.user_agent||'').toLowerCase().includes('mobile')).length;
        const desktopClicks = count - mobileClicks;
        const conversions = linkLogs.filter(l => l.status === 'approved').length;
        const netInfo = getNetworkInfo(link.original_url);

        return { ...link, count, uniqueIPs, mobileClicks, desktopClicks, conversions, network: netInfo };
    });
    result.sort((a, b) => b.count !== a.count ? b.count - a.count : new Date(b.created_at) - new Date(a.created_at));
    return { networkCount: networks.size, processedLinks: result };
  }, [clickLogs, links]);

  // BẢNG MÀU CHUẨN AFFITHREADS (Clone từ ảnh gốc)
  const c = {
    bgMain: '#0f1422',      // Nền tổng
    bgSidebar: '#0a0d17',   // Nền menu trái
    bgCard: '#151b2b',      // Nền các cục panel
    border: '#1e2536',      // Viền panel
    textH: '#ffffff',       // Tiêu đề trắng to
    textM: '#94a3b8',       // Chữ mờ
    textS: '#64748b',       // Chữ cực mờ
    active: '#1e293b',      // Nút menu đang chọn
    
    blue: '#3b82f6', blueBg: 'rgba(59, 130, 246, 0.1)',
    purple: '#a855f7', purpleBg: 'rgba(168, 85, 247, 0.1)',
    orange: '#f97316', orangeBg: 'rgba(249, 115, 22, 0.1)',
    green: '#10b981', greenBg: 'rgba(16, 185, 129, 0.1)',
    red: '#ef4444',
    yellow: '#eab308'
  };

  const formatNum = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  if (!fontLoaded) return <div style={{ backgroundColor: c.bgMain, height: '100vh' }}></div>;

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: c.bgMain, color: c.textH, fontFamily: '"Inter", sans-serif', overflow: 'hidden' }}>
      
      {/* ========================================== */}
      {/* SIDEBAR (MENU TRÁI - ĐÃ ĐỔI ICON CHO GIỐNG) */}
      {/* ========================================== */}
      <aside style={{ width: '240px', backgroundColor: c.bgSidebar, borderRight: `1px solid ${c.border}`, display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '28px', height: '28px', background: c.blue, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
          </div>
          <span style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '0px' }}>BINHTIENTI</span>
        </div>

        <nav style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button style={{ width: '100%', padding: '10px 12px', border: 'none', background: activeTab === 'dashboard' ? c.active : 'transparent', color: activeTab === 'dashboard' ? c.blue : c.textM, borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg> Dashboard
          </button>
          <button style={{ width: '100%', padding: '10px 12px', border: 'none', background: 'transparent', color: c.textM, borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg> Tạo Link Phễu
          </button>
          <button style={{ width: '100%', padding: '10px 12px', border: 'none', background: 'transparent', color: c.textM, borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg> Tài Khoản MXH
          </button>
          <button style={{ width: '100%', padding: '10px 12px', border: 'none', background: 'transparent', color: c.textM, borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg> Cấu hình Server
          </button>
          <button style={{ width: '100%', padding: '10px 12px', border: 'none', background: 'transparent', color: c.textM, borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: '500', fontSize: '13px' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> Activity Log
          </button>
        </nav>
      </aside>

      {/* ========================================== */}
      {/* VÙNG MAIN CONTENT                          */}
      {/* ========================================== */}
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        
        <header style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 4px 0' }}>Dashboard</h1>
          <p style={{ color: c.textM, margin: 0, fontSize: '13px' }}>Overview of your seeding operations</p>
        </header>

        {/* 4 CARDS (CLONE Y HỆT ẢNH) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          
          <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: '10px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span style={{ color: c.textM, fontSize: '13px' }}>Accounts</span>
              <div style={{ background: c.blueBg, padding: '4px', borderRadius: '4px', color: c.blue }}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>{links.length}</div>
            <div style={{ fontSize: '11px', display: 'flex', gap: '8px' }}>
              <span style={{ color: c.green }}>{links.length} active</span>
              <span style={{ color: c.red }}>0 suspended</span>
            </div>
          </div>

          <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: '10px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span style={{ color: c.textM, fontSize: '13px' }}>Proxies</span>
              <div style={{ background: c.purpleBg, padding: '4px', borderRadius: '4px', color: c.purple }}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg></div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>{totalClicks}</div>
            <div style={{ fontSize: '11px', display: 'flex', gap: '8px' }}>
              <span style={{ color: c.green }}>{totalClicks} ok</span>
              <span style={{ color: c.red }}>0 bad</span>
            </div>
          </div>

          <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: '10px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span style={{ color: c.textM, fontSize: '13px' }}>Campaigns</span>
              <div style={{ background: c.orangeBg, padding: '4px', borderRadius: '4px', color: c.orange }}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg></div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>{networkCount}</div>
            <div style={{ fontSize: '11px', display: 'flex', gap: '8px' }}>
              <span style={{ color: c.blue }}>0 running</span>
              <span style={{ color: c.green }}>{networkCount} done</span>
            </div>
          </div>

          <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: '10px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span style={{ color: c.textM, fontSize: '13px' }}>Seeds Today</span>
              <div style={{ background: c.greenBg, padding: '4px', borderRadius: '4px', color: c.green }}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg></div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>{clicksToday}</div>
            <div style={{ fontSize: '11px', color: c.textM }}>successful actions</div>
          </div>
        </div>

        {/* 2 PANELS Ở DƯỚI */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '16px' }}>
          
          {/* PANEL TRÁI: DANH SÁCH CHIẾN DỊCH (CLONE Y HỆT ẢNH) */}
          <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: '10px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${c.border}` }}>
              <span style={{ fontWeight: '600', fontSize: '14px' }}>Recent Campaigns</span>
              <span style={{ color: c.blue, fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}>View all →</span>
            </div>
            
            <div style={{ padding: '8px 16px', flex: 1, maxHeight: '400px', overflowY: 'auto' }}>
              {processedLinks.length === 0 ? (
                <div style={{ color: c.textM, fontSize: '13px', textAlign: 'center', padding: '30px 0' }}>No campaigns yet</div>
              ) : (
                processedLinks.map((link, idx) => (
                  <div key={link.slug} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: idx === processedLinks.length - 1 ? 'none' : `1px solid ${c.border}` }}>
                    
                    {/* CỘT TRÁI: Tên và Badge */}
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>{link.slug}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: link.network.bg, color: '#000', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' }}>{link.network.name}</span>
                        <span style={{ color: c.textS, fontSize: '11px' }}>0/1 done</span>
                      </div>
                    </div>

                    {/* CỘT PHẢI: DÀN ICON Y HỆT ẢNH GỐC */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', fontWeight: '500' }}>
                      {/* Icon Mắt - Total Click */}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: c.purple }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> 
                        {formatNum(link.count)}
                      </span>
                      
                      {/* Icon Tim - Unique IP */}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: c.red }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        {formatNum(link.uniqueIPs)}
                      </span>
                      
                      {/* Icon Comment - Mobile Click */}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: c.blue }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        {formatNum(link.mobileClicks)}
                      </span>
                      
                      {/* Icon Retweet - Desktop Click */}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: c.green }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                        {formatNum(link.desktopClicks)}
                      </span>
                      
                      {/* Icon Play/Action - Lượt chuyển đổi */}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: c.yellow }}>
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M3 21v-2l5-5h4l5 5v2H3zm12-11l3-3-3-3v2h-4V4H9v2H5v2h4v2h2v-2h4v2z"></path></svg>
                        {link.conversions}
                      </span>
                      
                      {/* Badge Completed */}
                      <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', color: c.textM, marginLeft: '8px' }}>
                        completed
                      </span>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>

          {/* PANEL PHẢI: RECENT ACTIVITY */}
          <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: '10px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${c.border}` }}>
              <span style={{ fontWeight: '600', fontSize: '14px' }}>Recent Activity</span>
              <span style={{ color: c.blue, fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}>View all →</span>
            </div>
            <div style={{ padding: '8px 16px', flex: 1, maxHeight: '400px', overflowY: 'auto' }}>
              {clickLogs.length === 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: c.textS, fontSize: '13px' }}>No activity yet</div>
              ) : (
                clickLogs.slice(0, 8).map((log, i) => {
                  let source = log.referrer || 'Direct';
                  if (source.includes('facebook')) source = 'Facebook';
                  else if (source.includes('tiktok')) source = 'TikTok';

                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i === 7 ? 'none' : `1px solid ${c.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.green }}></div>
                        <span style={{ fontSize: '13px', color: c.textH, fontWeight: '500' }}>/{log.slug}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: c.textS }}>
                        <span>{source}</span>
                        <span style={{ width: '35px', textAlign: 'right' }}>{new Date(log.created_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
