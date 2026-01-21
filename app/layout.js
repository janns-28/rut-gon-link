// app/layout.js
export const metadata = {
  title: 'Welcome System',
  description: 'Access Point',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={{ height: '100%' }}>
      {/* Tao thêm height: 100% vào đây để nó bung lụa hết màn hình */}
      <body style={{ 
        backgroundColor: '#000000', 
        color: 'white',
        margin: 0, 
        padding: 0, 
        height: '100%', 
        width: '100%',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {children}
      </body>
    </html>
  )
}
