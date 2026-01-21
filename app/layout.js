// app/layout.js
import './globals.css'; // <--- KHÔNG CÓ DÒNG NÀY LÀ NÓ SẼ BỊ TRẮNG

export const metadata = {
  title: 'Welcome',
  description: 'System Entry',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
