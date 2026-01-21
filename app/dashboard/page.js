// app/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Link from 'next/link';

// URL Google Sheet của mày
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRn2N1dQ2i7RfA9cwW3g-tIKHd1soMoJGc3HaZv9rhdzDUPSCdtZy9W0QSGwopcV15bDDPld82GQ-oB/pub?output=csv'; 
// Link để sửa file (Thay link edit của mày vào đây)
const EDIT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1jTU5WYB_4g2qQzoK0X44ckOHG8zBIqMXh8jXY-RwBcY/edit?usp=sharing'; 

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [copied, setCopied] = useState(null);

  // State cho phần tạo link mới
  const [newUrl, setNewUrl] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [generatedLink, setGeneratedLink] = useState(''); // Lưu link thành phẩm

  useEffect(() => {
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

  // Hàm xử lý khi nhập liệu thay đổi để cập nhật link preview ngay lập tức
  useEffect(() => {
    if (newSlug) {
      setGeneratedLink(`${window.location.origin}/${newSlug}`);
    } else {
      setGeneratedLink('');
    }
  }, [newSlug]);

  const handleCopyDataToSheet = () => {
    if (!newUrl || !newSlug) return alert('Chưa nhập đủ thông tin kìa!');
    const csvRow = `${newSlug},${newUrl}`;
    navigator.clipboard.writeText(csvRow);
    alert(`Đã copy dữ liệu: "${csvRow}"\nGiờ qua Sheet dán vào dòng cuối nhé!`);
    window.open(EDIT_SHEET_URL, '_blank');
  };

  const copyShortLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    alert('Đã copy link rút gọn: ' + generatedLink);
  };

  const copyToClipboard = (slug) => {
    const fullLink = `${window.location.origin}/${slug}`;
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
      maxWidth: '1000px',
      margin: '40px auto',
      backgroundColor: '#111',
      color: '#fff',
      fontFamily: 'sans-serif',
      padding: '30px',
      borderRadius: '20px',
      border: '1px solid #333'
    }}>
      
      {/* --- PHẦN 1: TẠO LINK MỚI --- */}
      <div style={{
        backgroundColor: '#1a1a1a',
        padding: '25px',
        borderRadius: '15px',
        border: '1px solid #444',
        marginBottom: '40px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '1.5rem', color: '#fff' }}>🚀 Tạo Link Rút Gọn Mới</h2>
        
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <div style={{ flex: 2, minWidth: '300px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#888', fontSize: '0.9rem' }}>Link Gốc:</label>
            <input 
              type="text" 
              placeholder="https://..." 
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#000', color: '#fff' }}
            />
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#888', fontSize: '0.9rem' }}>Mã Rút Gọn:</label>
            <div style={{ display: 'flex', gap: '5px' }}>
              <input 
                type="text" 
                placeholder="vd: mylink" 
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#000', color: '#fff' }}
              />
              <button onClick={generateRandomSlug} style={{ padding: '0 15px', borderRadius: '8px', border: '1px solid #444', background: '#222', color: '#fff', cursor: 'pointer' }}>🎲</button>
            </div>
          </div>
        </div>

        {/* --- KHUNG KẾT QUẢ --- */}
        {generatedLink && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: 'rgba(0, 112, 243, 0.1)',
            border: '1px solid #0070f3',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#0070f3', fontWeight: 'bold' }}>LINK CỦA MÀY ĐÂY:</span>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                readOnly 
                value={generatedLink} 
                style={{ flex: 1, padding: '10px', borderRadius: '5px', border: 'none', background: '#000', color: '#fff', fontSize: '1.1rem' }} 
              />
              <button 
                onClick={copyShortLink}
                style={{ padding: '0 20px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                COPY LINK
              </button>
            </div>
            
            <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#ff9800' }}>
              ⚠️ Lưu ý: Copy link xong nhớ bấm nút màu cam bên dưới để lưu vào Sheet thì link mới chạy nhé!
            </p>
          </div>
        )}

        <button 
          onClick={handleCopyDataToSheet}
          style={{
            marginTop: '20px',
            width: '100%',
            padding: '15px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(90deg, #ff9800, #ff5722)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          💾 COPY DỮ LIỆU & MỞ SHEET ĐỂ LƯU
        </button>
      </div>

      {/* --- PHẦN 2: DANH SÁCH (Giữ nguyên) --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>Danh sách Link ({data.length})</h3>
        <Link href="/" style={{ color: '#888', textDecoration: 'none' }}>← Về trang chủ</Link>
      </div>

      <input 
        type="text" 
        placeholder="🔍 Tìm kiếm..." 
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #333', background: '#000', color: '#fff' }}
      />

      <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #333', borderRadius: '10px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '12px', color: '#00c6ff', fontWeight: 'bold', width: '20%' }}>/{row[0]}</td>
                <td style={{ padding: '12px', color: '#ccc', wordBreak: 'break-all', fontSize: '0.9rem' }}>{row[1]}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <button 
                    onClick={() => copyToClipboard(row[0])}
                    style={{ padding: '5px 10px', borderRadius: '5px', border: 'none', background: copied === row[0] ? '#4caf50' : '#333', color: '#fff', cursor: 'pointer' }}
                  >
                    {copied === row[0] ? '✓' : 'Copy'}
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
