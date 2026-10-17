import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "../../components/site-footer";
import SiteHeader from "../../components/site-header";
import VehicleGallery from "../../components/vehicle-gallery";
import { getVehicleBySlug, vehicles } from "../../data/vehicles";

type VehiclePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return vehicles.map((vehicle) => ({ slug: vehicle.slug }));
}

export async function generateMetadata({ params }: VehiclePageProps): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = getVehicleBySlug(slug);
  return vehicle
    ? { title: vehicle.name, description: vehicle.description }
    : { title: "Không tìm thấy xe" };
}

export default async function VehicleDetailPage({ params }: VehiclePageProps) {
  const { slug } = await params;
  const vehicle = getVehicleBySlug(slug);
  if (!vehicle) notFound();

  return (
    <>
      <SiteHeader />
      <main className="content-page">
        <div className="breadcrumbs">
          <Link href="/">Trang chủ</Link><span>/</span><Link href="/xe">Danh mục xe</Link><span>/</span><span>{vehicle.name}</span>
        </div>
        <article className="vehicle-detail">
          <VehicleGallery
            artwork={vehicle.artwork}
            badge={vehicle.badge}
            images={vehicle.images}
            name={vehicle.name}
          />
          <div className="detail-copy">
            <span className="section-kicker">{vehicle.make} · {vehicle.category}</span>
            <h1>{vehicle.name}</h1>
            <p className="detail-lead">{vehicle.description}</p>
            <div className="detail-quote-note">
              <strong>Giá và cấu hình: liên hệ tư vấn</strong>
              <span>Giá, phiên bản và tình trạng xe chưa được kết nối dữ liệu thực tế.</span>
            </div>
            <Link className="button button-primary" href={`/lien-he?xe=${vehicle.slug}#contact-form`}>
              Yêu cầu tư vấn xe này <span aria-hidden="true">→</span>
            </Link>
            <p className="detail-disclaimer">
              {vehicle.sourceUrl
                ? "Thông tin được tổng hợp từ nguồn tham khảo và có thể khác phiên bản xe thực tế. Vui lòng đối chiếu hồ sơ kỹ thuật trước khi quyết định."
                : "Cấu hình và thông tin xe đang mang tính minh họa; vui lòng xác nhận theo xe thực tế trước khi giao dịch."}
            </p>
            {vehicle.sourceUrl && (
              <p className="detail-source">
                Nguồn thông tin:{" "}
                <a href={vehicle.sourceUrl} rel="noreferrer" target="_blank">
                  Tân Quốc Tuấn Auto <span aria-hidden="true">↗</span>
                </a>
              </p>
            )}
          </div>
        </article>

        <div className="detail-information">
          <section className="detail-panel">
            <span className="section-kicker">THÔNG TIN ĐÃ CÓ</span>
            <h2>Thông tin tham khảo</h2>
            <dl className="spec-list">
              {vehicle.knownDetails.map((detail) => (
                <div key={detail.label}><dt>{detail.label}</dt><dd>{detail.value}</dd></div>
              ))}
              <div><dt>Giá bán / tình trạng</dt><dd>Vui lòng liên hệ để xác nhận</dd></div>
            </dl>
          </section>
          <section className="detail-panel">
            <span className="section-kicker">ĐỊNH HƯỚNG SỬ DỤNG</span>
            <h2>Trao đổi cấu hình theo nhiệm vụ</h2>
            <p>{vehicle.useCase}</p>
            <ul className="detail-highlights">
              {vehicle.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
            </ul>
            <p className="detail-disclaimer">Các mô tả trên chỉ định hướng nội dung tư vấn, không thay thế hồ sơ kỹ thuật hoặc báo giá.</p>
          </section>
        </div>
        <div className="page-cta detail-contact-cta">
          <div>
            <strong>Cần tư vấn hoặc báo giá xe này?</strong>
            <span>Gửi yêu cầu kèm theo dòng xe đang xem; thông tin liên hệ mẫu trên website chưa sử dụng được.</span>
          </div>
          <Link className="button button-primary" href={`/lien-he?xe=${vehicle.slug}#contact-form`}>
            Gửi yêu cầu tư vấn <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="detail-back"><Link href="/xe">← Quay lại danh mục xe</Link></div>
      </main>
      <SiteFooter />
    </>
  );
}
