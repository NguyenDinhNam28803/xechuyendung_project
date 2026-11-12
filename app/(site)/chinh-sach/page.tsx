import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import SiteFooter from "../../components/site-footer";
import SiteHeader from "../../components/site-header";
import { getPublicLegalResources } from "../../lib/content";

export const metadata: Metadata = {
  title: "Thông tin chính sách",
  description:
    "Thông tin về dữ liệu liên hệ và trạng thái cập nhật các chính sách bán hàng, giao nhận, bảo hành.",
};

export default function PoliciesPage() {
  return (
    <Suspense
      fallback={<main className="content-page">Đang tải chính sách...</main>}
    >
      <PoliciesPageContent />
    </Suspense>
  );
}

async function PoliciesPageContent() {
  const policies = await getPublicLegalResources("policy");
  return (
    <>
      <SiteHeader />
      <main className="content-page">
        <div className="breadcrumbs">
          <Link href="/">Trang chủ</Link>
          <span>/</span>
          <span>Chính sách</span>
        </div>
        <section className="page-intro">
          <span className="section-kicker">MINH BẠCH THÔNG TIN</span>
          <h1>
            Thông tin chính sách
            <br />
            <span>được cập nhật minh bạch.</span>
          </h1>
          <p>
            Điều khoản giao dịch chỉ có hiệu lực khi được đơn vị có trách nhiệm
            xác nhận trong báo giá hoặc hồ sơ chính thức.
          </p>
        </section>
        <section className="policy-list">
          {policies.map((policy, index) => (
            <article key={policy.slug}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2>{policy.title}</h2>
                <p>{policy.summary}</p>
                <p>{policy.content}</p>
                {policy.sourceUrl && (
                  <a href={policy.sourceUrl} rel="noreferrer" target="_blank">
                    Nguồn tham khảo ↗
                  </a>
                )}
              </div>
              <b>Thông tin tham khảo</b>
            </article>
          ))}
          {policies.length === 0 && (
            <article>
              <span>01</span>
              <div>
                <h2>Chưa có chính sách được công bố</h2>
                <p>
                  Các điều khoản sẽ được cập nhật sau khi đơn vị có trách nhiệm
                  xác nhận.
                </p>
              </div>
              <b>Chưa công bố</b>
            </article>
          )}
        </section>
        <div className="page-cta">
          <div>
            <strong>Cần xác nhận nội dung giao dịch?</strong>
            <span>
              Chỉ sử dụng báo giá và điều khoản chính thức do đơn vị bán hàng
              cung cấp.
            </span>
          </div>
          <Link className="button button-primary" href="/lien-he">
            Xem thông tin liên hệ <span aria-hidden="true">→</span>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
