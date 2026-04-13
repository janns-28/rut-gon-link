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
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'accounts'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState('');
  const [fontLoaded, setFontLoaded] = useState(false);

  // State cho trang Account
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, username: 'admin_binh', role: 'Super Admin', status: 'Active', lastLogin: 'Vừa xong' },
    { id: 2, username: 'nhanvien_01', role: 'Publisher', status: 'Active', lastLogin: '2 giờ trước' }
  ]);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false); // Đóng/Mở section thêm tài khoản

  useEffect(() => {
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
          const uniqueIPs = new Set(linkLogs.map(l => l.ip_address)).size;
          const mobileClicks = linkLogs.filter(l => (l.user_agent||'').toLowerCase().includes('mobile')).length;
          const desktopClicks = count - mobileClicks;
          const conversions = linkLogs.filter(l => l.status === 'approved').length;
          const totalRevenue = linkLogs.filter(l => l.status === 'approved').reduce((sum, l) => sum + (Number(l.payout) || 0), 0);

          return { 
            slug, count, uniqueIPs, mobileClicks, desktopClicks, conversions, revenue: totalRevenue,
            originalUrl: linkData?.original_url || 'N/A', network: netInfo 
          };
        }).sort((a, b) => b.count - a.count).slice(0, 5)
    };
  }, [clickLogs, links]);

  // CSS THEME
  const colors = {
    bgApp: '#0b101e', bgSidebar: '#0f1423', bgCard: '#141b2d', border: '#1f293d',
    textMain: '#f8fafc', textMuted: '#64748b',
    blue: '#3b82f6', blueBg: 'rgba(59, 130, 246, 0.15)',
    purple: '#a855f7', purpleBg: 'rgba(168, 85, 247, 0.15)',
    orange: '#f97316', orangeBg: 'rgba(249, 115, 22, 0.15)',
    green: '#22c55e', greenBg: 'rgba(34, 197, 94, 0.15)',
    red: '#ef4444', yellow: '#eab308'
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
      
      {/* SIDEBAR */}
      <aside style={{ width: '250px', backgroundColor: colors.bgSidebar, borderRight: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', zIndex: 10 }}>
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

          {/* ĐÃ ĐỔI THÀNH NÚT QUẢN LÝ ACCOUNT */}
          <button onClick={() => setActiveTab('accounts')} style={{ width: '100%', padding: '10px 14px', border: 'none', background: activeTab === 'accounts' ? colors.bgCard : 'transparent', color: activeTab === 'accounts' ? colors.blue : colors.textMuted, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s', textAlign: 'left', fontSize: '13px' }}>
             <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg> Quản lý Account
          </button>
        </nav>
      </aside>

      {/* VÙNG MAIN CONTENT */}
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto', position: 'relative' }}>
        
        {/* ==================================================== */}
        {/* VIEW: DASHBOARD (HIỂN THỊ KHI TAB LÀ DASHBOARD)      */}
        {/* ==================================================== */}
        {activeTab === 'dashboard' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <header style={{ marginBottom: '28px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>Dashboard</h1>
              <p style={{ color: colors.textMuted, margin: 0, fontSize: '14px', fontWeight: '500' }}>Overview of your affiliate operations</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '20px' }}>
              <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ color: colors.textMuted, fontSize: '13px', fontWeight: '600' }}>Tổng số Link</span>
                  <div style={{ background: colors.blueBg, padding: '4px', borderRadius: '6px', color: colors.blue }}><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>
                </div>
                <div style={{ fontSize: '26px', fontWeight: '700', marginBottom: '6px', letterSpacing: '-0.5px' }}>{links.length}</div>
                <div style={{ fontSize: '12px', display: 'flex', gap: '8px', fontWeight: '500' }}><span style={{ color: colors.green }}>{links.length > 0 ? links.length : 0} active</span></div>
              </div>

              <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ color: colors.textMuted, fontSize: '13px', fontWeight: '600' }}>Tổng Clicks</span>
                  <div style={{ background: colors.purpleBg, padding: '4px', borderRadius: '6px', color: colors.purple }}><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg></div>
                </div>
                <div style={{ fontSize: '26px', fontWeight: '700', marginBottom: '6px', letterSpacing: '-0.5px' }}>{totalClicks.toLocaleString()}</div>
                <div style={{ fontSize: '12px', display: 'flex', gap: '8px', fontWeight: '500' }}><span style={{ color: colors.green }}>Recorded securely</span></div>
              </div>

              <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ color: colors.textMuted, fontSize: '13px', fontWeight: '600' }}>Nền tảng</span>
                  <div style={{ background: colors.orangeBg, padding: '4px', borderRadius: '6px', color: colors.orange }}><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg></div>
                </div>
                <div style={{ fontSize: '26px', fontWeight: '700', marginBottom: '6px', letterSpacing: '-0.5px' }}>{networkCount}</div>
                <div style={{ fontSize: '12px', display: 'flex', gap: '8px', fontWeight: '500' }}><span style={{ color: colors.blue }}>Networks active</span></div>
              </div>

              <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ color: colors.textMuted, fontSize: '13px', fontWeight: '600' }}>Clicks Today</span>
                  <div style={{ background: colors.greenBg, padding: '4px', borderRadius: '6px', color: colors.green }}><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg></div>
                </div>
                <div style={{ fontSize: '26px', fontWeight: '700', marginBottom: '6px', letterSpacing: '-0.5px' }}>{clicksToday.toLocaleString()}</div>
                <div style={{ fontSize: '12px', color: colors.textMuted, fontWeight: '500' }}>Actions today</div>
              </div>
            </div>

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
                            <span style={{ background: link.network.bg, color: link.network.color, padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '700' }}>{link.network.name}</span>
                            <span style={{ color: colors.textMuted, fontSize: '11px', fontWeight: '500' }}>ID: {link.slug}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: colors.textMuted, fontSize: '12px', fontWeight: '600' }}>
                          <span title="Tổng số lượt Click" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.textMain }}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg> {link.count}</span>
                          <span title="Click từ IP riêng biệt (Unique)" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.purple }}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> {link.uniqueIPs}</span>
                          <span title="Click từ Điện thoại" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.blue }}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg> {link.mobileClicks}</span>
                          <span title="Click từ Máy tính" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.orange }}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg> {link.desktopClicks}</span>
                          <span title="Hoa hồng tạm tính" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.green, background: 'rgba(34, 197, 94, 0.1)', padding: '2px 6px', borderRadius: '4px' }}><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08-.402-2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> {link.conversions > 0 ? formatMoney(link.revenue) : '0đ'}</span>
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
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '30px 0', color: colors.textMuted, fontSize: '13px', fontWeight: '500' }}>No activity yet</div>
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
          </div>
        )}

        {/* ==================================================== */}
        {/* VIEW: ACCOUNTS (HIỂN THỊ KHI BẤM QUẢN LÝ ACCOUNT)    */}
        {/* ==================================================== */}
        {activeTab === 'accounts' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <header style={{ marginBottom: '28px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>Quản lý Account & Hệ thống</h1>
              <p style={{ color: colors.textMuted, margin: 0, fontSize: '14px', fontWeight: '500' }}>Thiết lập bảo mật, phân quyền team và API mạng lưới.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              
              {/* CỘT TRÁI: BẢO MẬT & TELEGRAM */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Đổi Mật Khẩu */}
                <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ background: colors.purpleBg, padding: '8px', borderRadius: '8px', color: colors.purple }}><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg></div>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Đổi mật khẩu Admin</h2>
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); showToast('Đang mô phỏng chức năng đổi pass', false); }}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '13px', color: colors.textMuted, marginBottom: '6px', fontWeight: '600' }}>Mật khẩu hiện tại</label>
                      <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: `1px solid ${colors.border}`, background: colors.bgApp, color: colors.textMain, outline: 'none', fontSize: '14px', fontFamily: 'inherit' }} />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '13px', color: colors.textMuted, marginBottom: '6px', fontWeight: '600' }}>Mật khẩu mới</label>
                      <input type="password" placeholder="Nhập pass mới" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: `1px solid ${colors.border}`, background: colors.bgApp, color: colors.textMain, outline: 'none', fontSize: '14px', fontFamily: 'inherit' }} />
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '12px', background: colors.blue, border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontFamily: 'inherit' }}>Cập nhật Mật khẩu</button>
                  </form>
                </div>

                {/* Cấu hình Telegram (Chỉ UI) */}
                <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ background: colors.blueBg, padding: '8px', borderRadius: '8px', color: colors.blue }}><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg></div>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Cấu hình Bot Telegram</h2>
                  </div>
                  <p style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '16px', lineHeight: '1.5' }}>Hiện tại Token và Chat ID đang được bảo mật trên Vercel Environment. (Tính năng thay đổi thẳng qua UI đang trong giai đoạn dev).</p>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: colors.textMuted, marginBottom: '6px', fontWeight: '600' }}>Telegram Chat ID nhận thông báo</label>
                    <input type="text" disabled placeholder="5476495357" style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: `1px solid ${colors.border}`, background: 'rgba(255,255,255,0.02)', color: colors.textMuted, outline: 'none', fontSize: '14px', fontFamily: 'inherit', cursor: 'not-allowed' }} />
                  </div>
                </div>

              </div>

              {/* CỘT PHẢI: QUẢN LÝ SUB-USERS */}
              <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: colors.orangeBg, padding: '8px', borderRadius: '8px', color: colors.orange }}><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg></div>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', margin: 0 }}>Tài khoản Đội nhóm (Team)</h2>
                  </div>
                  <button onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)} style={{ background: 'transparent', border: `1px solid ${colors.blue}`, color: colors.blue, padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>+ Thêm NV</button>
                </div>

                {/* Form thêm nhân viên (Mặc định ẩn, bấm nút mới xổ ra) */}
                {isAccountMenuOpen && (
                  <div style={{ background: colors.bgApp, padding: '16px', borderRadius: '8px', border: `1px solid ${colors.border}`, marginBottom: '20px', animation: 'fadeIn 0.2s ease-out' }}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                      <input type="text" placeholder="Tên đăng nhập" style={{ flex: 1, padding: '10px', borderRadius: '6px', border: `1px solid ${colors.border}`, background: colors.bgCard, color: colors.textMain, outline: 'none', fontSize: '13px' }} />
                      <select style={{ flex: 1, padding: '10px', borderRadius: '6px', border: `1px solid ${colors.border}`, background: colors.bgCard, color: colors.textMain, outline: 'none', fontSize: '13px' }}>
                        <option value="publisher">Quyền: Publisher (Chỉ lên Link)</option>
                        <option value="admin">Quyền: Admin (Full quyền)</option>
                      </select>
                    </div>
                    <button onClick={() => { setIsAccountMenuOpen(false); showToast('Giả lập lưu nhân viên mới thành công'); }} style={{ width: '100%', padding: '10px', background: colors.blue, border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Tạo tài khoản</button>
                  </div>
                )}

                {/* Danh sách nhân viên */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {teamMembers.map((member) => (
                    <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: `1px solid ${colors.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: colors.bgApp, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: colors.textMuted }}>{member.username.charAt(0).toUpperCase()}</div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: colors.textMain, marginBottom: '4px' }}>@{member.username}</div>
                          <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                            <span style={{ color: member.role === 'Super Admin' ? colors.orange : colors.blue, fontWeight: '600' }}>{member.role}</span>
                            <span style={{ color: colors.textMuted }}>• Đăng nhập: {member.lastLogin}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        {member.role !== 'Super Admin' && (
                          <button style={{ background: 'transparent', border: 'none', color: colors.red, cursor: 'pointer', padding: '4px' }}><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* MODAL TẠO LINK (Giữ nguyên) */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: colors.bgCard, padding: '32px', borderRadius: '16px', border: `1px solid ${colors.border}`, width: '100%', maxWidth: '450px' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: colors.textMain, fontWeight: '700', letterSpacing: '-0.5px' }}>Tạo Phễu Mồi Mới 🚀</h2>
            <form onSubmit={handleAddLink} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: colors.textMuted, fontSize: '13px', fontWeight: '600' }}>Link Đích (Affiliate Link)</label>
                <input type="url" required placeholder="https://dinos.click/..." value={newUrl} onChange={(e) => setNewUrl(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, background: colors.bgApp, color: colors.textMain, outline: 'none', fontSize: '14px', fontFamily: 'inherit' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: colors.textMuted, fontSize: '13px', fontWeight: '600' }}>Đuôi Link (Slug) - Để trống tự Random</label>
                <div style={{ display: 'flex', alignItems: 'center', background: colors.bgApp, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '0 12px' }}>
                  <span style={{ color: colors.textMuted, fontWeight: '500' }}>/</span>
                  <input type="text" placeholder="vay-tien-nhanh" value={customSlug} onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))} style={{ width: '100%', padding: '12px 8px', border: 'none', background: 'transparent', color: colors.textMain, outline: 'none', fontSize: '14px', fontFamily: 'inherit' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: `1px solid ${colors.border}`, color: colors.textMuted, borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontFamily: 'inherit' }}>Hủy</button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '12px', background: isSubmitting ? 'rgba(59, 130, 246, 0.5)' : colors.blue, border: 'none', color: '#fff', borderRadius: '8px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: '600', fontFamily: 'inherit' }}>{isSubmitting ? 'Đang tạo...' : 'Tạo Link'}</button>
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
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}
