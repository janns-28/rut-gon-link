'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Đảm bảo đường dẫn này đúng với file supabase của bác

export default function AdminDashboard() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu từ Supabase
  useEffect(() => {
    fetchLinks();
  }, []);

  async function fetchLinks() {
    setLoading(true);
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Lỗi lấy dữ liệu:', error);
    } else {
      setLinks(data);
    }
    setLoading(false);
  }

  // Hàm copy link nhanh
  const copyToClipboard = (slug) => {
    const fullLink = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(fullLink);
    alert('Đã copy: ' + fullLink);
  };

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#0f0f0f', color: '#efefef',
      padding: '40px', fontFamily: 'sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2rem', color: '#FFD700' }}>Quản Lý Liên Kết 📊</h1>
          <button onClick={fetchLinks} style={{
            padding: '10px 20px', backgroundColor: '#333', color: '#fff',
            border: '1px solid #444', borderRadius: '8px', cursor: 'pointer'
          }}> Làm mới </button>
        </div>

        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <div style={{ overflowX: 'auto', backgroundColor: '#1a1a1a', borderRadius: '12px', border: '1px solid #333' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #333', backgroundColor: '#252525' }}>
                  <th style={{ padding: '15px' }}>Ngày tạo</th>
                  <th style={{ padding: '15px' }}>Mã (Slug)</th>
                  <th style={{ padding: '15px' }}>Link gốc</th>
                  <th style={{ padding: '15px' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link) => (
                  <tr key={link.id} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '15px', color: '#888', fontSize: '0.9rem' }}>
                      {new Date(link.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td style={{ padding: '15px', fontWeight: 'bold', color: '#007cf0' }}>
                      {link.slug}
                    </td>
                    <td style={{ padding: '15px', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#aaa' }}>
                      {link.original_url}
                    </td>
                    <td style={{ padding: '15px' }}>
                      <button 
                        onClick={() => copyToClipboard(link.slug)}
                        style={{ padding: '6px 12px', backgroundColor: '#007cf0', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      > Copy Link </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {links.length === 0 && <p style={{ textAlign: 'center', padding: '20px' }}>Chưa có link nào được tạo.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
