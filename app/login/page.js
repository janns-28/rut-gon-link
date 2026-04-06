'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AppleStyleLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Nạp phông chữ Inter chuẩn Apple
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
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
        router.push('/admin');
      } else {
        setError(data.message || 'Thông tin không chính xác');
      }
    } catch (err) {
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return <div style={{ backgroundColor: '#000', minHeight: '100vh' }}></div>;

  return (
    <main style={st.viewport}>
      {/* Mesh Gradient nền cực sâu */}
      <div style={st.meshBG}></div>

      <div style={st.loginStack}>
        {/* Biểu tượng hoặc Tiêu đề */}
        <header style={st.header}>
          <div style={st.logo}>B</div>
          <h1 style={st.title}>Đăng nhập Hệ thống</h1>
          <p style={st.subtitle}>Quản trị viên chiến dịch</p>
        </header>

        {/* Form nhập liệu */}
        <form onSubmit={handleLogin} style={st.form}>
          <div style={st.inputGroup}>
            <input
              type="text"
              placeholder="Tài khoản"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={st.input}
              required
            />
            <div style={st.inputDivider}></div>
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={st.input}
              required
            />
          </div>

          {error && <p style={st.errorMsg}>{error}</p>}

          <button type="submit" disabled={loading} style={st.button}>
            {loading ? 'Đang xác thực...' : 'Tiếp tục'}
          </button>
        </form>

        <footer style={st.footer}>
          <p style={st.footerText}>Bảo mật bởi chuẩn mã hóa Apple Style</p>
        </footer>
      </div>

      <style jsx global>{`
        body { margin: 0; background: #000; overflow: hidden; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
        input:focus { outline: none; }
        @keyframes reveal {
          from { opacity: 0; transform: translateY(20px); filter: blur(15px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
      `}</style>
    </main>
  );
}

const st = {
  viewport: { height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', position: 'relative' },
  meshBG: { position: 'absolute', inset: 0, zIndex: 0, background: 'radial-gradient(at 50% 50%, #161618 0%, #000 80%)', opacity: 0.8 },
  
  loginStack: {
    zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    width: '100%', maxWidth: '380px', padding: '0 20px',
    animation: 'reveal 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
  },

  header: { textAlign: 'center', marginBottom: '40px' },
  logo: { 
    width: '60px', height: '60px', background: 'linear-gradient(180deg, #2c2c2e 0%, #000 100%)', 
    borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', 
    margin: '0 auto 20px auto', fontSize: '24px', fontWeight: '800', color: '#fff',
    border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
  },
  title: { color: '#fff', fontSize: '24px', fontWeight: '600', letterSpacing: '-0.5px', margin: '0 0 8px 0' },
  subtitle: { color: 'rgba(255,255,255,0.4)', fontSize: '14px', fontWeight: '400', margin: 0 },

  form: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  
  // Cụm Input gộp lại kiểu iOS
  inputGroup: {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '14px', overflow: 'hidden', marginBottom: '20px', backdropFilter: 'blur(20px)'
  },
  input: {
    width: '100%', background: 'transparent', border: 'none', padding: '16px 20px',
    color: '#fff', fontSize: '16px', boxSizing: 'border-box', fontFamily: 'inherit'
  },
  inputDivider: { height: '1px', width: '90%', background: 'rgba(255,255,255,0.05)', margin: '0 auto' },

  errorMsg: { color: '#ff453a', fontSize: '13px', fontWeight: '500', marginBottom: '15px', textAlign: 'center' },

  button: {
    width: '44px', height: '44px', borderRadius: '50%', background: '#fff', border: 'none',
    color: '#000', fontSize: '20px', cursor: 'pointer', display: 'flex', 
    justifyContent: 'center', alignItems: 'center', transition: 'all 0.3s',
    boxShadow: '0 4px 12px rgba(255,255,255,0.2)', fontWeight: 'bold'
  },
  // Tui đổi nút login thành một cái nút tròn có mũi tên (hoặc chữ Tiếp tục) cực kỳ tinh tế
  button: {
    width: '100%', padding: '14px', borderRadius: '14px', background: '#fff', border: 'none',
    color: '#000', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
    boxShadow: '0 4px 15px rgba(255,255,255,0.1)'
  },

  footer: { marginTop: '60px', opacity: 0.3 },
  footerText: { color: '#fff', fontSize: '11px', fontWeight: '500', letterSpacing: '1px', textTransform: 'uppercase' }
};
