'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [links, setLinks] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => { fetchLinks(); }, []);

  async function fetchLinks() {
    // BỎ phần .order('created_at') để tránh lỗi column does not exist
    const { data, error } = await supabase.from('links').select('*');
    if (error) {
      setErrorMsg(error.message);
    } else {
      setLinks(data);
    }
  }

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '20px' }}>
      <h1>Quản Lý Liên Kết 📊</h1>
      {errorMsg && <p style={{ color: 'red' }}>Lỗi: {errorMsg}</p>}
      <table border="1" style={{ width: '100%', borderColor: '#333', textAlign: 'left' }}>
        <thead>
          <tr style={{ color: '#FFD700' }}>
            <th style={{ padding: '10px' }}>Mã (Slug)</th>
            <th style={{ padding: '10px' }}>Link Gốc</th>
          </tr>
        </thead>
        <tbody>
          {links.map(l => (
            <tr key={l.id}>
              <td style={{ padding: '10px' }}>{l.slug}</td>
              <td style={{ padding: '10px' }}>{l.original_url}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
