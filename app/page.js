'use client';

export default function Home() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'radial-gradient(circle at center, #111 0%, #000 100%)',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      margin: 0,
      overflow: 'hidden'
    }}>
      {/* Hiệu ứng đổ bóng mờ ảo phía sau */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: 'rgba(0, 124, 240, 0.2)',
        filter: 'blur(100px)',
        borderRadius: '50%',
        zIndex: 0
      }}></div>

      <h1 style={{
        fontSize: 'clamp(3rem, 10vw, 6rem)',
        fontWeight: '800',
        letterSpacing: '-0.05em',
        margin: 0,
        background: 'linear-gradient(to bottom, #fff 40%, #888 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: 'fadeInUp 1.2s ease-out forwards',
        zIndex: 1
      }}>
        Welcome
      </h1>
      
      <p style={{
        fontSize: '1.1rem',
        color: '#666',
        marginTop: '10px',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        fontWeight: '300',
        animation: 'fadeIn 2s ease-out forwards',
        zIndex: 1
      }}>
        Simple • Fast • Reliable
      </p>

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
