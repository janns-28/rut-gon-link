'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (res.ok) {
      router.push('/admin'); // Đăng nhập đúng thì bế thẳng vào Dashboard
    } else {
      const data = await res.json();
      setError(data.message || 'Đăng nhập thất bại');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#09090b', fontFamily: '"Inter", system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '40px', backgroundColor: '#111318', borderRadius: '24px', border: '1px solid #1f2937', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff', fontSize: '1.5rem', margin: '0 auto 16px auto' }}>B</div>
          <h1 style={{ fontSize: '1.5rem', color: '#f8fafc', margin: '0 0 8px 0' }}>Đăng nhập Hệ Thống</h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>Chỉ dành cho quản trị viên chiến dịch</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px', fontWeight: '500' }}>Tài khoản</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #374151', background: '#0f1115', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.borderColor = '#6366f1'}
              onBlur={(e) => e.target.style.borderColor = '#374151'}
            />
          </div>
          <div>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '8px', fontWeight: '500' }}>Mật khẩu</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #374151', background: '#0f1115', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box' }}
              onFocus={(e) => e.target.style.borderColor = '#6366f1'}
              onBlur={(e) => e.target.style.borderColor = '#374151'}
            />
          </div>

          {error && <div style={{ color: '#fca5a5', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center', border: '1px solid #7f1d1d' }}>{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            style={{ marginTop: '10px', background: loading ? '#4f46e5' : '#6366f1', color: '#fff', padding: '14px', borderRadius: '12px', border: 'none', fontSize: '1rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
          </button>
        </form>
      </div>
      <style jsx global>{`body { margin: 0; }`}</style>
    </div>
  );
}
