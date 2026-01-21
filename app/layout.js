export const metadata = {
  title: 'Link Shortener',
  description: 'Rut gon link sieu toc',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
