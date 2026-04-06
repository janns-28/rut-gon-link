'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ModernAdmin() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedSlug, setCopiedSlug] = useState(null);

  useEffect(() => {
    async function fetchLinks() {
      const { data } = await supabase.from('links').select('*').order('created_at', { ascending: false });
      if (data) setLinks(data);
      setLoading(false);
    }
    fetchLinks();
  }, []);

  // Lọc link theo ô tìm kiếm
  const filteredLinks = links.filter(l => 
    l.slug.toLowerCase().includes(search.toLowerCase()) || 
    l.original_url.toLowerCase().includes(search.toLowerCase())
  );

  // Hàm copy link 1 chạm
  const handleCopy = (slug) => {
    const fullUrl = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000); // Tắt thông báo sau 2s
  };

  return (
    <div style={{ backgroundColor: '#09090b', color: '#ededed', minHeight: '100vh', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header & Stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', margin: '0 0 10px 0', fontWeight: '800', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Bảng Điều Khiển Link
            </h1>
            <p style={{ color: '#a1a1aa', margin: 0 }}>Quản lý các chiến dịch rút gọn của ông.</p>
          </div>
          
          <div style={{ background: '#18181b', border: '1px solid #27272a', padding: '15px 25px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', lineHeight: '1' }}>{links.length}</div>
            <div style={{ color: '#a1a1aa', fontSize: '0.85rem', marginTop: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>Tổng số link</div>
          </div>
        </div>

        {/* Thanh công cụ */}
        <div style={{ marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="🔍 Tìm kiếm mã hoặc link chiến dịch..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '15px 20px', borderRadius: '12px', border: '1px solid #27272a', background: '#18181b', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s' }}
            onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
            onBlur={(e) => e.target.style.borderColor = '#27272a'}
          />
        </div>

        {/* Bảng dữ liệu */}
        <div style={{ background: '#18181b', borderRadius: '16px', border: '1px solid #27272a', overflowX: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#27272a', borderBottom: '2px solid #3f3f46' }}>
                <th style={{ padding: '16px 20px', color: '#e4e4e7', fontWeight: '600', width: '20%' }}>Mã Rút Gọn</th>
                <th style={{ padding: '16px 20px', color: '#e4e4e7', fontWeight: '600', width: '45%' }}>Link Gốc</th>
                <th style={{ padding: '16px 20px', color: '#e4e4e7', fontWeight: '600', width: '15%' }}>Ngày Tạo</th>
                <th style={{ padding: '16px 20px', color: '#e4e4e7', fontWeight: '600', width: '20%', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#a1a1aa' }}>Đang tải dữ liệu Supabase... ⏳</td></tr>
              ) : filteredLinks.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#a1a1aa' }}>Không tìm thấy link nào.</td></tr>
              ) : (
                filteredLinks.map((l) => (
                  <tr key={l.id} style={{ borderBottom: '1px solid #27272a', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#27272a'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                        /{l.slug}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', maxWidth: '300px' }}>
                      <div style={{ color: '#d4d4d8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <a href={l.original_url} target="_blank" rel="noopener noreferrer" style={{ color: '#93c5fd', textDecoration: 'none' }} title={l.original_url}>
                          {l.original_url}
                        </a>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', color: '#a1a1aa', fontSize: '0.9rem' }}>
                      {new Date(l.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleCopy(l.slug)}
                        style={{ background: copiedSlug === l.slug ? '#22c55e' : '#3f3f46', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s' }}
                      >
                        {copiedSlug === l.slug ? '✅ Đã Copy' : '📋 Copy Link'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
