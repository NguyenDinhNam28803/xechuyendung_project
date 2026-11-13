import type { Metadata } from "next";
import { Suspense } from "react";
import PageHead from "../../components/page-head";
import ResourceList from "../../components/resource-list";
import SiteFooter from "../../components/site-footer";
import SiteHeader from "../../components/site-header";
import { getPublicLegalResources } from "../../lib/content";

export const metadata: Metadata = {
  title: "Quy định và pháp lý",
  description: "Văn bản tham khảo về quy định và nội dung tìm hiểu pháp lý liên quan đến xe chuyên dùng.",
};

export default function LegalInformationPage() {
  return (
    <>
      <SiteHeader current="/phap-ly" />
      <main id="noi-dung">
        <PageHead
          crumbs={[{ label: "Pháp lý" }]}
          title="Quy định liên quan đến xe chuyên dùng"
          lead="Tài liệu tham khảo, không thay thế văn bản pháp luật chính thức, tư vấn pháp lý hoặc xác nhận hồ sơ của cơ quan có thẩm quyền."
        />
        <Suspense
          fallback={
            <section className="section pg-after-head"><div className="wrap muted">Đang tải tài liệu…</div></section>
          }
        >
          <Resources />
        </Suspense>
      </main>
      <SiteFooter
        title="Cần xác nhận một yêu cầu cụ thể?"
        text="Đối chiếu văn bản hiện hành và trao đổi với đơn vị có chuyên môn trước khi quyết định."
      />
    </>
  );
}

async function Resources() {
  const [regulations, guides] = await Promise.all([
    getPublicLegalResources("regulation"),
    getPublicLegalResources("legal_guide"),
  ]);
  return (
    <>
      <section className="section pg-after-head" aria-labelledby="van-ban-h">
        <div className="wrap pg-narrow">
          <div className="section-head"><h2 id="van-ban-h">Văn bản tham khảo</h2></div>
          <ResourceList
            resources={regulations}
            tag="Văn bản"
            emptyTitle="Chưa có văn bản được công bố"
            emptyText="Danh sách văn bản được cập nhật sau khi rà soát hiệu lực."
          />
        </div>
      </section>
      <section className="section" aria-labelledby="huong-dan-h">
        <div className="wrap pg-narrow">
          <div className="section-head"><h2 id="huong-dan-h">Hướng dẫn pháp lý</h2></div>
          <ResourceList
            resources={guides}
            tag="Hướng dẫn"
            emptyTitle="Chưa có hướng dẫn được công bố"
            emptyText="Hướng dẫn được đăng sau khi đơn vị có chuyên môn rà soát."
          />
        </div>
      </section>
    </>
  );
}
