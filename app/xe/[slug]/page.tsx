import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "../../components/site-footer";
import SiteHeader from "../../components/site-header";
import VehicleArtwork from "../../components/vehicle-artwork";
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
          <div className={`detail-artwork card-image-${vehicle.artwork}`}>
            <span className="vehicle-badge"><i />{vehicle.badge}</span>
            <VehicleArtwork kind={vehicle.artwork} />
          </div>
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
            <p className="detail-disclaimer">Hình minh họa. Cấu hình, thông số và hồ sơ cần được xác nhận theo xe thực tế trước khi giao dịch.</p>
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
        <div className="detail-back"><Link href="/xe">← Quay lại danh mục xe</Link></div>
      </main>
      <SiteFooter />
    </>
  );
}
