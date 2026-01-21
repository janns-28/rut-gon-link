'use client';

export default function Home() {
  const botLink = "https://t.me/8299092137"; // Link tới Telegram Bot của bác

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'radial-gradient(circle at center, #8B0000 0%, #2a0000 100%)', // Màu đỏ rượu vang sang trọng
      color: '#fff',
      fontFamily: '"Inter", -apple-system, sans-serif',
      margin: 0,
      overflow: 'hidden',
      position: 'relative'
    }}>
      
      {/* Hiệu ứng hoa mai rơi (nhẹ nhàng, không làm rối mắt) */}
      <div className="petals-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {[...Array(15)].map((_, i) => (
          <div key={i} className="petal" style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            opacity: 0.6
          }}>🌸</div>
        ))}
      </div>

      {/* Nội dung chính */}
      <div style={{
        textAlign: 'center',
        zIndex: 1,
        padding: '40px',
        border: '1px solid rgba(255, 215, 0, 0.2)', // Viền vàng kim mờ
        borderRadius: '24px',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <p style={{ letterSpacing: '0.5em', fontSize: '0.9rem', color: '#FFD700', marginBottom: '10px' }}>
          HAPPY LUNAR NEW YEAR
        </p>
        
        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 5rem)',
          fontWeight: '900',
          margin: 0,
          background: 'linear-gradient(to bottom, #FFD700, #B8860B)', // Gradient vàng kim
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 10px 20px rgba(0,0,0,0.5)'
        }}>
          2026
        </h1>

        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '300',
          marginTop: '10px',
          color: '#f0f0f0'
        }}>
          Chúc Mừng Năm Mới
        </h2>

        <div style={{
          width: '50px',
          height: '2px',
          background: '#FFD700',
          margin: '30px auto'
        }}></div>

        <p style={{ color: '#ccc', fontSize: '1.1rem', fontStyle: 'italic' }}>
          "An Khang Thịnh Vượng • Vạn Sự Như Ý"
        </p>

        {/* Nút bấm tinh tế */}
        <a 
          href={botLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            marginTop: '40px',
            padding: '14px 35px',
            background: 'linear-gradient(45deg, #FFD700, #DAA520)',
            color: '#000',
            borderRadius: '50px',
            fontSize: '1rem',
            fontWeight: '700',
            textDecoration: 'none',
            boxShadow: '0 10px 20px rgba(218, 165, 32, 0.3)',
            transition: 'transform 0.3s'
          }}
        >
          Khai Xuân Rút Lộc 🧧
        </a>
      </div>

      <style jsx global>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        .petal {
          font-size: 20px;
          animation: fall 10s linear infinite;
        }
        body { margin: 0; background: #000; }
      `}</style>
    </div>
  );
}
