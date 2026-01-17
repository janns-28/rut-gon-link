import { NextResponse } from 'next/server'
import Papa from 'papaparse'

// --- LINK CSV CỦA MÀY (GIỮ NGUYÊN) ---
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRn2N1dQ2i7RfA9cwW3g-tIKHd1soMoJGc3HaZv9rhdzDUPSCdtZy9W0QSGwopcV15bDDPld82GQ-oB/pub?output=csv'; 
// ------------------------------------------

export async function middleware(request) {
  const slug = request.nextUrl.pathname.slice(1);

  if (!slug || slug.startsWith('_next') || slug.startsWith('api') || slug === 'favicon.ico') {
    return NextResponse.next();
  }

  try {
    // NÂNG CẤP 1: Thêm tham số &t=... để ép lấy dữ liệu mới nhất, không dùng bản cũ
    const response = await fetch(`${SHEET_CSV_URL}&t=${Date.now()}`, { 
      next: { revalidate: 0 },
      headers: { 'Cache-Control': 'no-store' }
    });
    
    const csvText = await response.text();
    const parsed = Papa.parse(csvText, { header: false });
    const data = parsed.data;

    // NÂNG CẤP 2: Thêm .trim() để cắt khoảng trắng thừa nếu lỡ tay gõ nhầm trong Sheet
    // Ví dụ: "test2 " sẽ tự sửa thành "test2"
    const foundRow = data.find(row => row[0]?.trim() === slug);

    if (foundRow && foundRow[1]) {
      // Chuyển hướng sang link gốc (cũng cắt khoảng trắng luôn cho chắc)
      return NextResponse.redirect(new URL(foundRow[1].trim()));
    }
  } catch (error) {
    console.error('Lỗi:', error);
  }

  return NextResponse.next();
}
