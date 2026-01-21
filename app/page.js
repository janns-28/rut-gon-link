'use client';

export default function Home() {
  const botLink = "https://t.me/8299092137"; // Link tới con Bot của bác

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#050505',
      backgroundImage: `
        radial-gradient(circle at 20% 30%, rgba(0, 124, 240, 0.15) 0%, transparent 40%),
        radial-gradient(circle at 80% 70%, rgba(0, 223, 216, 0.15) 0%, transparent 40%)
      `,
      fontFamily: '-apple-system, system-ui, sans-serif',
      margin: 0,
      overflow: 'hidden'
    }}>
      {/* Khung kính mờ (Glassmorphism Card) */}
      <div style={{
        padding: '60px 80px',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '32px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        textAlign: 'center',
        animation: 'slideUp 1s ease-out'
      }}>
        <h1 style={{
          fontSize: '4.5rem',
          fontWeight: '800',
          margin: 0,
          background: 'linear-gradient(180deg, #FFFFFF 0%, #A2A2A2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.04em'
        }}>
          Welcome
        </h1>
        
        <p style={{
          color: '#888',
          fontSize: '1.1rem',
          marginTop: '15px',
          fontWeight: '400',
          maxWidth: '300px',
          lineHeight: '1.6'
        }}>
          Hệ thống rút gọn liên kết thông minh đã sẵn sàng phục vụ bạn.
        </p>

        {/* Nút bấm tinh tế */}
        <a 
          href={botLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            marginTop: '35px',
            padding: '12px 28px',
            background: '#fff',
            color: '#000',
            borderRadius: '12px',
            fontSize: '0.95rem',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'all 0.3s ease'
          }}
        >
          Trải nghiệm ngay ⚡
        </a>
      </div>

      <style jsx global>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        body { margin: 0; }
      `}</style>
    </div>
  );
}
