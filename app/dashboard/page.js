// app/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Link from 'next/link';

// --- CONFIG ---
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRn2N1dQ2i7RfA9cwW3g-tIKHd1soMoJGc3HaZv9rhdzDUPSCdtZy9W0QSGwopcV15bDDPld82GQ-oB/pub?output=csv'; 
// Thay link edit của mày vào đây
const EDIT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit'; 

// --- ICONS (SVG) ---
const CopyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
);
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4caf50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
);
const ExternalLinkIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
);
const DiceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 8h.01"></path><path d="M8 8h.01"></path><path d="M8 16h.01"></path><path d="M16 16h.01"></path><path d="M12 12h.01"></path></svg>
);

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [copied, setCopied] = useState(null);
  const [origin, setOrigin] = useState('');
  
  // State Input
  const [newUrl, setNewUrl] = useState('');
  const [newSlug, setNewSlug] = useState('');

  useEffect(() => {
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
    const confirm = window.confirm(`Đã copy: "${csvRow}"\n\nBấm OK để mở Google Sheet và dán vào dòng cuối cùng!`);
    if(confirm) window.open(EDIT_SHEET_URL, '_blank');
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filteredData = data.filter(row => 
    row[0]?.toLowerCase().includes(filter.toLowerCase()) || 
    row[1]?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <>
      {/* CSS Nhúng trực tiếp để xử lý Scrollbar và Hover */}
      <style jsx global>{`
        body { background-color: #050505; color: #fff; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #555; }
        .glass-panel {
          background: rgba(20, 20, 20, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }
        .table-row { transition: all 0.2s ease; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .table-row:hover { background-color: rgba(255, 255, 255, 0.03); transform: translateX(5px); }
        .input-dark {
          background: rgba(0,0,0,0.5); border: 1px solid #333; color: white; transition: 0.2s;
        }
        .input-dark:focus { border-color: #0070f3; outline: none; box-shadow: 0 0 0 2px rgba(0,112,243,0.2); }
        .btn-gradient {
          background: linear-gradient(135deg, #0070f3 0%, #00c6ff 100%);
          transition: 0.3s;
        }
        .btn-gradient:hover { filter: brightness(1.2); transform: scale(1.02); }
      `}</style>

      <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px', fontFamily: '"Inter", sans-serif' }}>
        
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '800', background: 'linear-gradient(to right, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Dashboard
            </h1>
            <p style={{ color: '#666', marginTop: '5px' }}>Quản lý {data.length} liên kết rút gọn</p>
          </div>
          <Link href="/" style={{ padding: '10px 20px', borderRadius: '30px', border: '1px solid #333', color: '#888', textDecoration: 'none', fontSize: '0.9rem', transition: '0.2s' }}>
            ← Trang chủ
          </Link>
        </div>

        {/* --- KHUNG TẠO LINK (GLASSMORPHISM) --- */}
        <div className="glass-panel" style={{ padding: '30px', borderRadius: '24px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            
            <div style={{ flex: 3, minWidth: '300px' }}>
              <label style={{ display: 'block', marginBottom: '10px', color: '#aaa', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Dán Link Gốc
              </label>
              <input 
                className="input-dark"
                type="text" 
                placeholder="https://example.com/bai-viet-dai-loang-ngoang..." 
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', fontSize: '1rem' }}
              />
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '10px', color: '#aaa', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Mã (Slug)
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  className="input-dark"
                  type="text" 
                  placeholder="vd: sale2024" 
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', color: '#00c6ff' }}
                />
                <button 
                  onClick={generateRandomSlug}
                  style={{ background: '#222', border: '1px solid #333', borderRadius: '12px', width: '50px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Random Slug"
                >
                  <DiceIcon />
                </button>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '150px' }}>
               <button 
                onClick={handleCopyDataToSheet}
                className="btn-gradient"
                style={{ 
                  width: '100%', padding: '15px', borderRadius: '12px', border: 'none', 
                  color: 'white', fontWeight: 'bold', cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0, 112, 243, 0.4)'
                }}
              >
                + Tạo Mới
              </button>
            </div>
          </div>
        </div>

        {/* --- DANH SÁCH --- */}
        <div style={{ position: 'relative' }}>
          <input 
            className="input-dark"
            type="text" 
            placeholder="🔍 Tìm kiếm link..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: '100%', padding: '15px 20px', borderRadius: '16px', marginBottom: '20px', backgroundColor: '#0a0a0a', border: '1px solid #222' }}
          />

          <div className="glass-panel" style={{ borderRadius: '20px', overflow: 'hidden' }}>
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'rgba(255,255,255,0.03)', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(10px)' }}>
                  <tr>
                    <th style={{ padding: '20px', color: '#666', fontWeight: '600', fontSize: '0.85rem', width: '15%' }}>SLUG</th>
                    <th style={{ padding: '20px', color: '#666', fontWeight: '600', fontSize: '0.85rem', width: '35%' }}>SHORT LINK</th>
                    <th style={{ padding: '20px', color: '#666', fontWeight: '600', fontSize: '0.85rem', width: '40%' }}>ORIGINAL URL</th>
                    <th style={{ padding: '20px', color: '#666', fontWeight: '600', fontSize: '0.85rem', width: '10%', textAlign: 'center' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, index) => (
                    <tr key={index} className="table-row">
                      {/* Slug */}
                      <td style={{ padding: '15px 20px' }}>
                        <span style={{ 
                          background: 'rgba(255,255,255,0.1)', 
                          padding: '6px 12px', 
                          borderRadius: '8px', 
                          fontSize: '0.9rem', 
                          fontWeight: 'bold', 
                          color: '#fff',
                          fontFamily: 'monospace'
                        }}>
                          /{row[0]}
                        </span>
                      </td>

                      {/* Short Link */}
                      <td style={{ padding: '15px 20px' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00c6ff', fontWeight: '500' }}>
                           <a href={`${origin}/${row[0]}`} target="_blank" className="hover-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                             {origin ? origin.replace('https://', '').replace('http://', '') : ''}/{row[0]}
                           </a>
                           <a href={`${origin}/${row[0]}`} target="_blank" style={{ color: '#444', transition: '0.2s' }}><ExternalLinkIcon /></a>
                         </div>
                      </td>

                      {/* Original Link */}
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ maxWidth: '350px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#888', fontSize: '0.9rem' }}>
                          {row[1]}
                        </div>
                      </td>

                      {/* Action Button */}
                      <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                        <button 
                          onClick={() => copyToClipboard(`${origin}/${row[0]}`, row[0])}
                          style={{
                            background: copied === row[0] ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '8px',
                            color: copied === row[0] ? '#4caf50' : '#666',
                            transition: '0.2s'
                          }}
                          title="Copy Link"
                        >
                          {copied === row[0] ? <CheckIcon /> : <CopyIcon />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length === 0 && !loading && (
                <div style={{ padding: '40px', textAlign: 'center', color: '#444' }}>Không tìm thấy link nào cả...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
