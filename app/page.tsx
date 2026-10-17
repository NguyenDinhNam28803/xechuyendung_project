import Image from "next/image";
import Link from "next/link";
import SiteFooter from "./components/site-footer";
import SiteHeader from "./components/site-header";
import VehicleArtwork from "./components/vehicle-artwork";
import { vehicleImages } from "./data/vehicle-images";
import { vehicles } from "./data/vehicles";

const benefits = [
  { number: "01", title: "Tư vấn cấu hình", description: "Chọn xe theo mục đích và điều kiện vận hành." },
  { number: "02", title: "Rõ thông tin xe", description: "Đối chiếu thông số theo hồ sơ xe thực tế." },
  { number: "03", title: "Hỗ trợ theo nhu cầu", description: "Bắt đầu bằng yêu cầu tư vấn cụ thể của bạn." },
];

export default function Home() {
  const featuredVehicles = vehicles.filter((vehicle) => vehicle.images.length > 0).slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero" id="trang-chu">
          <div className="hero-copy">
            <div className="eyebrow"><span /> CHUYÊN XE TẢI &amp; XE CHUYÊN DỤNG</div>
            <h1>Một chiếc xe tốt.<br /><span>Vững mọi công trình.</span></h1>
            <p>Tìm phương tiện phù hợp với công việc — từ xe tải chở hàng đến xe chuyên dụng có cấu hình theo nhiệm vụ.</p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/xe">Khám phá dòng xe <span aria-hidden="true">→</span></Link>
              <Link className="button button-ghost" href="/lien-he">Hỗ trợ chọn xe</Link>
            </div>
            <div className="hero-assurance">
              <span className="assurance-icon" aria-hidden="true">✓</span>
              <span><strong>Tư vấn theo nhu cầu</strong><small>Thông số và cấu hình cần xác nhận theo từng xe</small></span>
            </div>
          </div>
          <div className="hero-scene">
            <div className="scene-circle" />
            <Image
              alt="Xe tải đông lạnh Hyundai Mighty N550LA trong ảnh tham khảo"
              className="hero-real-photo"
              fill
              priority
              sizes="(max-width: 760px) 100vw, 50vw"
              src={vehicleImages.refrigeratedTruck[0]}
            />
            <div className="scene-label"><span /> ẢNH XE THỰC TẾ · THAM KHẢO</div>
            <div className="scene-caption">
              <span>XE TẢI ĐÔNG LẠNH</span>
              <strong>Hyundai Mighty N550LA</strong>
            </div>
          </div>
        </section>

        <section className="benefits" id="dich-vu" aria-label="Hỗ trợ khách hàng">
          {benefits.map((benefit) => (
            <div className="benefit-item" key={benefit.number}>
              <span className="benefit-number">{benefit.number}</span>
              <div><strong>{benefit.title}</strong><small>{benefit.description}</small></div>
            </div>
          ))}
          <Link className="benefit-link" href="/dich-vu">Xem dịch vụ <span aria-hidden="true">↗</span></Link>
        </section>

        <section className="catalog home-catalog" id="san-pham">
          <div className="section-heading">
            <div>
              <div className="section-kicker">DANH MỤC XE</div>
              <h2>Chọn xe theo<br /><span>công việc cần làm.</span></h2>
            </div>
            <p>Tìm hiểu các dòng xe tiêu biểu, xem thông tin đã biết và gửi yêu cầu tư vấn cấu hình phù hợp.</p>
          </div>
          <div className="vehicle-grid">
            {featuredVehicles.map((vehicle) => (
              <article className="vehicle-card" key={vehicle.slug}>
                <Link className={`card-image card-image-${vehicle.artwork}`} href={`/xe/${vehicle.slug}`} aria-label={`Xem ${vehicle.name}`}>
                  <span className="vehicle-badge"><i />{vehicle.badge}</span>
                  {vehicle.images[0] ? (
                    <Image
                      alt={vehicle.name}
                      className="card-photo"
                      fill
                      sizes="(max-width: 760px) 100vw, 33vw"
                      src={vehicle.images[0]}
                    />
                  ) : (
                    <VehicleArtwork kind={vehicle.artwork} />
                  )}
                  <span className="card-open" aria-hidden="true">↗</span>
                </Link>
                <div className="card-details">
                  <span className="vehicle-type">{vehicle.make} · {vehicle.category}</span>
                  <h3><Link href={`/xe/${vehicle.slug}`}>{vehicle.name}</Link></h3>
                  <p>{vehicle.description}</p>
                  <div className="card-footer">
                    <strong>Liên hệ báo giá</strong>
                    <Link href={`/xe/${vehicle.slug}`}>Chi tiết xe <span aria-hidden="true">→</span></Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="catalog-footer">
            <span>Ảnh và thông tin tham khảo cần được xác nhận theo hồ sơ xe thực tế.</span>
            <Link href="/xe">Xem toàn bộ danh mục <span aria-hidden="true">→</span></Link>
          </div>
        </section>

        <section className="home-guides">
          <div className="home-guides-heading">
            <span className="section-kicker">ĐỒNG HÀNH CÙNG QUYẾT ĐỊNH</span>
            <h2>Từ tìm hiểu đến chọn xe,<br /><span>mọi thông tin ở một nơi.</span></h2>
          </div>
          <div className="guide-cards">
            <Link className="guide-card" href="/tu-van-mua-xe">
              <span className="guide-number">01 / HƯỚNG DẪN</span>
              <strong>Chuẩn bị thông tin trước khi hỏi mua xe</strong>
              <span className="guide-arrow" aria-hidden="true">↗</span>
            </Link>
            <Link className="guide-card" href="/dich-vu">
              <span className="guide-number">02 / DỊCH VỤ</span>
              <strong>Tìm hiểu các bước tư vấn và cấu hình xe</strong>
              <span className="guide-arrow" aria-hidden="true">↗</span>
            </Link>
            <Link className="guide-card" href="/tin-tuc">
              <span className="guide-number">03 / KIẾN THỨC</span>
              <strong>Đọc lưu ý về thông tin kỹ thuật và hồ sơ xe</strong>
              <span className="guide-arrow" aria-hidden="true">↗</span>
            </Link>
          </div>
        </section>

        <section className="home-contact-callout">
          <div>
            <span className="section-kicker">BẠN ĐANG TÌM DÒNG XE NÀO?</span>
            <h2>Chia sẻ nhu cầu.<br /><span>Cùng làm rõ cấu hình.</span></h2>
          </div>
          <p>Gửi yêu cầu bằng biểu mẫu liên hệ. Hotline, email và địa chỉ đang hiển thị dữ liệu mẫu, chưa dùng để liên hệ thực tế.</p>
          <Link className="button button-primary" href="/lien-he#contact-form">Gửi yêu cầu tư vấn <span aria-hidden="true">→</span></Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
