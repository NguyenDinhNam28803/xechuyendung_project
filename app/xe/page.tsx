import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import SiteFooter from "../components/site-footer";
import SiteHeader from "../components/site-header";
import VehicleCatalog from "../components/vehicle-catalog";

export const metadata: Metadata = {
  title: "Danh mục xe tải và xe chuyên dụng",
  description: "Tra cứu các dòng xe tải, xe chữa cháy và xe cứu hộ; lọc theo nhu cầu và xem thông tin mẫu xe.",
};

export default function VehiclesPage() {
  return (
    <>
      <SiteHeader />
      <main className="content-page">
        <div className="breadcrumbs"><Link href="/">Trang chủ</Link><span>/</span><span>Danh mục xe</span></div>
        <section className="page-intro">
          <span className="section-kicker">XE THEO CÔNG NĂNG</span>
          <h1>Tìm dòng xe<br /><span>phù hợp công việc.</span></h1>
          <p>Khám phá các nhóm xe tiêu biểu, lọc theo công năng hoặc tìm theo tên xe và thương hiệu. Thông tin sản phẩm trên trang hiện là dữ liệu mẫu.</p>
        </section>
        <section className="catalog catalog-page">
          <Suspense fallback={<div className="catalog-loading">Đang tải danh mục xe...</div>}>
            <VehicleCatalog />
          </Suspense>
        </section>
        <div className="page-cta">
          <div><strong>Chưa rõ cấu hình cần chọn?</strong><span>Mô tả nhiệm vụ để được định hướng các thông tin cần chuẩn bị.</span></div>
          <Link className="button button-primary" href="/lien-he">Trao đổi nhu cầu <span aria-hidden="true">→</span></Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
