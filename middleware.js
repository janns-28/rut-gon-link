import { NextResponse } from 'next/server'
import Papa from 'papaparse'

// URL Sheet của mày (Giữ nguyên)
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRn2N1dQ2i7RfA9cwW3g-tIKHd1soMoJGc3HaZv9rhdzDUPSCdtZy9W0QSGwopcV15bDDPld82GQ-oB/pub?output=csv'; 

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // --- NHIỆM VỤ 1: BẢO VỆ DASHBOARD ---
  // Nếu cố tình vào dashboard mà không có cookie 'admin_token'
  if (pathname.startsWith('/dashboard')) {
    const adminToken = request.cookies.get('admin_token');
    
    // Không có thẻ bài -> Đá về trang login
    if (!adminToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // --- NHIỆM VỤ 2: XỬ LÝ LINK RÚT GỌN (Code cũ) ---
  // Bỏ qua các file hệ thống
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname === '/favicon.ico' || 
    pathname === '/login' || // Đừng chặn trang login
    pathname === '/'         // Đừng chặn trang chủ
  ) {
    return NextResponse.next();
  }

  // Logic đọc CSV cũ của mày
  try {
    const slug = pathname.slice(1);
    if (!slug) return NextResponse.next();

    const response = await fetch(`${SHEET_CSV_URL}&t=${Date.now()}`, { 
      next: { revalidate: 0 },
      headers: { 'Cache-Control': 'no-store' }
    });
    
    const csvText = await response.text();
    const parsed = Papa.parse(csvText, { header: false });
    const data = parsed.data;
    const foundRow = data.find(row => row[0]?.trim() === slug);

    if (foundRow && foundRow[1]) {
      return NextResponse.redirect(new URL(foundRow[1].trim()));
    }
  } catch (error) {
    console.error('Lỗi middleware:', error);
  }

  return NextResponse.next();
}
