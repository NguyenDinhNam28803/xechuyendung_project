import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ContactForm from "../components/contact-form";
import SiteFooter from "../components/site-footer";
import SiteHeader from "../components/site-header";

export const metadata: Metadata = {
  title: "Liên hệ tư vấn xe",
  description: "Gửi nhu cầu để xem trước yêu cầu tư vấn xe tải và xe chuyên dụng. Biểu mẫu hiện chưa gửi dữ liệu.",
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="content-page contact-page">
        <div className="breadcrumbs"><Link href="/">Trang chủ</Link><span>/</span><span>Liên hệ</span></div>
        <section className="contact-section" id="lien-he">
          <div className="contact-heading">
            <div>
              <span className="section-kicker">LIÊN HỆ &amp; TƯ VẤN</span>
              <h1>Bắt đầu từ nhu cầu<br /><span>của bạn.</span></h1>
            </div>
            <p>Chia sẻ loại xe và mục đích sử dụng. Kênh liên hệ chính thức sẽ được cập nhật sau khi doanh nghiệp xác nhận thông tin.</p>
          </div>

          <div className="contact-layout">
            <aside className="contact-aside">
              <span className="contact-aside-kicker">TƯ VẤN CHỌN XE</span>
              <h2>Cùng làm rõ cấu hình phù hợp với công việc.</h2>
              <p>Chuẩn bị một vài thông tin ban đầu để xác định nhóm xe và các yêu cầu cần đối chiếu.</p>
              <ol className="contact-steps">
                <li><span>01</span><div><strong>Chia sẻ nhu cầu</strong><small>Dòng xe, công việc và địa điểm dự kiến</small></div></li>
                <li><span>02</span><div><strong>Làm rõ cấu hình</strong><small>Thông số, thiết bị và hồ sơ cần kiểm tra</small></div></li>
                <li><span>03</span><div><strong>Xác nhận báo giá</strong><small>Trao đổi theo cấu hình và thời điểm cụ thể</small></div></li>
              </ol>
              <div className="contact-channel">
                <span className="channel-icon" aria-hidden="true">i</span>
                <div>
                  <strong>Thông tin liên hệ doanh nghiệp</strong>
                  <p>Hotline, email, địa chỉ showroom và bản đồ chưa được cấu hình do chưa có thông tin xác nhận.</p>
                </div>
              </div>
            </aside>

            <div id="contact-form">
              <Suspense fallback={<div className="contact-form-loading">Đang tải biểu mẫu tư vấn...</div>}>
                <ContactForm />
              </Suspense>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
