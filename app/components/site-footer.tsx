import Link from "next/link";
import { CONTACT_NAME, EMAIL, MAIN_ACTION, MAIN_HREF, PHONE, PHONE_LABEL } from "./site-constants";

/* Phần kết của mọi trang: close-type + footer-dark trên nền đảo (giống trang chủ). */
type SiteFooterProps = {
  /** Tiêu đề lời mời cuối trang; mặc định là hành động chính. */
  title?: string;
  text?: string;
  /** Đường dẫn của nút, ví dụ kèm ?xe=slug ở trang chi tiết, hoặc tel: ở trang liên hệ. */
  href?: string;
  /** Chữ trên nút; mặc định là hành động chính. */
  label?: string;
};

const Arrow = () => (
  <svg className="m-arrow" viewBox="0 0 12 12" aria-hidden="true">
    <path className="m-arrow__stem" d="M1 6h8" />
    <path className="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5" />
  </svg>
);

export default function SiteFooter({
  title = MAIN_ACTION,
  text = "Ghi dòng xe, công việc và nơi xe chạy. Hai bên làm rõ cấu hình rồi mới xác nhận báo giá.",
  href = MAIN_HREF,
  label = MAIN_ACTION,
}: SiteFooterProps) {
  // Nút cỡ lớn nhưng không trải hết bề ngang (bỏ btn--wide): kit tự đặt min(50%, 640px) từ 640px trở
  // lên, điện thoại vẫn rộng hết. Bản rộng 1280×88px lấn át tiêu đề và lặp nút "Gửi yêu cầu" của nav.
  const className = "btn btn--primary btn--xl";
  const isExternal = href.startsWith("tel:") || href.startsWith("mailto:");
  return (
    <footer className="footer closing footer--dark ground-inverse" aria-labelledby="close-h">
      <div className="wrap">
        <div className="closing__cta close--type">
          <div className="section-head">
            <h2 id="close-h">{title}</h2>
            <p>{text}</p>
          </div>
          {isExternal ? (
            <a className={className} href={href}>{label}<Arrow /></a>
          ) : (
            <Link className={className} href={href}>{label}<Arrow /></Link>
          )}
        </div>
        <div className="closing__links">
          <div className="grid">
            <div className="span-4 stack-4">
              <Link className="nav__logo" href="/">Xe Chuyên Dụng</Link>
              <p className="footer__lede">Tư vấn xe tải và xe chuyên dụng theo công việc, hỗ trợ khách hàng toàn quốc.</p>
            </div>
            <div className="span-2 footer__col">
              <h3>Danh mục</h3>
              <ul>
                <li><Link href="/xe?loai=xe-tai">Xe tải</Link></li>
                <li><Link href="/xe?loai=xe-chua-chay">Xe chữa cháy</Link></li>
                <li><Link href="/xe?loai=xe-cuu-ho">Xe cứu hộ</Link></li>
                <li><Link href="/xe?loai=xe-bon-moi-truong">Xe môi trường</Link></li>
              </ul>
            </div>
            <div className="span-2 footer__col">
              <h3>Thông tin</h3>
              <ul>
                <li><Link href="/gioi-thieu">Giới thiệu</Link></li>
                <li><Link href="/dich-vu">Dịch vụ</Link></li>
                <li><Link href="/tu-van-mua-xe">Tư vấn mua xe</Link></li>
                <li><Link href="/tin-tuc">Kiến thức</Link></li>
              </ul>
            </div>
            <div className="span-2 footer__col">
              <h3>Pháp lý</h3>
              <ul>
                <li><Link href="/chinh-sach">Chính sách</Link></li>
                <li><Link href="/phap-ly">Quy định</Link></li>
              </ul>
            </div>
            <div className="span-2 footer__col">
              <h3>Liên hệ</h3>
              <ul>
                <li><span>{CONTACT_NAME}</span></li>
                <li><a href={`tel:${PHONE}`}>{PHONE_LABEL}</a></li>
                <li><a href={`mailto:${EMAIL}`}>Gửi email</a></li>
              </ul>
            </div>
          </div>
          <div className="footer__legal"><span>&copy; 2026 Xe Chuyên Dụng</span></div>
        </div>
      </div>
    </footer>
  );
}
