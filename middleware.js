import { NextResponse } from 'next/server'
import Papa from 'papaparse'

// --- THAY LINK CSV CỦA MÀY VÀO DƯỚI ĐÂY ---
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRn2N1dQ2i7RfA9cwW3g-tIKHd1soMoJGc3HaZv9rhdzDUPSCdtZy9W0QSGwopcV15bDDPld82GQ-oB/pub?output=csv'; 
// ------------------------------------------

export async function middleware(request) {
  const slug = request.nextUrl.pathname.slice(1); // Lấy phần tên sau dấu /

  // Bỏ qua nếu vào trang chủ hoặc file hệ thống
  if (!slug || slug.startsWith('_next') || slug.startsWith('api') || slug === 'favicon.ico') {
    return NextResponse.next();
  }

  try {
    // 1. Tải dữ liệu từ Sheet
    const response = await fetch(SHEET_CSV_URL, { next: { revalidate: 0 } });
    const csvText = await response.text();

    // 2. Đọc file CSV
    const parsed = Papa.parse(csvText, { header: false });
    const data = parsed.data;

    // 3. Tìm link (Cột 0 là Slug, Cột 1 là Link gốc)
    const foundRow = data.find(row => row[0] === slug);

    if (foundRow && foundRow[1]) {
      // 4. Chuyển hướng
      return NextResponse.redirect(new URL(foundRow[1]));
    }
  } catch (error) {
    console.error('Lỗi:', error);
  }

  return NextResponse.next();
}
