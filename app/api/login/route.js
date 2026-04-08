// FILE: app/api/login/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    const validUsername = process.env.ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD;

    if (username === validUsername && password === validPassword) {
      const response = NextResponse.json({ success: true });
      
      // Gắn cookie an toàn từ phía Server
      response.cookies.set({
        name: 'admin_session',
        value: password, // Trong thực tế nên dùng JWT, nhưng để mày dễ code tao gán thẳng, đã ẩn HttpOnly
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // Sống 7 ngày
      });

      return response;
    }

    return NextResponse.json({ success: false, message: 'Sai tài khoản hoặc mật khẩu' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}
