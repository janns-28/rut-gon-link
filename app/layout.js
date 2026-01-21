export const metadata = {
  title: 'Chúc Mừng Năm Mới 2026',
  description: 'Xuân Bính Ngọ - Vạn Sự Như Ý',
}

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  )
}
