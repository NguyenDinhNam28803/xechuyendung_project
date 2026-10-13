import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../components/site-footer";
import SiteHeader from "../components/site-header";

export const metadata: Metadata = {
  title: "Hướng dẫn chuẩn bị khi chọn mua xe",
  description: "Danh sách câu hỏi và thông tin nên chuẩn bị khi tìm xe tải hoặc xe chuyên dụng.",
};

const checklist = [
  ["Công việc chính", "Chở loại hàng nào hoặc xe sẽ phục vụ nhiệm vụ gì?"],
  ["Điều kiện sử dụng", "Địa hình, quãng đường, tần suất hoạt động và môi trường khai thác ra sao?"],
  ["Yêu cầu kỹ thuật", "Tải trọng, dung tích, kích thước, thiết bị hoặc tiêu chuẩn nào cần đáp ứng?"],
  ["Khu vực và thời gian", "Xe hoạt động và dự kiến nhận ở tỉnh/thành nào, vào khoảng thời gian nào?"],
  ["Hồ sơ và ngân sách", "Đơn vị cần những giấy tờ gì và phạm vi ngân sách dự kiến ra sao?"],
];

export default function BuyingGuidePage() {
  return (
    <>
      <SiteHeader />
      <main className="content-page">
        <div className="breadcrumbs"><Link href="/">Trang chủ</Link><span>/</span><span>Tư vấn mua xe</span></div>
        <section className="page-intro">
          <span className="section-kicker">CẨM NANG CHỌN XE</span>
          <h1>Chuẩn bị đúng câu hỏi,<br /><span>chọn xe tự tin hơn.</span></h1>
          <p>Dùng danh sách dưới đây để mô tả nhu cầu trước khi trao đổi cấu hình, hồ sơ và báo giá.</p>
        </section>
        <section className="buying-guide">
          <div className="guide-intro">
            <span className="guide-number">01 / CHECKLIST</span>
            <h2>Thông tin nên chuẩn bị</h2>
            <p>Không cần có sẵn tất cả thông số. Hãy bắt đầu từ công việc xe cần làm và những giới hạn vận hành.</p>
          </div>
          <div className="checklist">
            {checklist.map(([label, description], index) => (
              <article key={label}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h3>{label}</h3><p>{description}</p></div>
              </article>
            ))}
          </div>
        </section>
        <section className="guide-caveat">
          <strong>Luôn xác nhận hồ sơ và cấu hình trước khi quyết định.</strong>
          <p>Ảnh và mô tả trên website không thay thế thông số của đúng phiên bản xe. Yêu cầu kỹ thuật, đăng kiểm và tiêu chuẩn chuyên ngành cần được xác minh với đơn vị có trách nhiệm.</p>
          <Link href="/tin-tuc">Đọc thêm kiến thức xe <span aria-hidden="true">→</span></Link>
        </section>
        <div className="page-cta">
          <div><strong>Đã xác định được nhu cầu?</strong><span>Gửi nhóm xe và nhiệm vụ để bắt đầu trao đổi.</span></div>
          <Link className="button button-primary" href="/lien-he">Gửi yêu cầu tư vấn <span aria-hidden="true">→</span></Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
