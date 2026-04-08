import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    
    const validUser = 'binhtienti';
    const validPass = process.env.ADMIN_PASSWORD || 'chayso123';

    if (username === validUser && password === validPass) {
      // FIX CHO NEXT.JS 15: Phải có chữ 'await' ở đây thì nó mới không sập server
      const cookieStore = await cookies();
      
      cookieStore.set('admin_session', 'true', { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 ngày
        path: '/'
      });
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ success: false, message: 'Sai tài khoản hoặc mật khẩu!' }, { status: 401 });
  } catch (e) {
    console.error("LỖI API LOGIN:", e);
    // Nhả luôn cái lỗi chi tiết ra màn hình để biết đường mà mò nếu bị lại
    return NextResponse.json({ success: false, message: 'Lỗi server: ' + e.message }, { status: 500 });
  }
}
