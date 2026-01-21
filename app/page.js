'use client'; // <-- DÒNG NÀY LÀ QUAN TRỌNG NHẤT ĐỂ HẾT BÁO ĐỎ

export default function Home() {
  const botUsername = "8299092137"; // Bác có thể thay bằng Username thật của Bot (ví dụ: MyShortenerBot)

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      textAlign: 'center'
    }}>
      {/* Hero Section */}
      <div style={{ maxWidth: '800px' }}>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: '800',
          marginBottom: '20px',
          background: 'linear-gradient(to right, #007cf0, #00dfd8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Rút Gọn Link Siêu Tốc
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#888', marginBottom: '40px', lineHeight: '1.6' }}>
          Giải pháp rút gọn liên kết thông minh, tích hợp trực tiếp với Telegram. 
          Nhanh chóng, an toàn và hoàn toàn miễn phí.
        </p>

        {/* CTA Button */}
        <a 
          href={`https://t.me/${botUsername}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '16px 32px',
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#000',
            backgroundColor: '#fff',
            borderRadius: '50px',
            textDecoration: 'none',
            boxShadow: '0 4px 14px 0 rgba(255, 255, 255, 0.39)'
          }}
        >
          Bắt đầu ngay trên Telegram 🚀
        </a>
      </div>

      {/* Features Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        maxWidth: '1000px',
        marginTop: '80px',
        width: '100%'
      }}>
        <div style={{ padding: '30px', backgroundColor: '#111', borderRadius: '16px', border: '1px solid #222', textAlign: 'left' }}>
          <div style={{ fontSize: '2rem', marginBottom: '15px' }}>⚡</div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#fff' }}>Tốc độ tức thì</h3>
          <p style={{ color: '#666', lineHeight: '1.5' }}>Rút gọn link chỉ trong 1 giây ngay trên khung chat Telegram.</p>
        </div>
        <div style={{ padding: '30px', backgroundColor: '#111', borderRadius: '16px', border: '1px solid #222', textAlign: 'left' }}>
          <div style={{ fontSize: '2rem', marginBottom: '15px' }}>📊</div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#fff' }}>Quản lý dễ dàng</h3>
          <p style={{ color: '#666', lineHeight: '1.5' }}>Lưu trữ an toàn trên hệ thống Database Supabase mạnh mẽ.</p>
        </div>
        <div style={{ padding: '30px', backgroundColor: '#111', borderRadius: '16px', border: '1px solid #222', textAlign: 'left' }}>
          <div style={{ fontSize: '2rem', marginBottom: '15px' }}>🛡️</div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#fff' }}>Bảo mật tuyệt đối</h3>
          <p style={{ color: '#666', lineHeight: '1.5' }}>Mọi liên kết được mã hóa và bảo vệ bằng công nghệ hiện đại.</p>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', padding: '40px 0', color: '#444', fontSize: '0.9rem' }}>
        © 2026 {botUsername}. Build with Next.js & Supabase.
      </footer>
    </div>
  );
}
