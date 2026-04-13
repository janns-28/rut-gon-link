'use client';
import React, { useState, useEffect } from 'react';

// TRANG CHỦ NGỤY TRANG (DECOY PAGE) CHUYÊN TRỊ BOT QUÉT ADS
export default function DecoyFinanceBlog() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    document.title = 'BinhTienTi - Giải Pháp Tài Chính Công Nghệ';
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}></div>;

  return (
    <main style={st.viewport}>
      {/* Thanh điều hướng uy tín */}
      <nav style={st.navbar}>
        <div style={st.navContent}>
          <div style={st.logo}>BTT-Finance</div>
          <div style={st.menu}>
            <span style={st.menuItem}>Trang chủ</span>
            <span style={st.menuItem}>Kiến thức</span>
            <span style={st.menuItem}>Liên hệ</span>
          </div>
        </div>
      </nav>

      {/* Nội dung báo mạng */}
      <div style={st.container}>
        <h1 style={st.articleTitle}>Xu hướng Tài chính Công nghệ (Fintech) năm 2026: Cơ hội và Thách thức</h1>
        <p style={st.meta}>Tác giả: BinhTienTi • Xuất bản: Hôm nay</p>
        
        <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80" alt="Fintech" style={st.articleImage} />

        <div style={st.articleContent}>
          <p style={st.paragraph}>Ngành công nghệ tài chính (Fintech) đang trải qua một giai đoạn chuyển mình mạnh mẽ. Sự kết hợp giữa AI, Blockchain và hệ thống thanh toán di động đã tạo ra những bước ngoặt lớn trong cách người tiêu dùng tiếp cận các khoản vay và quản lý tài sản cá nhân.</p>
          <p style={st.paragraph}>Theo báo cáo mới nhất, việc ứng dụng trí tuệ nhân tạo (AI) trong phân tích rủi ro tín dụng giúp giảm thiểu tới 40% tỷ lệ nợ xấu, đồng thời tăng tốc độ giải ngân lên gấp 3 lần so với các tổ chức tài chính truyền thống.</p>
          <h2 style={st.subHeading}>Cơ hội cho người tiêu dùng</h2>
          <p style={st.paragraph}>Giờ đây, người tiêu dùng không cần phải đến trực tiếp ngân hàng để đăng ký các khoản vay nhỏ. Thông qua các ứng dụng di động, quá trình xác minh danh tính điện tử (eKYC) chỉ mất chưa tới 5 phút. Sự tiện lợi này mở ra cơ hội tiếp cận vốn nhanh chóng cho hàng triệu người chưa có lịch sử tín dụng.</p>
        </div>
      </div>

      <footer style={st.footer}>
        <p>© 2026 BTT-Finance. Mọi bản quyền được bảo lưu.</p>
      </footer>

      <style jsx global>{`
        body { margin: 0; background: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1f2937; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </main>
  );
}

const st = {
  viewport: { minHeight: '100vh', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.5s ease-out' },
  navbar: { background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 0', position: 'sticky', top: 0, zIndex: 10 },
  navContent: { maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' },
  logo: { fontSize: '20px', fontWeight: '800', color: '#111827', letterSpacing: '-0.5px' },
  menu: { display: 'flex', gap: '20px' },
  menuItem: { fontSize: '14px', fontWeight: '500', color: '#6b7280', cursor: 'pointer' },
  
  container: { maxWidth: '800px', margin: '40px auto', padding: '0 20px', flex: 1 },
  articleTitle: { fontSize: '32px', fontWeight: '800', lineHeight: '1.3', marginBottom: '16px', color: '#111827' },
  meta: { fontSize: '14px', color: '#6b7280', marginBottom: '32px' },
  articleImage: { width: '100%', height: 'auto', borderRadius: '12px', marginBottom: '40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  
  articleContent: { fontSize: '18px', lineHeight: '1.7', color: '#374151' },
  paragraph: { marginBottom: '24px' },
  subHeading: { fontSize: '24px', fontWeight: '700', marginTop: '40px', marginBottom: '16px', color: '#111827' },
  
  footer: { background: '#fff', borderTop: '1px solid #e5e7eb', padding: '32px 0', textAlign: 'center', color: '#9ca3af', fontSize: '14px', marginTop: '60px' }
};
