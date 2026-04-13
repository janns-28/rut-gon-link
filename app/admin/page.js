'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

// Tối ưu hóa nhận diện các network phổ biến
const getNetworkInfo = (url) => {
  const lowerUrl = url?.toLowerCase() || '';
  if (lowerUrl.includes('dinos.click')) return { name: 'Dinos', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
  if (lowerUrl.includes('hl-link')) return { name: 'Hyperlead', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' };
  if (lowerUrl.includes('accesstrade')) return { name: 'Accesstrade', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
  if (lowerUrl.includes('masoffer')) return { name: 'MasOffer', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' };
  return { name: 'Direct (Khác)', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)' };
};

export default function DeepBlueDashboard() {
  const [links, setLinks] = useState([]);
  const [clickLogs, setClickLogs] = useState([]);
  const [totalClicks, setTotalClicks] = useState(0); 
  const [clicksToday, setClicksToday] = useState(0);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    // Kéo Font Plus Jakarta Sans
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    setFontLoaded(true);

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
        supabase.from('click_logs').select('*').gte('created_at', thirtyDaysAgo.toISOString()).order('created_at', { ascending: false }).limit(300)
      ]);

      if (linksRes.data) setLinks(linksRes.data);
      if (logsRes.data) {
        setClickLogs(logsRes.data);
        
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const todayClicks = logsRes.data.filter(log => new Date(log.created_at) >= startOfToday).length;
        setClicksToday(todayClicks);
      }
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
        setClicksToday(prev => prev + 1);
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
      setIsModalOpen(false); setNewUrl(''); setCustomSlug('');
    } catch (error) {
      showToast('❌ Lỗi: Slug này có thể đã tồn tại!', true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // XỬ LÝ CHỈ SỐ THẬT (REAL METRICS) CHO AFFILIATE
  // ==========================================
  const { topLinks, networkCount } = useMemo(() => {
    const counts = {}; 
    const networks = new Set();
    
    links.forEach(l => {
        networks.add(getNetworkInfo(l.original_url).name);
    });

    clickLogs.forEach(log => {
      counts[log.slug] = (counts[log.slug] || 0) + 1;
    });

    return {
      networkCount: networks.size,
      topLinks: Object.entries(counts).map(([slug, count]) => {
          const linkData = links.find(l => l.slug === slug);
          const netInfo = linkData ? getNetworkInfo(linkData.original_url) : { name: 'Unknown', color: '#94a3b8' };
          
          const linkLogs = clickLogs.filter(log => log.slug === slug);
          
          // 1. Tính Unique IP (Click thật)
          const uniqueIPs = new Set(linkLogs.map(l => l.ip_address)).size;
          
          // 2. Tính Thiết bị
          const mobileClicks = linkLogs.filter(l => (l.user_agent||'').toLowerCase().includes('mobile')).length;
          const desktopClicks = count - mobileClicks;

          // 3. Tính Đơn hàng & Hoa hồng từ Postback (status = 'approved')
          const conversions = linkLogs.filter(l => l.status === 'approved').length;
          const totalRevenue = linkLogs.filter(l => l.status === 'approved').reduce((sum, l) => sum + (Number(l.payout) || 0), 0);

          return { 
            slug, 
            count, 
            uniqueIPs,
            mobileClicks, 
            desktopClicks, 
            conversions,
            revenue: totalRevenue,
            originalUrl: linkData?.original_url || 'N/A', 
            network: netInfo 
          };
        }).sort((a, b) => b.count - a.count).slice(0, 5)
    };
  }, [clickLogs, links]);

  // CSS THEME AFFITHREADS
  const colors = {
    bgApp: '#0b101e', 
    bgSidebar: '#0f1423',
    bgCard: '#141b2d', 
    border: '#1f293d',
    textMain: '#f8fafc',
    textMuted: '#64748b',
    blue: '#3b82f6', blueBg: 'rgba(59, 130, 246, 0.15)',
    purple: '#a855f7', purpleBg: 'rgba(168, 85, 247, 0.15)',
    orange: '#f97316', orangeBg: 'rgba(249, 115, 22, 0.15)',
    green: '#22c55e', greenBg: 'rgba(34, 197, 94, 0.15)',
    red: '#ef4444',
    yellow: '#eab308'
  };

  const formatMoney = (amount) => {
    if (amount === 0) return '0đ';
    if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'M';
    if (amount >= 1000) return (amount / 1000).toFixed(0) + 'K';
    return amount.toString();
  };

  if (!fontLoaded) return <div style={{ backgroundColor: colors.bgApp, height: '100vh' }}></div>;

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: colors.bgApp, color: colors.textMain, fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', overflow: 'hidden' }}>
      
      {/* SIDEBAR TRÁI */}
      <aside style={{ width: '250px', backgroundColor: colors.bgSidebar, borderRight: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '30px', height: '30px', background: colors.blue, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
          </div>
          <span style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '0.5px' }}>BINHTIENTI</span>
        </div>

        <nav style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button onClick={() => setActiveTab('dashboard')} style={{ width: '100%', padding: '10px 14px', border: 'none', background: activeTab === 'dashboard' ? colors.bgCard : 'transparent', color: activeTab === 'dashboard' ? colors.blue : colors.textMuted, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s', textAlign: 'left', fontSize: '13px' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg> Dashboard
          </button>
          
          <button onClick={() => setIsModalOpen(true)} style={{ width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', color: colors.textMuted, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s', textAlign: 'left', fontSize: '13px' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg> Tạo Link Phễu
          </button>

          <button style={{ width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', color: colors.textMuted, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s', textAlign: 'left', fontSize: '13px' }}>
             <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Activity Log
          </button>
        </nav>
      </aside>

      {/* VÙNG MAIN CONTENT */}
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        
        <header style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>Dashboard</h1>
          <p style={{ color: colors.textMuted, margin: 0, fontSize: '14px', fontWeight: '500' }}>Overview of your affiliate operations</p>
        </header>

        {/* 4 CARDS (ĐÃ ÉP NHỎ LẠI) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '20px' }}>
          
          <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: colors.textMuted, fontSize: '13px', fontWeight: '600' }}>Tổng số Link</span>
              <div style={{ background: colors.blueBg, padding: '4px', borderRadius: '6px', color: colors.blue }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '700', marginBottom: '6px', letterSpacing: '-0.5px' }}>{links.length}</div>
            <div style={{ fontSize: '12px', display: 'flex', gap: '8px', fontWeight: '500' }}>
              <span style={{ color: colors.green }}>{links.length > 0 ? links.length : 0} active</span>
            </div>
          </div>

          <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: colors.textMuted, fontSize: '13px', fontWeight: '600' }}>Tổng Clicks</span>
              <div style={{ background: colors.purpleBg, padding: '4px', borderRadius: '6px', color: colors.purple }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '700', marginBottom: '6px', letterSpacing: '-0.5px' }}>{totalClicks.toLocaleString()}</div>
            <div style={{ fontSize: '12px', display: 'flex', gap: '8px', fontWeight: '500' }}>
              <span style={{ color: colors.green }}>Recorded securely</span>
            </div>
          </div>

          <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: colors.textMuted, fontSize: '13px', fontWeight: '600' }}>Nền tảng</span>
              <div style={{ background: colors.orangeBg, padding: '4px', borderRadius: '6px', color: colors.orange }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '700', marginBottom: '6px', letterSpacing: '-0.5px' }}>{networkCount}</div>
            <div style={{ fontSize: '12px', display: 'flex', gap: '8px', fontWeight: '500' }}>
              <span style={{ color: colors.blue }}>Networks active</span>
            </div>
          </div>

          <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ color: colors.textMuted, fontSize: '13px', fontWeight: '600' }}>Clicks Today</span>
              <div style={{ background: colors.greenBg, padding: '4px', borderRadius: '6px', color: colors.green }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              </div>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '700', marginBottom: '6px', letterSpacing: '-0.5px' }}>{clicksToday.toLocaleString()}</div>
            <div style={{ fontSize: '12px', color: colors.textMuted, fontWeight: '500' }}>
              Actions today
            </div>
          </div>

        </div>

        {/* 2 PANELS Ở DƯỚI */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
          
          <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${colors.border}` }}>
              <span style={{ fontWeight: '700', fontSize: '14px' }}>Top Phễu Hiệu Quả (Real Metrics)</span>
              <span style={{ color: colors.blue, fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>View all →</span>
            </div>
            
            <div style={{ padding: '0 20px', flex: 1 }}>
              {topLinks.length === 0 ? (
                <div style={{ color: colors.textMuted, fontSize: '13px', textAlign: 'center', padding: '30px 0', fontWeight: '500' }}>Chưa có data chiến dịch</div>
              ) : (
                topLinks.map((link, idx) => (
                  <div key={link.slug} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: idx === topLinks.length - 1 ? 'none' : `1px solid ${colors.border}` }}>
                    
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>/{link.slug}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: link.network.bg, color: link.network.color, padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' }}>
                          {link.network.name}
                        </span>
                        <span style={{ color: colors.textMuted, fontSize: '11px', fontWeight: '500' }}>ID: {link.slug}</span>
                      </div>
                    </div>

                    {/* VÙNG CHỨA CÁC CHỈ SỐ AFFILIATE CHUẨN */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: colors.textMuted, fontSize: '12px', fontWeight: '600' }}>
                      
                      {/* Tổng Clicks */}
                      <span title="Tổng số lượt Click" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.textMain }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg> 
                        {link.count}
                      </span>
                      
                      {/* Unique IP */}
                      <span title="Click từ IP riêng biệt (Unique)" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.purple }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        {link.uniqueIPs}
                      </span>
                      
                      {/* Mobile */}
                      <span title="Click từ Điện thoại" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.blue }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                        {link.mobileClicks}
                      </span>
                      
                      {/* Desktop */}
                      <span title="Click từ Máy tính" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.orange }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        {link.desktopClicks}
                      </span>
                      
                      {/* Chuyển đổi / Tiền (Từ Postback) */}
                      <span title="Hoa hồng tạm tính" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.green, background: 'rgba(34, 197, 94, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08-.402-2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {link.conversions > 0 ? formatMoney(link.revenue) : '0đ'}
                      </span>

                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${colors.border}` }}>
              <span style={{ fontWeight: '700', fontSize: '14px' }}>Mắt Thần Radar</span>
              <span style={{ color: colors.blue, fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>Live</span>
            </div>

            <div style={{ padding: '0 20px', flex: 1 }}>
              {clickLogs.length === 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '30px 0', color: colors.textMuted, fontSize: '13px', fontWeight: '500' }}>
                  No activity yet
                </div>
              ) : (
                clickLogs.slice(0, 7).map((log, i) => {
                  let source = log.referrer || 'Direct';
                  if (source.includes('facebook')) source = 'Facebook';
                  else if (source.includes('tiktok')) source = 'TikTok';
                  else if (source.includes('zalo')) source = 'Zalo';

                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i === 6 ? 'none' : `1px solid ${colors.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: log.status === 'approved' ? colors.yellow : colors.green, boxShadow: `0 0 6px ${log.status === 'approved' ? colors.yellow : colors.green}` }}></div>
                        <span style={{ fontSize: '13px', color: colors.textMain, fontWeight: '600' }}>/{log.slug}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: colors.textMuted, fontWeight: '500' }}>
                        <span style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{source}</span>
                        <span style={{ width: '40px', textAlign: 'right' }}>{new Date(log.created_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

        </div>
      </main>

      {/* MODAL TẠO LINK */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: colors.bgCard, padding: '32px', borderRadius: '16px', border: `1px solid ${colors.border}`, width: '100%', maxWidth: '450px' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: colors.textMain, fontWeight: '700', letterSpacing: '-0.5px' }}>Tạo Phễu Mồi Mới 🚀</h2>
            <form onSubmit={handleAddLink} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: colors.textMuted, fontSize: '13px', fontWeight: '600' }}>Link Đích (Affiliate Link)</label>
                <input 
                  type="url" required placeholder="https://dinos.click/..." value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, background: colors.bgApp, color: colors.textMain, outline: 'none', fontSize: '14px', fontFamily: 'inherit' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: colors.textMuted, fontSize: '13px', fontWeight: '600' }}>Đuôi Link (Slug) - Để trống tự Random</label>
                <div style={{ display: 'flex', alignItems: 'center', background: colors.bgApp, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '0 12px' }}>
                  <span style={{ color: colors.textMuted, fontWeight: '500' }}>/</span>
                  <input 
                    type="text" placeholder="vay-tien-nhanh" value={customSlug} onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                    style={{ width: '100%', padding: '12px 8px', border: 'none', background: 'transparent', color: colors.textMain, outline: 'none', fontSize: '14px', fontFamily: 'inherit' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: `1px solid ${colors.border}`, color: colors.textMuted, borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontFamily: 'inherit' }}>Hủy</button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '12px', background: isSubmitting ? 'rgba(59, 130, 246, 0.5)' : colors.blue, border: 'none', color: '#fff', borderRadius: '8px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: '600', fontFamily: 'inherit' }}>
                  {isSubmitting ? 'Đang tạo...' : 'Tạo Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST THÔNG BÁO */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: toast.isError ? colors.red : colors.green, color: '#fff', padding: '12px 24px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', zIndex: 60, fontWeight: '600', fontFamily: 'inherit' }}>
          {toast.text}
        </div>
      )}
    </div>
  );
}
