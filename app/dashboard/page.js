// app/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Link from 'next/link';

// URL Google Sheet của mày
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRn2N1dQ2i7RfA9cwW3g-tIKHd1soMoJGc3HaZv9rhdzDUPSCdtZy9W0QSGwopcV15bDDPld82GQ-oB/pub?output=csv'; 
// Link edit sheet
const EDIT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1jTU5WYB_4g2qQzoK0X44ckOHG8zBIqMXh8jXY-RwBcY/edit?usp=sharing'; 

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [copied, setCopied] = useState(null);
  const [origin, setOrigin] = useState(''); // Biến này để lấy tên domain của mày (vd: localhost:3000 hoặc abc.vercel.app)

  // State cho tạo link mới
  const [newUrl, setNewUrl] = useState('');
  const [newSlug, setNewSlug] = useState('');

  useEffect(() => {
    // Lấy domain hiện tại sau khi trang tải xong
    setOrigin(window.location.origin);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`${SHEET_CSV_URL}&t=${Date.now()}`);
      const csvText = await response.text();
      const parsed = Papa.parse(csvText, { header: false });
      const cleanData = parsed.data.filter(row => row[0] && row[1]); 
      setData(cleanData);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi:', error);
      setLoading(false);
    }
  };

  const generateRandomSlug = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewSlug(result);
  };

  const handleCopyDataToSheet = () => {
    if (!newUrl || !newSlug) return alert('Chưa nhập đủ thông tin!');
    const csvRow = `${newSlug},${newUrl}`;
    navigator.clipboard.writeText(csvRow);
    alert(`Đã copy dòng: "${csvRow}"\nGiờ qua Sheet dán vào nhé!`);
    window.open(EDIT_SHEET_URL, '_blank');
  };

  const copyToClipboard = (slug) => {
    const fullLink = `${origin}/${slug}`;
    navigator.clipboard.writeText(fullLink);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000);
  };

  const filteredData = data.filter(row => 
    row[0]?.toLowerCase().includes(filter.toLowerCase()) || 
    row[1]?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{
      maxWidth: '1200px', // Tao mở rộng khung ra chút cho dễ nhìn
      margin: '40px auto',
      backgroundColor: '#111',
      color: '#fff',
      fontFamily: 'sans-serif',
      padding: '30px',
      borderRadius: '20px',
      border: '1px solid #333'
    }}>
      
      {/* --- KHUNG TẠO LINK (Giữ nguyên) --- */}
      <div style={{ backgroundColor: '#1a1a1a', padding: '25px', borderRadius: '15px', border: '1px solid #444', marginBottom: '40px' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', color: '#fff' }}>🚀 Tạo Link Mới</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2 }}>
            <input type="text" placeholder="Link Gốc (https://...)" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#000', color: '#fff' }} />
          </div>
          <div style={{ flex: 1, display: 'flex', gap: '5px' }}>
            <input type="text" placeholder="Slug" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#000', color: '#fff' }} />
            <button onClick={generateRandomSlug} style={{ padding: '0 15px', borderRadius: '8px', border: '1px solid #444', background: '#222', color: '#fff' }}>🎲</button>
          </div>
        </div>
        <button onClick={handleCopyDataToSheet} style={{ marginTop: '20px', width: '100%', padding: '15px', borderRadius: '8px', border: 'none', background: '#ff9800', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>💾 COPY & MỞ SHEET</button>
      </div>

      {/* --- DANH SÁCH LINK (Đã sửa thêm cột) --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>Danh sách ({data.length})</h3>
        <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>← Về trang chủ</Link>
      </div>

      <input type="text" placeholder="🔍 Tìm kiếm..." value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #333', background: '#000', color: '#fff' }} />

      <div style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #333', borderRadius: '10px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#222', position: 'sticky', top: 0, zIndex: 2 }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left', color: '#888', width: '10%' }}>Slug</th>
              {/* CỘT MỚI THÊM VÀO ĐÂY */}
              <th style={{ padding: '15px', textAlign: 'left', color: '#888', width: '35%' }}>Link Rút Gọn</th> 
              <th style={{ padding: '15px', textAlign: 'left', color: '#888', width: '45%' }}>Link Gốc</th>
              <th style={{ padding: '15px', textAlign: 'right', color: '#888', width: '10%' }}>Copy</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #222', backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                {/* 1. Slug */}
                <td style={{ padding: '15px', color: '#666', fontWeight: 'bold' }}>/{row[0]}</td>
                
                {/* 2. Link Rút Gọn (FULL LINK) */}
                <td style={{ padding: '15px' }}>
                  <a 
                    href={`${origin}/${row[0]}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      color: '#00c6ff', 
                      textDecoration: 'none', 
                      fontWeight: '500',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '300px'
                    }}
                  >
                    {origin}/{row[0]}
                  </a>
                </td>

                {/* 3. Link Gốc */}
                <td style={{ padding: '15px', color: '#ccc', fontSize: '0.9rem' }}>
                  <div style={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row[1]}
                  </div>
                </td>

                {/* 4. Nút Copy */}
                <td style={{ padding: '15px', textAlign: 'right' }}>
                  <button 
                    onClick={() => copyToClipboard(row[0])}
                    style={{ padding: '8px 15px', borderRadius: '6px', border: 'none', background: copied === row[0] ? '#4caf50' : '#333', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    {copied === row[0] ? 'Đã Copy!' : 'Copy'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
