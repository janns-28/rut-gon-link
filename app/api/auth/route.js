import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body;

    // So sánh pass gửi lên với pass trong server
    if (password === process.env.ADMIN_PASSWORD) {
      
      const response = NextResponse.json({ success: true });
      
      // Gắn 'thẻ bài' Cookie vào trình duyệt
      // httpOnly: true => JavaScript không đọc trộm được
      response.cookies.set('admin_token', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // Lưu đăng nhập 7 ngày
      });

      return response;
    }

    return NextResponse.json({ success: false, message: 'Sai mật khẩu!' }, { status: 401 });
  } catch (e) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
