// app/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Link from 'next/link';

// --- CONFIG ---
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRn2N1dQ2i7RfA9cwW3g-tIKHd1soMoJGc3HaZv9rhdzDUPSCdtZy9W0QSGwopcV15bDDPld82GQ-oB/pub?output=csv'; 
const EDIT_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1jTU5WYB_4g2qQzoK0X44ckOHG8zBIqMXh8jXY-RwBcY/edit?usp=sharing'; // <-- Thay link edit của mày vào đây

// --- ICONS ---
const CopyIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00FF94" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const SparkleIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>;
const LinkIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>;

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [copied, setCopied] = useState(null);
  const [origin, setOrigin] = useState('');
  
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
    if (!newUrl || !newSlug) return alert('Nhập link vào đi ní!');
    const csvRow = `${newSlug},${newUrl}`;
    navigator.clipboard.writeText(csvRow);
    const confirm = window.confirm(`Đã copy dữ liệu!\n\n"${csvRow}"\n\nBấm OK để mở Google Sheet và dán vào dòng cuối cùng!`);
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
      <style jsx global>{`
        /* Global Reset */
        body { background-color: #030303; color: #fff; font-family: 'Inter', -apple-system, sans-serif; overflow-x: hidden; }
        
        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        
        /* Animations */
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        @keyframes gradient-xy {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Utility Classes */
        .glass-box {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
          border-radius: 24px;
        }

        .input-field {
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          transition: all 0.3s ease;
        }
        .input-field:focus {
          border-color: #a855f7;
          box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
          outline: none;
          background: rgba(0, 0, 0, 0.6);
        }

        .primary-btn {
          background: linear-gradient(90deg, #7928ca, #ff0080);
          background-size: 200% 200%;
          animation: gradient-xy 3s ease infinite;
          border: none;
          color: white;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .primary-btn:hover { transform: scale(1.02); box-shadow: 0 0 20px rgba(255, 0, 128, 0.4); }

        .link-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid transparent;
        }
        .link-card:hover {
          transform: translateY(-3px);
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5);
        }
      `}</style>

      {/* --- BACKGROUND BLOBS (Hiệu ứng nền) --- */}
      <div style={{ position: 'fixed', top: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(121,40,202,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(80px)', zIndex: -1 }}></div>
      <div style={{ position: 'fixed', bottom: '-20%', right: '-10%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(255,0,128,0.1) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(80px)', zIndex: -1 }}></div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* --- HEADER --- */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', margin: 0, fontWeight: '800', background: 'linear-gradient(to right, #fff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Dashboard
            </h1>
            <p style={{ color: '#888', marginTop: '5px' }}>Hệ thống quản lý {data.length} liên kết</p>
          </div>
          <Link href="/" style={{ padding: '10px 24px', borderRadius: '50px', background: 'rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500', border: '1px solid rgba(255,255,255,0.1)', transition: '0.2s' }}>
            Exit
          </Link>
        </header>

        {/* --- CREATOR SECTION (Khu vực tạo link) --- */}
        <section className="glass-box" style={{ padding: '30px', marginBottom: '50px', position: 'relative', overflow: 'hidden' }}>
          {/* Đường line trang trí phía trên */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, #ff0080, transparent)' }}></div>
          
          <h2 style={{ fontSize: '1.2rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <SparkleIcon /> Tạo liên kết mới
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '15px' }}>
            {/* Input URL */}
            <div style={{ position: 'relative' }}>
              <input 
                className="input-field"
                type="text" 
                placeholder="Dán link dài ngoằng vào đây..." 
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                style={{ width: '100%', padding: '16px 20px', borderRadius: '16px', fontSize: '1rem', boxSizing: 'border-box' }}
              />
            </div>

            {/* Input Slug */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                className="input-field"
                type="text" 
                placeholder="Slug" 
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                style={{ width: '100%', padding: '16px', borderRadius: '16px', fontSize: '1rem', fontWeight: 'bold', color: '#ff0080', textAlign: 'center', boxSizing: 'border-box' }}
              />
              <button 
                onClick={generateRandomSlug}
                style={{ width: '50px', background: '#222', border: '1px solid #333', borderRadius: '16px', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Random"
              >
                🎲
              </button>
            </div>

            {/* Button */}
            <button 
              onClick={handleCopyDataToSheet}
              className="primary-btn"
              style={{ borderRadius: '16px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              + Tạo ngay
            </button>
          </div>
        </section>


        {/* --- LIST SECTION (Danh sách dạng Cards) --- */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Thư viện liên kết</h3>
            <input 
              className="input-field"
              type="text" 
              placeholder="🔍 Tìm nhanh..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ width: '250px', padding: '10px 15px', borderRadius: '12px', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '40px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Đang tải dữ liệu từ vũ trụ...</div>
            ) : filteredData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#444', border: '1px dashed #333', borderRadius: '20px' }}>Trống trơn. Tạo link mới đi!</div>
            ) : (
              filteredData.map((row, index) => (
                // --- CARD ITEM ---
                <div key={index} className="glass-box link-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  
                  {/* Left: Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', overflow: 'hidden' }}>
                    
                    {/* Slug Avatar */}
                    <div style={{ 
                      width: '50px', height: '50px', borderRadius: '14px', 
                      background: 'linear-gradient(135deg, #222, #111)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#a855f7', fontWeight: 'bold', fontSize: '1.2rem',
                      border: '1px solid #333'
                    }}>
                      {row[0].charAt(0).toUpperCase()}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
                      {/* Short Link */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <a href={`${origin}/${row[0]}`} target="_blank" style={{ color: '#fff', textDecoration: 'none', fontWeight: '600', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                          /{row[0]}
                        </a>
                        <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7' }}>Active</span>
                      </div>
                      
                      {/* Original URL */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '0.85rem' }}>
                        <LinkIcon />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px' }}>
                          {row[1]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => copyToClipboard(`${origin}/${row[0]}`, row[0])}
                      style={{ 
                        background: copied === row[0] ? '#00FF94' : '#222', 
                        color: copied === row[0] ? '#000' : '#fff',
                        border: '1px solid #333', 
                        width: '45px', height: '45px', borderRadius: '12px', 
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: '0.2s'
                      }}
                      title="Copy Link"
                    >
                      {copied === row[0] ? <CheckIcon /> : <CopyIcon />}
                    </button>
                    
                    <a 
                      href={`${origin}/${row[0]}`} 
                      target="_blank"
                      style={{ 
                        background: '#222', color: '#fff', border: '1px solid #333',
                        width: '45px', height: '45px', borderRadius: '12px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
                        transition: '0.2s'
                      }}
                      title="Mở link"
                    >
                      ↗
                    </a>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
