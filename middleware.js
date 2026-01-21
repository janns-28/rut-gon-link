// update redis connection
import { NextResponse } from 'next/server'
import Papa from 'papaparse'
import { kv } from '@vercel/kv'

// Link Sheet của mày
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRn2N1dQ2i7RfA9cwW3g-tIKHd1soMoJGc3HaZv9rhdzDUPSCdtZy9W0QSGwopcV15bDDPld82GQ-oB/pub?output=csv'; 

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const slug = pathname.slice(1);

  // 1. Bỏ qua các file hệ thống
  if (!slug || slug.startsWith('_next') || slug.startsWith('api') || slug === 'favicon.ico' || slug === 'login') {
    return NextResponse.next();
  }

  // 2. NHIỆM VỤ BẢO VỆ DASHBOARD (Giữ nguyên)
  if (pathname.startsWith('/dashboard')) {
    const adminToken = request.cookies.get('admin_token');
    if (!adminToken) return NextResponse.redirect(new URL('/login', request.url));
    return NextResponse.next();
  }

  try {
    // --- BƯỚC 1: CHECK REDIS (CACHE) TRƯỚC ---
    // Tốc độ phản hồi cực nhanh (< 50ms)
    const cachedUrl = await kv.get(slug);
    
    if (cachedUrl) {
      // Nếu có trong cache -> Chuyển hướng luôn, không cần hỏi Google
      return NextResponse.redirect(new URL(cachedUrl));
    }

    // --- BƯỚC 2: NẾU KHÔNG CÓ TRONG CACHE -> HỎI GOOGLE SHEET ---
    const response = await fetch(`${SHEET_CSV_URL}&t=${Date.now()}`, { 
      next: { revalidate: 0 },
      headers: { 'Cache-Control': 'no-store' }
    });
    
    const csvText = await response.text();
    const parsed = Papa.parse(csvText, { header: false });
    
    // Tìm link trong file CSV
    const foundRow = parsed.data.find(row => row[0]?.trim() === slug);

    if (foundRow && foundRow[1]) {
      const targetUrl = foundRow[1].trim();

      // --- BƯỚC 3: LƯU NGƯỢC VÀO REDIS ---
      // Lưu lại để lần sau khách vào là có ngay
      // ex: 60 => Chỉ lưu trong 60 giây. 
      // Giúp link tự động cập nhật sau 1 phút nếu mày có sửa bên Sheet.
      await kv.set(slug, targetUrl, { ex: 60 });

      return NextResponse.redirect(new URL(targetUrl));
    }

  } catch (error) {
    console.error('Lỗi Middleware:', error);
  }

  return NextResponse.next();
}
