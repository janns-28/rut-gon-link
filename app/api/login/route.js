import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    // Tên đăng nhập và Mật khẩu (Nên đổi pass và đưa vào Vercel Environment)
    const validUser = 'binhtienti';
    const validPass = process.env.ADMIN_PASSWORD || 'chayso123';

    if (username === validUser && password === validPass) {
      // Cấp cho trình duyệt một cái "Thẻ ra vào" (Cookie) có thời hạn 7 ngày
      cookies().set('admin_session', 'true', { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 ngày
        path: '/'
      });
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ success: false, message: 'Sai tài khoản hoặc mật khẩu!' }, { status: 401 });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}
