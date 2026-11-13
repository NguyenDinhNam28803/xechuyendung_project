import type { Metadata } from "next";
import Link from "next/link";
import PageHead from "../../components/page-head";
import SiteFooter from "../../components/site-footer";
import SiteHeader from "../../components/site-header";
import { serviceSteps as steps } from "../../data/service-steps";

export const metadata: Metadata = {
  title: "Dịch vụ và quy trình tư vấn",
  description: "Bốn bước từ nhiệm vụ của xe đến phương án cấu hình, hồ sơ và hỗ trợ sau mua.",
};


export default function ServicesPage() {
  return (
    <>
      <SiteHeader current="/dich-vu" />
      <main id="noi-dung">
        <PageHead
          crumbs={[{ label: "Dịch vụ" }]}
          title="Quy trình tư vấn xe chuyên dụng"
          lead="Bốn bước từ việc xe sẽ làm đến phương án xe cụ thể. Phạm vi dịch vụ thực tế được xác nhận với doanh nghiệp trước khi đặt mua."
        />
        <section className="section pg-after-head" aria-label="Các bước tư vấn">
          <div className="wrap">
            <ol className="grid pg-steps">
              {steps.map((step, index) => (
                <li className="card span-3" key={step.title}>
                  <span className="step-num">{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section className="section ground-surface" aria-labelledby="cam-ket-h">
          <div className="wrap grid grid--top">
            <div className="span-6 section-head">
              <h2 id="cam-ket-h">Cam kết dịch vụ chưa được công bố</h2>
            </div>
            <div className="span-5 start-8 stack-4">
              <p className="t-lead">Chính sách bảo hành, giao nhận, thanh toán và hỗ trợ kỹ thuật chỉ được đăng sau khi doanh nghiệp xác nhận nội dung chính thức.</p>
              <p><Link className="link" href="/chinh-sach">Xem trạng thái chính sách</Link></p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter
        title="Bắt đầu từ bước một"
        text="Gửi nhiệm vụ của xe để xem trước những thông tin cần có cho buổi tư vấn."
      />
    </>
  );
}
