'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ModernAdmin() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLinks() {
      const { data } = await supabase.from('links').select('*').order('created_at', { ascending: false });
      if (data) setLinks(data);
      setLoading(false);
    }
    fetchLinks();
  }, []);

  return (
    <div style={{ backgroundColor: '#0a0a0a', color: '#fff', minHeight: '100vh', padding: '60px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '40px', background: 'linear-gradient(to right, #ffd700, #fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Quản Lý Link 📈
        </h1>
        
        <div style={{ background: '#141414', borderRadius: '24px', border: '1px solid #222', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#1c1c1c' }}>
              <tr>
                <th style={{ padding: '20px', textAlign: 'left', color: '#888' }}>Mã rút gọn</th>
                <th style={{ padding: '20px', textAlign: 'left', color: '#888' }}>Liên kết gốc</th>
                <th style={{ padding: '20px', textAlign: 'left', color: '#888' }}>Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {links.map(l => (
                <tr key={l.id} style={{ borderBottom: '1px solid #1c1c1c' }}>
                  <td style={{ padding: '20px', color: '#ffd700', fontWeight: 'bold' }}>{l.slug}</td>
                  <td style={{ padding: '20px', color: '#aaa', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.original_url}</td>
                  <td style={{ padding: '20px', color: '#555' }}>{new Date(l.created_at).toLocaleDateString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <p style={{ textAlign: 'center', padding: '40px', color: '#555' }}>Đang tải dữ liệu...</p>}
        </div>
      </div>
    </div>
  );
}
