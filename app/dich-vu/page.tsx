import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../components/site-footer";
import SiteHeader from "../components/site-header";

export const metadata: Metadata = {
  title: "Dịch vụ và quy trình tư vấn",
  description: "Tham khảo các bước làm rõ nhu cầu, cấu hình và thông tin xe chuyên dụng.",
};

const steps = [
  {
    number: "01",
    title: "Làm rõ nhiệm vụ",
    description: "Xác định công việc, địa hình hoạt động, tải trọng hoặc thiết bị cần phục vụ.",
  },
  {
    number: "02",
    title: "Đối chiếu cấu hình",
    description: "Làm rõ xe cơ sở, phần chuyên dùng, kích thước, thông số và tài liệu cần kiểm tra.",
  },
  {
    number: "03",
    title: "Xác nhận phương án",
    description: "Đối chiếu báo giá, hồ sơ, điều kiện bàn giao và mốc thời gian theo thông tin chính thức.",
  },
  {
    number: "04",
    title: "Trao đổi hỗ trợ sau mua",
    description: "Xác nhận phạm vi bảo hành, bảo dưỡng, phụ tùng và hỗ trợ kỹ thuật với đơn vị cung cấp.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <SiteHeader />
      <main className="content-page">
        <div className="breadcrumbs"><Link href="/">Trang chủ</Link><span>/</span><span>Dịch vụ</span></div>
        <section className="page-intro">
          <span className="section-kicker">QUY TRÌNH THAM KHẢO</span>
          <h1>Từ nhu cầu<br /><span>đến phương án xe.</span></h1>
          <p>Các bước dưới đây giúp người mua chuẩn bị trao đổi. Phạm vi dịch vụ thực tế cần được xác nhận với doanh nghiệp trước khi đặt mua.</p>
        </section>
        <section className="service-steps">
          {steps.map((step) => (
            <article className="service-step" key={step.number}>
              <span>{step.number}</span>
              <div><h2>{step.title}</h2><p>{step.description}</p></div>
              <span className="service-step-arrow" aria-hidden="true">↗</span>
            </article>
          ))}
        </section>
        <section className="verification-note">
          <span className="section-kicker">LƯU Ý</span>
          <h2>Chưa công bố cam kết dịch vụ.</h2>
          <p>Chính sách bảo hành, giao nhận, thanh toán và hỗ trợ kỹ thuật sẽ chỉ được đăng sau khi nội dung chính thức được xác nhận.</p>
        </section>
        <div className="page-cta">
          <div><strong>Cần bắt đầu từ cấu hình xe?</strong><span>Gửi nhu cầu để xem trước thông tin cần thiết cho buổi tư vấn.</span></div>
          <Link className="button button-primary" href="/lien-he">Liên hệ tư vấn <span aria-hidden="true">→</span></Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
