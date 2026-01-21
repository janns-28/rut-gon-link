export const metadata = {
  title: 'Welcome System',
  description: 'System Entry Point',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Tao ép màu đen cứng ở đây luôn, load phát là đen ngay */}
      <body style={{ backgroundColor: '#000000', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
