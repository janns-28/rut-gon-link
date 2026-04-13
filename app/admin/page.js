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

  useEffect(() => {
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
        
        // Tính click hôm nay
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
          
          // Phân tích clickLogs của link này để lấy fake data cho giống hình
          const linkLogs = clickLogs.filter(log => log.slug === slug);
          const mobileClicks = linkLogs.filter(l => (l.user_agent||'').toLowerCase().includes('mobile')).length;
          const desktopClicks = count - mobileClicks;

          return { slug, count, mobileClicks, desktopClicks, originalUrl: linkData?.original_url || 'N/A', network: netInfo };
        }).sort((a, b) => b.count - a.count).slice(0, 5) // Lấy top 5 thôi
    };
  }, [clickLogs, links]);

  // CSS THEME AFFITHREADS
  const colors = {
    bgApp: '#0b101e', // Nền xanh đen sâu
    bgSidebar: '#0f1423',
    bgCard: '#141b2d', // Màu thẻ sáng hơn nền chút
    border: '#1f293d',
    textMain: '#f8fafc',
    textMuted: '#64748b',
    // Accent colors
    blue: '#3b82f6', blueBg: 'rgba(59, 130, 246, 0.15)',
    purple: '#a855f7', purpleBg: 'rgba(168, 85, 247, 0.15)',
    orange: '#f97316', orangeBg: 'rgba(249, 115, 22, 0.15)',
    green: '#22c55e', greenBg: 'rgba(34, 197, 94, 0.15)',
    red: '#ef4444'
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: colors.bgApp, color: colors.textMain, fontFamily: '"Inter", sans-serif', overflow: 'hidden' }}>
      
      {/* ======================================= */}
      {/* SIDEBAR TRÁI */}
      {/* ======================================= */}
      <aside style={{ width: '250px', backgroundColor: colors.bgSidebar, borderRight: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Logo con bọ (Tương tự hình) */}
          <div style={{ width: '30px', height: '30px', background: colors.blue, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
          </div>
          <span style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '0.5px' }}>BINHTIENTI</span>
        </div>

        <nav style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button onClick={() => setActiveTab('dashboard')} style={{ width: '100%', padding: '10px 14px', border: 'none', background: activeTab === 'dashboard' ? colors.bgCard : 'transparent', color: activeTab === 'dashboard' ? colors.blue : colors.textMuted, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s', textAlign: 'left', fontSize: '14px' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg> Dashboard
          </button>
          
          <button onClick={() => setIsModalOpen(true)} style={{ width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', color: colors.textMuted, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s', textAlign: 'left', fontSize: '14px' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg> Tạo Link Phễu
          </button>

          <button style={{ width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', color: colors.textMuted, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s', textAlign: 'left', fontSize: '14px' }}>
             <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Activity Log
          </button>
        </nav>
      </aside>

      {/* ======================================= */}
      {/* VÙNG MAIN CONTENT */}
      {/* ======================================= */}
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        
        {/* Header */}
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>Dashboard</h1>
          <p style={{ color: colors.textMuted, margin: 0, fontSize: '14px' }}>Overview of your affiliate operations</p>
        </header>

        {/* 4 CARDS Y CHANG ẢNH */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
          
          {/* Card 1: Accounts -> Tổng Link */}
          <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <span style={{ color: colors.textMuted, fontSize: '14px', fontWeight: '500' }}>Tổng số Link</span>
              <div style={{ background: colors.blueBg, padding: '6px', borderRadius: '6px', color: colors.blue }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>{links.length}</div>
            <div style={{ fontSize: '12px', display: 'flex', gap: '8px' }}>
              <span style={{ color: colors.green }}>{links.length > 0 ? links.length : 0} active</span>
              <span style={{ color: colors.red }}>0 suspended</span>
            </div>
          </div>

          {/* Card 2: Proxies -> Tổng Clicks */}
          <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <span style={{ color: colors.textMuted, fontSize: '14px', fontWeight: '500' }}>Tổng Clicks</span>
              <div style={{ background: colors.purpleBg, padding: '6px', borderRadius: '6px', color: colors.purple }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>{totalClicks.toLocaleString()}</div>
            <div style={{ fontSize: '12px', display: 'flex', gap: '8px' }}>
              <span style={{ color: colors.green }}>{totalClicks} ok</span>
              <span style={{ color: colors.red }}>0 bad</span>
            </div>
          </div>

          {/* Card 3: Campaigns -> Nền tảng (Networks) */}
          <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <span style={{ color: colors.textMuted, fontSize: '14px', fontWeight: '500' }}>Nền tảng</span>
              <div style={{ background: colors.orangeBg, padding: '6px', borderRadius: '6px', color: colors.orange }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>{networkCount}</div>
            <div style={{ fontSize: '12px', display: 'flex', gap: '8px' }}>
              <span style={{ color: colors.blue }}>{networkCount} running</span>
              <span style={{ color: colors.green }}>0 done</span>
            </div>
          </div>

          {/* Card 4: Seeds Today -> Clicks Hôm Nay */}
          <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <span style={{ color: colors.textMuted, fontSize: '14px', fontWeight: '500' }}>Clicks Today</span>
              <div style={{ background: colors.greenBg, padding: '6px', borderRadius: '6px', color: colors.green }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px' }}>{clicksToday.toLocaleString()}</div>
            <div style={{ fontSize: '12px', color: colors.textMuted }}>
              successful actions
            </div>
          </div>

        </div>

        {/* 2 PANELS Ở DƯỚI */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          
          {/* Panel Trái: Recent Campaigns -> Top Phễu Đang Cắn */}
          <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${colors.border}` }}>
              <span style={{ fontWeight: '600', fontSize: '15px' }}>Top Phễu Đang Cắn</span>
              <span style={{ color: colors.blue, fontSize: '13px', cursor: 'pointer' }}>View all →</span>
            </div>
            
            <div style={{ padding: '10px 20px', flex: 1 }}>
              {topLinks.length === 0 ? (
                <div style={{ color: colors.textMuted, fontSize: '14px', textAlign: 'center', marginTop: '40px' }}>No campaigns yet</div>
              ) : (
                topLinks.map((link, idx) => (
                  <div key={link.slug} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: idx === topLinks.length - 1 ? 'none' : `1px solid ${colors.border}` }}>
                    
                    {/* Cột trái: Tên link + tag */}
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>/{link.slug}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: link.network.bg, color: link.network.color, padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                          {link.network.name}
                        </span>
                        <span style={{ color: colors.textMuted, fontSize: '12px' }}>0/1 done</span>
                      </div>
                    </div>

                    {/* Cột phải: Icons y hình */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: colors.textMuted, fontSize: '13px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.purple }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> 
                        {(link.count * 2.5).toFixed(1)}k
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.red }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        {link.count}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.blue }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        {link.mobileClicks}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.green }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                        {link.desktopClicks}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: colors.orange }}>
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M3 21v-2l5-5h4l5 5v2H3zm12-11l3-3-3-3v2h-4V4H9v2H5v2h4v2h2v-2h4v2z"></path></svg>
                        {Math.floor(link.count / 3)}
                      </span>
                      <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', color: colors.textMuted }}>
                        completed
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Panel Phải: Recent Activity -> Mắt Thần Tracker */}
          <div style={{ background: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '12px', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${colors.border}` }}>
              <span style={{ fontWeight: '600', fontSize: '15px' }}>Recent Activity</span>
              <span style={{ color: colors.blue, fontSize: '13px', cursor: 'pointer' }}>View all →</span>
            </div>

            <div style={{ padding: '10px 20px', flex: 1 }}>
              {clickLogs.length === 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px', color: colors.textMuted, fontSize: '14px' }}>
                  No activity yet
                </div>
              ) : (
                clickLogs.slice(0, 7).map((log, i) => {
                  let source = log.referrer || 'Truy cập thẳng';
                  if (source.includes('facebook')) source = 'Facebook';
                  else if (source.includes('tiktok')) source = 'TikTok';

                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i === 6 ? 'none' : `1px solid ${colors.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors.green }}></div>
                        <span style={{ fontSize: '14px', color: colors.textMain }}>/{log.slug}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: colors.textMuted }}>
                        <span>{source}</span>
                        <span style={{ width: '60px', textAlign: 'right' }}>{new Date(log.created_at).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

        </div>
      </main>

      {/* MODAL TẠO LINK CHUẨN THEME MỚI */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: colors.bgCard, padding: '32px', borderRadius: '16px', border: `1px solid ${colors.border}`, width: '100%', maxWidth: '450px' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: colors.textMain }}>Tạo Phễu Mồi Mới 🚀</h2>
            <form onSubmit={handleAddLink} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: colors.textMuted, fontSize: '13px' }}>Link Đích (Affiliate Link)</label>
                <input 
                  type="url" required placeholder="https://dinos.click/..." value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${colors.border}`, background: colors.bgApp, color: colors.textMain, outline: 'none', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: colors.textMuted, fontSize: '13px' }}>Đuôi Link (Slug) - Để trống tự Random</label>
                <div style={{ display: 'flex', alignItems: 'center', background: colors.bgApp, border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '0 12px' }}>
                  <span style={{ color: colors.textMuted }}>/</span>
                  <input 
                    type="text" placeholder="vay-tien-nhanh" value={customSlug} onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                    style={{ width: '100%', padding: '12px 8px', border: 'none', background: 'transparent', color: colors.textMain, outline: 'none', fontSize: '14px' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: `1px solid ${colors.border}`, color: colors.textMuted, borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Hủy</button>
                <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: '12px', background: isSubmitting ? 'rgba(59, 130, 246, 0.5)' : colors.blue, border: 'none', color: '#fff', borderRadius: '8px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: '600' }}>
                  {isSubmitting ? 'Đang tạo...' : 'Tạo Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST THÔNG BÁO */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: toast.isError ? colors.red : colors.green, color: '#fff', padding: '12px 24px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', zIndex: 60, fontWeight: '500' }}>
          {toast.text}
        </div>
      )}
    </div>
  );
}
