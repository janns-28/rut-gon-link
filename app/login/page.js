// app/login/page.js
'use client';
import { useState } from 'react';
// import { useRouter } from 'next/navigation'; <--- BỎ DÒNG NÀY ĐI, KHÔNG CẦN DÙNG NỮA

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // const router = useRouter(); <--- BỎ LUÔN

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ password }),
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      
      if (data.success) {
        // --- SỬA ĐOẠN NÀY ---
        // Thay vì dùng router.push (nhẹ nhàng), ta dùng window.location.href (mạnh bạo)
        // Nó sẽ ép trình duyệt tải lại trang /dashboard từ đầu, đảm bảo nhận diện được Cookie.
        window.location.href = '/dashboard'; 
      } else {
        setError('❌ Mật khẩu sai rồi đại ca!');
        setLoading(false);
      }
    } catch (err) {
      setError('⚠️ Lỗi kết nối, thử lại xem!');
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        body { background-color: #050505; color: #fff; font-family: sans-serif; overflow: hidden; }
        
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }

        .spinner {
          border: 3px solid rgba(255,255,255,0.3);
          border-top: 3px solid #fff;
          border-radius: 50%;
          width: 16px; height: 16px;
          animation: spin 1s linear infinite;
        }

        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          border-radius: 24px;
          padding: 40px;
          width: 320px;
          text-align: center;
          position: relative;
          z-index: 10;
        }

        .input-glow:focus {
          border-color: #a855f7;
          box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.2);
          background: rgba(0,0,0,0.6);
        }
      `}</style>

      {/* Background Effects */}
      <div style={{ position: 'fixed', top: '20%', left: '20%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(121,40,202,0.4) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', zIndex: 1, animation: 'float 6s ease-in-out infinite' }}></div>
      <div style={{ position: 'fixed', bottom: '20%', right: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,0,128,0.3) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)', zIndex: 1, animation: 'float 8s ease-in-out infinite reverse' }}></div>

      <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        
        <form onSubmit={handleSubmit} className="glass-panel">
          <div style={{ marginBottom: '30px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🔐</div>
            <h2 style={{ margin: 0, background: 'linear-gradient(to right, #fff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Admin Access
            </h2>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <input 
              type="password" 
              placeholder="Nhập mật mã..." 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="input-glow"
              style={{
                width: '100%', padding: '15px', borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(0,0,0,0.4)', color: '#fff',
                fontSize: '1rem', outline: 'none',
                transition: '0.3s',
                opacity: loading ? 0.5 : 1
              }}
            />
          </div>
          
          {error && (
            <div style={{ color: '#ff4444', background: 'rgba(255,0,0,0.1)', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '20px', border: '1px solid rgba(255,0,0,0.2)' }}>
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%', padding: '15px', borderRadius: '12px', border: 'none',
              background: loading ? '#333' : 'linear-gradient(90deg, #7928ca, #ff0080)',
              color: '#fff', fontWeight: 'bold', fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: '0.3s',
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
              opacity: loading ? 0.8 : 1,
              boxShadow: loading ? 'none' : '0 5px 20px rgba(255, 0, 128, 0.4)'
            }}
          >
            {loading ? (
              <>
                <div className="spinner"></div> Đang mở cửa...
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>
      </div>
    </>
  );
}
