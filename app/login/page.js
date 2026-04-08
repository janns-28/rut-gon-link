// FILE: app/login/page.js
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
        // Cookie đã được gài từ Server. Mày chỉ việc đẩy nó vào admin thôi.
        router.push('/admin');
        router.refresh();
      } else {
        setError(data.message || 'Sai thông tin đăng nhập');
      }
    } catch (err) { 
      setError('Lỗi kết nối hệ thống'); 
    } finally { 
      setLoading(false); 
    }
  };

  if (!mounted) return <div style={{ backgroundColor: '#000', minHeight: '100vh' }}></div>;

  // ... (GIỮ NGUYÊN TOÀN BỘ PHẦN HTML VÀ CSS BÊN DƯỚI CỦA MÀY TỪ <main style={st.viewport}> TRỞ XUỐNG) ...
