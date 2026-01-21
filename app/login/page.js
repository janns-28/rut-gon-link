'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Gửi pass lên server kiểm tra (chứ không kiểm tra ở đây)
    const res = await fetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ password }),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (data.success) {
      // Nếu đúng, server đã tự gắn cookie rồi, giờ chỉ cần chuyển trang
      router.push('/dashboard');
    } else {
      setError('Sai mật khẩu rồi ní ơi!');
    }
  };

  return (
    <div style={{
      height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
      background: '#000', color: '#fff', fontFamily: 'sans-serif'
    }}>
      <form onSubmit={handleSubmit} style={{
        padding: '40px', border: '1px solid #333', borderRadius: '20px',
        background: '#111', width: '300px', textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '20px' }}>🔒 Admin Access</h2>
        <input 
          type="password" 
          placeholder="Nhập mật khẩu..." 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%', padding: '12px', marginBottom: '15px',
            borderRadius: '8px', border: '1px solid #333', background: '#000', color: '#fff'
          }}
        />
        {error && <p style={{ color: 'red', fontSize: '0.8rem', marginBottom: '10px' }}>{error}</p>}
        <button type="submit" style={{
          width: '100%', padding: '12px', borderRadius: '8px', border: 'none',
          background: '#fff', color: '#000', fontWeight: 'bold', cursor: 'pointer'
        }}>
          Đăng nhập
        </button>
      </form>
    </div>
  );
}
