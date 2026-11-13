import type { Metadata } from "next";
import { Suspense } from "react";
import ContactForm from "../../components/contact-form";
import PageHead from "../../components/page-head";
import SiteHeader from "../../components/site-header";
import { CONTACT_NAME, EMAIL, PHONE, PHONE_LABEL } from "../../components/site-constants";
import SiteFooter from "../../components/site-footer";

export const metadata: Metadata = {
  title: "Liên hệ tư vấn xe",
  description: "Gọi điện, gửi email hoặc gửi yêu cầu tư vấn xe tải và xe chuyên dụng qua biểu mẫu.",
};

const steps = [
  ["Gửi nhu cầu", "Dòng xe, công việc và nơi xe chạy."],
  ["Làm rõ cấu hình", "Thông số, thiết bị và hồ sơ cần kiểm tra."],
  ["Xác nhận báo giá", "Theo cấu hình và thời điểm cụ thể."],
];

export default function ContactPage() {
  return (
    <>
      <SiteHeader current="/lien-he" />
      <main id="noi-dung">
        <PageHead
          crumbs={[{ label: "Liên hệ" }]}
          title="Liên hệ tư vấn xe"
          lead="Gọi điện, gửi email hoặc ghi loại xe và việc xe sẽ làm vào biểu mẫu."
        />
        <section className="section pg-after-head" aria-label="Thông tin liên hệ và biểu mẫu">
          <div className="wrap grid grid--top">
            <aside className="span-5 pg-contact-aside">
              <ul className="rows">
                <li><span className="rows__name">Người liên hệ</span><span className="rows__value">{CONTACT_NAME}</span></li>
                <li><span className="rows__name">Điện thoại</span><a className="rows__value pg-inline-link" href={`tel:${PHONE}`}>{PHONE_LABEL}</a></li>
                <li><span className="rows__name">Email</span><a className="rows__value pg-inline-link" href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
              </ul>
              <div className="stack-4">
                <h2 className="t-h3">Sau khi gửi yêu cầu</h2>
                <ol className="pg-mini-steps">
                  {steps.map(([title, text], index) => (
                    <li key={title}>
                      <span className="step-num">{index + 1}</span>
                      <div><strong>{title}</strong><p className="t-small muted">{text}</p></div>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
            <div className="span-7 start-6 pg-anchor" id="contact-form">
              <Suspense fallback={<div className="card pg-form-card muted">Đang tải biểu mẫu…</div>}>
                <ContactForm />
              </Suspense>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter
        title="Muốn nói chuyện trực tiếp?"
        text={`${CONTACT_NAME} nghe máy trực tiếp. Biểu mẫu ở phía trên nếu bạn muốn gửi yêu cầu bằng chữ.`}
        href={`tel:${PHONE}`}
        label={`Gọi ${PHONE_LABEL}`}
      />
    </>
  );
}
