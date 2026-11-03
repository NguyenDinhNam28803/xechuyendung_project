import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import SiteFooter from "../components/site-footer";
import SiteHeader from "../components/site-header";
import { getPublicLegalResources } from "../lib/content";

export const metadata: Metadata = {
  title: "Quy định và tìm hiểu pháp lý",
  description:
    "Tài liệu tham khảo về quy định và nội dung tìm hiểu pháp lý liên quan đến xe chuyên dùng.",
};

export default function LegalInformationPage() {
  return (
    <Suspense
      fallback={
        <main className="content-page">Đang tải tài liệu pháp lý...</main>
      }
    >
      <LegalInformationPageContent />
    </Suspense>
  );
}

async function LegalInformationPageContent() {
  const [regulations, guides] = await Promise.all([
    getPublicLegalResources("regulation"),
    getPublicLegalResources("legal_guide"),
  ]);
  return (
    <>
      <SiteHeader />
      <main className="content-page info-page">
        <div className="breadcrumbs">
          <Link href="/">Trang chủ</Link>
          <span>/</span>
          <span>Pháp lý</span>
        </div>
        <section className="page-intro">
          <span className="section-kicker">TÀI LIỆU THAM KHẢO</span>
          <h1>
            Tìm hiểu quy định
            <br />
            <span>trước khi quyết định.</span>
          </h1>
          <p>
            Nội dung dưới đây chỉ nhằm cung cấp thông tin tham khảo, không thay
            thế văn bản pháp luật chính thức, tư vấn pháp lý hoặc xác nhận hồ sơ
            của cơ quan có thẩm quyền.
          </p>
        </section>
        <LegalResourceSection
          heading="Quy định và văn bản tham khảo"
          resources={regulations}
          emptyText="Chưa có văn bản tham khảo được công bố."
        />
        <LegalResourceSection
          heading="Tìm hiểu pháp lý"
          resources={guides}
          emptyText="Chưa có hướng dẫn pháp lý được công bố."
        />
        <div className="page-cta">
          <div>
            <strong>Cần xác nhận một yêu cầu cụ thể?</strong>
            <span>
              Đối chiếu văn bản hiện hành và trao đổi với đơn vị có chuyên môn.
            </span>
          </div>
          <Link className="button button-primary" href="/lien-he">
            Liên hệ <span aria-hidden="true">→</span>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function LegalResourceSection({
  heading,
  resources,
  emptyText,
}: {
  heading: string;
  resources: Awaited<ReturnType<typeof getPublicLegalResources>>;
  emptyText: string;
}) {
  return (
    <section className="policy-list">
      <h2>{heading}</h2>
      {resources.length === 0 ? (
        <p className="legal-empty">{emptyText}</p>
      ) : (
        resources.map((resource, index) => (
          <article key={resource.slug}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h2>{resource.title}</h2>
              <p>{resource.summary}</p>
              <p>{resource.content}</p>
              {resource.sourceUrl && (
                <a href={resource.sourceUrl} rel="noreferrer" target="_blank">
                  Mở nguồn tham khảo ↗
                </a>
              )}
            </div>
            <b>Tham khảo</b>
          </article>
        ))
      )}
    </section>
  );
}
