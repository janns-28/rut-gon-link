import './globals.css'; // Dòng quan trọng nhất để diệt chớp trắng

export const metadata = {
  title: '#BINHTIENTI',
  description: 'Chức mừng năm mới',
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body style={{ backgroundColor: '#0f1115' }}>
        {children}
      </body>
    </html>
  )
}
