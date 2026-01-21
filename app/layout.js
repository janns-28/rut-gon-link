// app/layout.js
export const metadata = {
  title: 'Welcome',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Ép cứng màu nền đen và full màn hình ngay tại đây */}
      <body style={{
        backgroundColor: '#000000',
        color: '#ffffff',
        margin: 0,
        padding: 0,
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {children}
      </body>
    </html>
  )
}
