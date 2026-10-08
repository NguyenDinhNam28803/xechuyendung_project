import Link from "next/link";

const vehicleLinks = [
  { href: "/xe?loai=xe-tai", label: "Xe tải" },
  { href: "/xe?loai=xe-chua-chay", label: "Xe chữa cháy" },
  { href: "/xe?loai=xe-cuu-ho", label: "Xe cứu hộ" },
  { href: "/xe?loai=xe-bon-moi-truong", label: "Xe bồn / xe môi trường" },
];

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-about">
          <Link className="brand" href="/">
            <span className="brand-mark"><span /></span>
            <span className="brand-name">XE CHUYÊN DỤNG<span>.VN</span><small>GIẢI PHÁP VẬN TẢI</small></span>
          </Link>
          <p>Thông tin dòng xe và nội dung trên website đang được hoàn thiện. Vui lòng xác nhận cấu hình và báo giá với đơn vị tư vấn trước khi quyết định.</p>
        </div>
        <div className="footer-column">
          <h2>Danh mục xe</h2>
          {vehicleLinks.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
        </div>
        <div className="footer-column">
          <h2>Thông tin</h2>
          <Link href="/gioi-thieu">Giới thiệu</Link>
          <Link href="/dich-vu">Dịch vụ</Link>
          <Link href="/tu-van-mua-xe">Tư vấn mua xe</Link>
          <Link href="/tin-tuc">Kiến thức</Link>
          <Link href="/chinh-sach">Chính sách</Link>
        </div>
        <div className="footer-contact">
          <h2>Cần tư vấn?</h2>
          <p>Gửi nhu cầu để được định hướng dòng xe và cấu hình cần tìm.</p>
          <Link href="/lien-he">Gửi yêu cầu tư vấn <span aria-hidden="true">→</span></Link>
          <small>Hotline, email và địa chỉ showroom sẽ được cập nhật sau khi xác nhận.</small>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© Xe Chuyên Dụng. Nội dung mẫu đang trong quá trình hoàn thiện.</span>
        <Link href="/lien-he">Liên hệ</Link>
      </div>
    </footer>
  );
}
