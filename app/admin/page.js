'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [links, setLinks] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchLinks() {
      // BỎ HOÀN TOÀN lệnh .order('created_at') để không bị báo lỗi nữa
      const { data, error } = await supabase.from('links').select('*');
      
      if (error) {
        setErrorMsg(error.message);
      } else {
        setLinks(data);
      }
    }
    fetchLinks();
  }, []);

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '40px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#FFD700' }}>Quản Lý Liên Kết 📊</h1>
      
      {errorMsg && <p style={{ color: '#ff4444', fontWeight: 'bold' }}>Lỗi hệ thống: {errorMsg}</p>}
      
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', borderColor: '#333' }}>
        <thead>
          <tr style={{ backgroundColor: '#222', color: '#FFD700' }}>
            <th style={{ padding: '15px', textAlign: 'left' }}>Mã (Slug)</th>
            <th style={{ padding: '15px', textAlign: 'left' }}>Link Gốc (Original URL)</th>
          </tr>
        </thead>
        <tbody>
          {links.map(l => (
            <tr key={l.id} style={{ borderBottom: '1px solid #222' }}>
              <td style={{ padding: '15px', color: '#007cf0', fontWeight: 'bold' }}>{l.slug}</td>
              <td style={{ padding: '15px', color: '#aaa' }}>{l.original_url}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {links.length === 0 && !errorMsg && (
        <p style={{ textAlign: 'center', marginTop: '30px', color: '#888' }}>Chưa có link nào trong hệ thống.</p>
      )}
    </div>
  );
}
