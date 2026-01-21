'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [links, setLinks] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => { fetchLinks(); }, []);

  async function fetchLinks() {
    const { data, error } = await supabase.from('links').select('*').order('created_at', { ascending: false });
    if (error) {
      setErrorMsg(error.message); // Hiện lỗi nếu Supabase chặn
    } else {
      setLinks(data);
    }
  }

  return (
    <div style={{ backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '20px' }}>
      <h1>Quản Lý Liên Kết</h1>
      {errorMsg && <p style={{ color: 'red' }}>Lỗi: {errorMsg}</p>}
      <table border="1" style={{ width: '100%', borderColor: '#333' }}>
        <thead>
          <tr><th>Mã</th><th>Link Gốc</th><th>Ngày tạo</th></tr>
        </thead>
        <tbody>
          {links.map(l => (
            <tr key={l.id}>
              <td>{l.slug}</td>
              <td>{l.original_url}</td>
              <td>{new Date(l.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
