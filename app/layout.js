// app/layout.js

// QUAN TRỌNG: Dòng này để gọi file CSS vào
import './globals.css'; 

export const metadata = {
  title: 'Welcome System',
  description: 'Access Point',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
