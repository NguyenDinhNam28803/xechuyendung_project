import type { Metadata } from "next";
import { Suspense } from "react";
import PageHead from "../../components/page-head";
import SiteFooter from "../../components/site-footer";
import SiteHeader from "../../components/site-header";
import VehicleCatalog from "../../components/vehicle-catalog";
import { getPublicVehicles } from "../../lib/content";

export const metadata: Metadata = {
  title: "Danh mục xe tải và xe chuyên dụng",
  description: "Tra cứu xe tải, xe chữa cháy, xe cứu hộ và xe môi trường; lọc theo nhóm, tìm theo tên và so sánh tối đa 3 xe.",
};

export default function VehiclesPage() {
  return (
    <>
      <SiteHeader current="/xe" />
      <main id="noi-dung">
        <PageHead
          crumbs={[{ label: "Danh mục xe" }]}
          title="Danh mục xe tải và xe chuyên dụng"
          lead="Lọc theo nhóm xe, tìm theo tên hoặc hãng, chọn tối đa 3 xe để đặt cạnh nhau. Thông số là số liệu tham khảo, đối chiếu với hồ sơ từng xe trước khi báo giá."
        />
        <section className="section pg-after-head" aria-label="Danh sách xe">
          <div className="wrap">
            <Suspense fallback={<p className="muted">Đang tải danh mục xe…</p>}>
              <Catalog />
            </Suspense>
          </div>
        </section>
      </main>
      <SiteFooter
        title="Chưa rõ cấu hình cần chọn?"
        text="Mô tả việc xe sẽ làm, tải trọng và nơi xe chạy. Bên tư vấn đề xuất dòng xe và những thông số cần đối chiếu."
      />
    </>
  );
}

async function Catalog() {
  const vehicles = await getPublicVehicles();
  return <VehicleCatalog vehicles={vehicles} />;
}
