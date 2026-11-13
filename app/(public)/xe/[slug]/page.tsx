import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "../../../components/page-head";
import SiteFooter from "../../../components/site-footer";
import SiteHeader from "../../../components/site-header";
import VehicleGallery from "../../../components/vehicle-gallery";
import { MAIN_ACTION, PHONE, PHONE_LABEL } from "../../../components/site-constants";
import { getPublicVehicle } from "../../../lib/content";

type VehiclePageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: VehiclePageProps): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getPublicVehicle(slug);
  return vehicle
    ? { title: vehicle.name, description: vehicle.description }
    : { title: "Không tìm thấy xe" };
}

export default function VehicleDetailPage({ params }: VehiclePageProps) {
  return (
    <>
      <SiteHeader current="/xe" />
      <Suspense fallback={<main id="noi-dung" className="section pg-head"><div className="wrap muted">Đang tải thông tin xe…</div></main>}>
        <VehicleDetailContent params={params} />
      </Suspense>
    </>
  );
}

async function VehicleDetailContent({ params }: VehiclePageProps) {
  const { slug } = await params;
  const vehicle = await getPublicVehicle(slug);
  if (!vehicle) notFound();
  const contactHref = `/lien-he?xe=${vehicle.slug}#contact-form`;

  return (
    <>
      <main id="noi-dung">
        <section className="section pg-head" aria-labelledby="page-h">
          <div className="wrap">
            <Breadcrumbs items={[{ href: "/xe", label: "Danh mục xe" }, { label: vehicle.name }]} />
            <div className="grid grid--top pg-detail">
              <div className="span-7">
                <VehicleGallery artwork={vehicle.artwork} images={vehicle.images} name={vehicle.name} />
              </div>
              <div className="span-5 pg-detail__copy">
                <p className="t-label muted">{vehicle.make} · {vehicle.category}</p>
                <h1 id="page-h" className="pg-detail__title">{vehicle.name}</h1>
                <p className="t-lead">{vehicle.description}</p>
                <div className="btn-row">
                  <Link className="btn btn--primary" href={contactHref}>{MAIN_ACTION}</Link>
                  <a className="btn btn--secondary" href={`tel:${PHONE}`}>Gọi {PHONE_LABEL}</a>
                </div>
                <div className="card pg-callout">
                  <h3>Giá và cấu hình: liên hệ tư vấn</h3>
                  <p className="t-small">
                    {vehicle.sourceUrl
                      ? "Thông tin tổng hợp từ nguồn tham khảo, có thể khác phiên bản xe thực tế. Đối chiếu hồ sơ kỹ thuật trước khi quyết định."
                      : "Cấu hình và thông tin xe mang tính minh họa; xác nhận theo xe thực tế trước khi giao dịch."}
                  </p>
                  {vehicle.sourceUrl && (
                    <p className="t-small">
                      Nguồn: <a className="pg-inline-link" href={vehicle.sourceUrl} rel="noreferrer" target="_blank">Tân Quốc Tuấn Auto ↗</a>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="thong-so-h">
          <div className="wrap grid grid--top">
            <div className="span-6">
              <div className="section-head">
                <h2 id="thong-so-h">Thông số tham khảo</h2>
              </div>
              <ul className="rows rows--spec pg-spec">
                {vehicle.knownDetails.map((detail) => (
                  <li key={detail.label}>
                    <span className="rows__name">{detail.label}</span>
                    <span className="rows__value">{detail.value}</span>
                  </li>
                ))}
                <li>
                  <span className="rows__name">Giá bán / tình trạng</span>
                  <span className="rows__value">Liên hệ để xác nhận</span>
                </li>
              </ul>
            </div>
            <div className="span-5 start-8">
              <div className="section-head">
                <h2>Công việc phù hợp</h2>
                <p>{vehicle.useCase}</p>
              </div>
              <ul className="checks">
                {vehicle.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
              </ul>
              <p className="t-small muted pg-note">
                Các mô tả trên giúp định hướng buổi tư vấn, không thay thế hồ sơ kỹ thuật hoặc báo giá.
              </p>
              <p><Link className="link" href="/xe">Quay lại danh mục xe</Link></p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter
        title={`Hỏi về ${vehicle.name}`}
        text="Yêu cầu gửi kèm tên xe đang xem. Ghi thêm công việc, tải trọng và nơi nhận xe để được trả lời đúng cấu hình."
        href={contactHref}
      />
    </>
  );
}
