import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../components/site-footer";
import SiteHeader from "../components/site-header";

export const metadata: Metadata = {
  title: "Thông tin chính sách",
  description: "Trạng thái cập nhật các chính sách bán hàng, giao nhận, bảo hành và quyền riêng tư.",
};

const pendingPolicies = [
  ["Chính sách bán hàng và thanh toán", "Chờ doanh nghiệp xác nhận điều kiện áp dụng."],
  ["Giao nhận và bàn giao xe", "Chờ xác nhận phạm vi giao xe, thời gian và chi phí."],
  ["Bảo hành và hỗ trợ kỹ thuật", "Chờ xác nhận nhà cung cấp, thời hạn và điều kiện bảo hành."],
  ["Quyền riêng tư", "Cần công bố khi website kết nối hệ thống tiếp nhận và xử lý dữ liệu."],
];

export default function PoliciesPage() {
  return (
    <>
      <SiteHeader />
      <main className="content-page">
        <div className="breadcrumbs"><Link href="/">Trang chủ</Link><span>/</span><span>Chính sách</span></div>
        <section className="page-intro">
          <span className="section-kicker">MINH BẠCH THÔNG TIN</span>
          <h1>Các chính sách<br /><span>đang chờ xác nhận.</span></h1>
          <p>Website chưa công bố điều khoản bán hàng hoặc cam kết dịch vụ. Chúng tôi không tự suy diễn các nội dung có thể ảnh hưởng đến quyết định mua xe.</p>
        </section>
        <section className="policy-list">
          {pendingPolicies.map(([title, status], index) => (
            <article key={title}>
              <span>0{index + 1}</span>
              <div><h2>{title}</h2><p>{status}</p></div>
              <b>Chưa công bố</b>
            </article>
          ))}
        </section>
        <div className="page-cta">
          <div><strong>Cần xác nhận nội dung giao dịch?</strong><span>Chỉ sử dụng báo giá và điều khoản chính thức do đơn vị bán hàng cung cấp.</span></div>
          <Link className="button button-primary" href="/lien-he">Xem thông tin liên hệ <span aria-hidden="true">→</span></Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
