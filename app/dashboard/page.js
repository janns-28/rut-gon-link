// app/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Link from 'next/link';

// URL Google Sheet của mày (Lấy từ middleware.js)
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRn2N1dQ2i7RfA9cwW3g-tIKHd1soMoJGc3HaZv9rhdzDUPSCdtZy9W0QSGwopcV15bDDPld82GQ-oB/pub?output=csv'; 
// Link Google Sheet gốc (Dùng để sửa dữ liệu - mày thay link edit của mày vào đây nếu muốn)
const EDIT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1w.../edit'; 

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Thêm timestamp để tránh cache cũ
      const response = await fetch(`${SHEET_CSV_URL}&t=${Date.now()}`);
      const csvText = await response.text();
      const parsed = Papa.parse(csvText, { header: false });
      // Bỏ dòng đầu tiên nếu là tiêu đề, hoặc lọc dòng trống
      const cleanData = parsed.data.filter(row => row[0] && row[1]); 
      setData(cleanData);
      setLoading(false);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
      setLoading(false);
    }
  };

  const copyToClipboard = (slug) => {
    const fullLink = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(fullLink);
    setCopied(slug);
    setTimeout(() => setCopied(null), 2000); // Reset trạng thái sau 2s
  };

  // Lọc dữ liệu theo từ khóa tìm kiếm
  const filteredData = data.filter(row => 
    row[0].toLowerCase().includes(filter.toLowerCase()) || 
    row[1].toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div style={{
      width: '900px',
      height: '80vh',
      backgroundColor: 'rgba(20, 20, 20, 0.95)',
      borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      flexDirection: 'column',
      padding: '30px',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      position: 'relative',
      zIndex: 10
    }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', background: '-webkit-linear-gradient(#fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Dashboard
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' }}>
            {data.length} liên kết đang hoạt động
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/" style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #333', color: '#888', textDecoration: 'none', fontSize: '0.9rem' }}>
            Back Home
          </Link>
          <a 
            href={EDIT_SHEET_URL} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              padding: '10px 20px', 
              borderRadius: '8px', 
              backgroundColor: '#fff', 
              color: '#000', 
              textDecoration: 'none', 
              fontWeight: '600',
              fontSize: '0.9rem'
            }}
          >
            + Thêm Link Mới
          </a>
        </div>
      </div>

      {/* Search Bar */}
      <input 
        type="text" 
        placeholder="Tìm kiếm link..." 
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{
          width: '100%',
          padding: '12px 15px',
          borderRadius: '10px',
          border: '1px solid #333',
          backgroundColor: '#000',
          color: '#fff',
          marginBottom: '20px',
          outline: 'none',
          fontSize: '1rem'
        }}
      />

      {/* Table Content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>Đang tải dữ liệu...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
                <th style={{ padding: '10px', color: '#888', width: '20%' }}>Slug</th>
                <th style={{ padding: '10px', color: '#888', width: '60%' }}>Link Gốc</th>
                <th style={{ padding: '10px', color: '#888', textAlign: 'right' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '15px 10px', fontWeight: 'bold', color: '#4caf50' }}>/{row[0]}</td>
                  <td style={{ padding: '15px 10px', color: '#ccc', wordBreak: 'break-all', fontSize: '0.9rem' }}>
                    {row[1]}
                  </td>
                  <td style={{ padding: '15px 10px', textAlign: 'right' }}>
                    <button 
                      onClick={() => copyToClipboard(row[0])}
                      style={{
                        padding: '8px 15px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: copied === row[0] ? '#4caf50' : '#333',
                        color: copied === row[0] ? '#000' : '#fff',
                        cursor: 'pointer',
                        transition: '0.2s'
                      }}
                    >
                      {copied === row[0] ? 'Đã Copy!' : 'Copy'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {!loading && filteredData.length === 0 && (
          <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>Không tìm thấy kết quả nào.</p>
        )}
      </div>
    </div>
  );
}
