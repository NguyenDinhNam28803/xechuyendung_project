import type { Metadata } from "next";
import { Suspense } from "react";
import PageHead from "../../components/page-head";
import ResourceList from "../../components/resource-list";
import SiteFooter from "../../components/site-footer";
import SiteHeader from "../../components/site-header";
import { getPublicLegalResources } from "../../lib/content";

export const metadata: Metadata = {
  title: "Chính sách",
  description: "Dữ liệu liên hệ, quyền riêng tư và trạng thái các chính sách bán hàng, giao nhận, bảo hành.",
};

export default function PoliciesPage() {
  return (
    <>
      <SiteHeader current="/chinh-sach" />
      <main id="noi-dung">
        <PageHead
          crumbs={[{ label: "Chính sách" }]}
          title="Chính sách và dữ liệu liên hệ"
          lead="Điều khoản giao dịch chỉ có hiệu lực khi đơn vị có trách nhiệm xác nhận trong báo giá hoặc hồ sơ chính thức."
        />
        <section className="section pg-after-head" aria-label="Danh sách chính sách">
          <div className="wrap pg-narrow">
            <Suspense fallback={<p className="muted">Đang tải chính sách…</p>}>
              <Policies />
            </Suspense>
          </div>
        </section>
      </main>
      <SiteFooter
        title="Cần xác nhận điều khoản?"
        text="Chỉ dùng báo giá và điều khoản chính thức do đơn vị bán hàng cung cấp."
      />
    </>
  );
}

async function Policies() {
  const policies = await getPublicLegalResources("policy");
  return (
    <ResourceList
      resources={policies}
      tag="Tham khảo"
      emptyTitle="Chưa có chính sách được công bố"
      emptyText="Các điều khoản được cập nhật sau khi đơn vị có trách nhiệm xác nhận."
    />
  );
}
