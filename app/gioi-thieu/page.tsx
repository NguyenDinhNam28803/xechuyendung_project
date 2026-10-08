import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../components/site-footer";
import SiteHeader from "../components/site-header";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description: "Định hướng nội dung và thông tin cần hoàn thiện cho website xe chuyên dụng.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="content-page">
        <div className="breadcrumbs"><Link href="/">Trang chủ</Link><span>/</span><span>Giới thiệu</span></div>
        <section className="page-intro">
          <span className="section-kicker">GIỚI THIỆU</span>
          <h1>Giải pháp xe<br /><span>bắt đầu từ nhu cầu.</span></h1>
          <p>Website được xây dựng để giúp khách hàng tìm hiểu xe tải và xe chuyên dụng theo nhiệm vụ, đối chiếu thông tin cơ bản và chuẩn bị yêu cầu tư vấn.</p>
        </section>
        <section className="about-content">
          <div className="about-feature">
            <span className="section-kicker">ĐỊNH HƯỚNG WEBSITE</span>
            <h2>Tìm hiểu rõ hơn trước khi chọn xe.</h2>
            <p>Xe chuyên dụng thường cần làm rõ cả xe cơ sở, phần chuyên dùng, điều kiện khai thác và hồ sơ. Nội dung được tổ chức xoay quanh hành trình từ khám phá danh mục đến trao đổi cấu hình.</p>
            <Link className="text-link" href="/xe">Khám phá danh mục xe <span aria-hidden="true">→</span></Link>
          </div>
          <div className="about-points">
            <article><span>01</span><div><h2>Thông tin theo công năng</h2><p>Phân loại nội dung theo nhóm xe và công việc dự kiến.</p></div></article>
            <article><span>02</span><div><h2>Thông số cần xác nhận</h2><p>Phân biệt nội dung tham khảo với cấu hình và hồ sơ thực tế.</p></div></article>
            <article><span>03</span><div><h2>Kết nối tư vấn</h2><p>Chuẩn bị yêu cầu rõ ràng trước khi liên hệ đơn vị bán hàng.</p></div></article>
          </div>
        </section>
        <section className="verification-note">
          <span className="section-kicker">THÔNG TIN DOANH NGHIỆP</span>
          <h2>Hồ sơ giới thiệu chính thức đang chờ xác nhận.</h2>
          <p>Tên pháp nhân, kinh nghiệm, đối tác, địa chỉ, phạm vi dịch vụ và chính sách cần được doanh nghiệp cung cấp và duyệt trước khi công bố trên website.</p>
          <Link href="/lien-he">Trao đổi về yêu cầu <span aria-hidden="true">→</span></Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
