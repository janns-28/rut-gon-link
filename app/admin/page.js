'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Helper nhận diện Network Affiliate
const getNetworkInfo = (url) => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('dinos.click')) return { name: 'Dinos', bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' };
  if (lowerUrl.includes('hl-link')) return { name: 'Hyperlead', bg: '#e0e7ff', text: '#4f46e5', border: '#a5b4fc' };
  if (lowerUrl.includes('accesstrade')) return { name: 'Accesstrade', bg: '#fef3c7', text: '#d97706', border: '#fcd34d' };
  if (lowerUrl.includes('masoffer')) return { name: 'MasOffer', bg: '#dcfce7', text: '#16a34a', border: '#86efac' };
  if (lowerUrl.includes('facebook.com')) return { name: 'Social', bg: '#dbeafe', text: '#2563eb', border: '#93c5fd' };
  return { name: 'Direct', bg: '#f3f4f6', text: '#4b5563', border: '#d1d5db' };
};

export default function PremiumAdmin() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    async function fetchLinks() {
      const { data } = await supabase.from('links').select('*').order('created_at', { ascending: false });
      if (data) setLinks(data);
      setLoading(false);
    }
    fetchLinks();
  }, []);

  const filteredLinks = links.filter(l => 
    l.slug.toLowerCase().includes(search.toLowerCase()) || 
    l.original_url.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopy = (slug) => {
    const fullUrl = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setToast(`Đã copy: /${slug}`);
    setTimeout(() => setToast(''), 2500);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f1115', color: '#e2e8f0', fontFamily: '"Inter", system-ui, sans-serif' }}>
      
      {/* Toast Notification */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: '#10b981', color: '#fff', padding: '12px 24px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', zIndex: 50, fontWeight: '500', animation: 'slideIn 0.3s ease-out' }}>
          ✓ {toast}
        </div>
      )}

      {/* Sidebar */}
      <aside style={{ width: '260px', borderRight: '1px solid #1f2937', backgroundColor: '#111318', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>B</div>
          <span style={{ fontSize: '1.2rem', fontWeight: '700', letterSpacing: '0.5px', color: '#f8fafc' }}>BINHTIENTI</span>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <a href="#" style={{ padding: '12px 16px', borderRadius: '8px', background: '#1f2937', color: '#f8fafc', textDecoration: 'none', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
            Quản lý Links
          </a>
          {/* Menu ảo cho đẹp */}
          <a href="#" style={{ padding: '12px 16px', borderRadius: '8px', color: '#94a3b8', textDecoration: 'none', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'not-allowed', opacity: 0.7 }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            Thống kê (Sắp có)
          </a>
        </nav>

        <div style={{ marginTop: 'auto', padding: '16px', background: '#1e1b4b', borderRadius: '12px', border: '1px solid #312e81' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#a5b4fc', fontWeight: '600' }}>🚀 Hướng dẫn xóa link</p>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#818cf8', lineHeight: '1.5' }}>Mở Telegram Bot và chat:<br/><strong style={{ color: '#fff' }}>/xoa [mã_rút_gọn]</strong></p>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px 50px', overflowY: 'auto' }}>
        
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#f8fafc', margin: '0 0 8px 0' }}>Chiến dịch Affiliate</h1>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>Theo dõi và quản lý các liên kết chuyển hướng của bạn.</p>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ background: '#1f2937', padding: '12px 24px', borderRadius: '12px', border: '1px solid #374151', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff' }}>{links.length}</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>Tổng Link</span>
            </div>
            <div style={{ background: '#1f2937', padding: '12px 24px', borderRadius: '12px', border: '1px solid #374151', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981' }}>Active</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>Trạng thái Bot</span>
            </div>
          </div>
        </header>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <svg style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Tìm kiếm mã hoặc link gốc..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: '10px', border: '1px solid #374151', background: '#111318', color: '#f8fafc', fontSize: '0.95rem', outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
              onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#374151'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        </div>

        {/* Table Container */}
        <div style={{ background: '#111318', borderRadius: '16px', border: '1px solid #1f2937', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ background: '#181b23', borderBottom: '1px solid #1f2937' }}>
                <th style={{ padding: '16px 24px', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mã Rút Gọn</th>
                <th style={{ padding: '16px 24px', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nền Tảng</th>
                <th style={{ padding: '16px 24px', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Link Gốc</th>
                <th style={{ padding: '16px 24px', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ngày Lên Camp</th>
                <th style={{ padding: '16px 24px', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang đồng bộ dữ liệu...</td></tr>
              ) : filteredLinks.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Không tìm thấy chiến dịch nào.</td></tr>
              ) : (
                filteredLinks.map((l) => {
                  const net = getNetworkInfo(l.original_url);
                  return (
                    <tr key={l.id} style={{ borderBottom: '1px solid #1f2937', transition: 'background 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#181b23'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#64748b' }}>/</span>
                          <strong style={{ color: '#f8fafc', letterSpacing: '0.5px' }}>{l.slug}</strong>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ background: net.bg, color: net.text, border: `1px solid ${net.border}`, padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>
                          {net.name}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', maxWidth: '300px' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', color: '#cbd5e1', fontSize: '0.9rem' }} title={l.original_url}>
                          {l.original_url}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '0.9rem' }}>
                        {new Date(l.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => handleCopy(l.slug)}
                            title="Copy Link Rút Gọn"
                            style={{ background: '#374151', color: '#d1d5db', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#4b5563'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#374151'; e.currentTarget.style.color = '#d1d5db'; }}
                          >
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                          </button>
                          <a 
                            href={l.original_url} target="_blank" rel="noopener noreferrer"
                            title="Mở Link Gốc"
                            style={{ background: '#374151', color: '#d1d5db', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#4b5563'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = '#374151'; e.currentTarget.style.color = '#d1d5db'; }}
                          >
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </main>
      <style jsx global>{`
        /* Triệt tiêu viền trắng mặc định của trình duyệt */
        body { 
          margin: 0; 
          padding: 0; 
          background-color: #0f1115; 
        }

        /* Độ lại thanh cuộn (Scrollbar) cho ra dáng Premium */
        ::-webkit-scrollbar { 
          width: 8px; 
          height: 8px; 
        }
        ::-webkit-scrollbar-track { 
          background: #0f1115; 
        }
        ::-webkit-scrollbar-thumb { 
          background: #374151; 
          border-radius: 4px; 
        }
        ::-webkit-scrollbar-thumb:hover { 
          background: #4b5563; 
        }

        /* Hiệu ứng trượt của thông báo Copy */
        @keyframes slideIn {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
