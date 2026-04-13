'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ModernAppleLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    setMounted(true);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      
      if (data.success) {
        // Ghi chìa khóa vào trình duyệt
        document.cookie = `admin_key=${password}; path=/; max-age=86400`;
        
        // DÙNG LỆNH NÀY ĐỂ DIỆT LỖI: Ép trình duyệt load lại hoàn toàn (Hard Reload)
        // Đảm bảo Middleware sẽ nhận được Cookie ngay lập tức ở request tiếp theo
        window.location.href = '/admin';
      }
      else {
        setError(data.message || 'Sai thông tin đăng nhập');
      }
    } catch (err) { 
      setError('Lỗi kết nối hệ thống'); 
    } finally { 
      setLoading(false); 
    }
  };

  if (!mounted) return <div style={{ backgroundColor: '#000', minHeight: '100vh' }}></div>;

  return (
    <main style={st.viewport}>
      <div style={st.container}>
        
        {/* Apple Style Squircle Logo */}
        <div style={st.logoBox}>
          <div style={st.logo}>B</div>
        </div>

        <h1 style={st.title}>Đăng nhập với ID của bạn</h1>
        <p style={st.subtitle}>Sử dụng tài khoản quản trị để tiếp tục.</p>

        <form onSubmit={handleLogin} style={st.form}>
          <div style={st.inputWrapper}>
            <input
              type="text"
              placeholder="Tài khoản"
              style={st.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div style={st.inputWrapper}>
            <input
              type="password"
              placeholder="Mật khẩu"
              style={st.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p style={st.errorText}>{error}</p>}

          <div style={st.buttonWrapper}>
            <button type="submit" disabled={loading} style={st.button}>
              {loading ? (
                <div className="spinner"></div>
              ) : (
                <span style={st.buttonText}>Tiếp tục</span>
              )}
            </button>
          </div>
        </form>

        <footer style={st.footer}>
          <a href="#" style={st.footerLink}>Quên mật khẩu?</a>
          <div style={st.divider}></div>
          <p style={st.footerNote}>Nền tảng quản trị chiến dịch bảo mật.</p>
        </footer>
      </div>

      <style jsx global>{`
        body { margin: 0; background: #000; font-family: 'Inter', -apple-system, sans-serif; overflow: hidden; }
        input:focus { border-color: #0071e3 !important; box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.15) !important; }
        .spinner {
          width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%; animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </main>
  );
}

const st = {
  viewport: { height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  container: { width: '100%', maxWidth: '340px', textAlign: 'center', animation: 'fadeIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)' },
  
  logoBox: { marginBottom: '30px', display: 'flex', justifyContent: 'center' },
  logo: {
    width: '72px', height: '72px', background: '#1d1d1f', borderRadius: '18px',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    fontSize: '32px', fontWeight: '800', color: '#fff', border: '1px solid rgba(255,255,255,0.05)'
  },

  title: { color: '#f5f5f7', fontSize: '28px', fontWeight: '600', letterSpacing: '-0.8px', margin: '0 0 12px 0' },
  subtitle: { color: '#86868b', fontSize: '15px', fontWeight: '400', marginBottom: '40px', letterSpacing: '-0.1px' },

  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  inputWrapper: { width: '100%' },
  input: {
    width: '100%', padding: '16px 18px', borderRadius: '12px', background: '#121212',
    border: '1px solid #424245', color: '#fff', fontSize: '16px', boxSizing: 'border-box',
    transition: 'all 0.2s ease', fontFamily: 'inherit'
  },

  errorText: { color: '#ff453a', fontSize: '13px', marginTop: '5px', fontWeight: '500' },

  buttonWrapper: { marginTop: '25px', display: 'flex', justifyContent: 'center' },
  button: {
    width: '100%', padding: '16px', borderRadius: '12px', background: '#0071e3', border: 'none',
    cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center',
    transition: 'background 0.2s ease'
  },
  buttonText: { color: '#fff', fontSize: '16px', fontWeight: '600', letterSpacing: '-0.2px' },

  footer: { marginTop: '50px' },
  footerLink: { color: '#0071e3', fontSize: '14px', textDecoration: 'none', fontWeight: '400' },
  divider: { height: '1px', width: '100%', background: '#262626', margin: '25px 0' },
  footerNote: { color: '#424245', fontSize: '12px', fontWeight: '500', letterSpacing: '0.5px' }
};
