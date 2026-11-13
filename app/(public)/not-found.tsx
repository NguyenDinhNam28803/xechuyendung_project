import Link from "next/link";
import SiteFooter from "../components/site-footer";
import SiteHeader from "../components/site-header";

/** 404 trong các trang public (ví dụ /xe/khong-co): giữ nav và footer của site. */
export default function PublicNotFound() {
  return (
    <>
      <SiteHeader />
      <main id="noi-dung" className="section pg-head pg-404">
        <div className="wrap section-head">
          <p className="t-label muted">Lỗi 404</p>
          <h1>Không tìm thấy nội dung</h1>
          <p>Dòng xe hoặc bài viết này không tồn tại, hoặc đã được gỡ.</p>
          <div className="btn-row">
            <Link className="btn btn--primary" href="/xe">Xem danh mục xe</Link>
            <Link className="btn btn--secondary" href="/tin-tuc">Bài viết kiến thức</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
