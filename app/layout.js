// app/layout.js
export const metadata = {
  title: 'Welcome System',
  description: 'Access Point',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Mấu chốt ở đây: Tao ép màu nền đen ngay từ server */}
      <body style={{ 
        backgroundColor: '#000000', 
        color: '#ffffff', 
        margin: 0, 
        padding: 0 
      }}>
        {children}
      </body>
    </html>
  )
}
