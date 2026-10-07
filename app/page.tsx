"use client";

import { useMemo, useState } from "react";

type Vehicle = {
  name: string;
  type: string;
  category: string;
  description: string;
  image: "cargo" | "fire" | "rescue";
  badge: string;
};

const vehicles: Vehicle[] = [
  {
    name: "FAW J6L thùng bạt 2 tầng",
    type: "FAW · Xe tải",
    category: "Xe tải",
    description: "Bửng nâng thủy lực · Tối ưu chở hàng cồng kềnh",
    image: "cargo",
    badge: "Xe tải",
  },
  {
    name: "Xe chữa cháy Isuzu 4 khối",
    type: "ISUZU · Xe chữa cháy",
    category: "Xe chữa cháy",
    description: "Bồn nước 4 m³ · Cấu hình theo yêu cầu",
    image: "fire",
    badge: "Xe chuyên dụng",
  },
  {
    name: "Xe cứu hộ Foton 2 chức năng",
    type: "FOTON · Xe cứu hộ",
    category: "Xe cứu hộ",
    description: "Sàn trượt và cẩu kéo · Linh hoạt trong đô thị",
    image: "rescue",
    badge: "Xe chuyên dụng",
  },
];

const categories = ["Tất cả", "Xe tải", "Xe chữa cháy", "Xe cứu hộ"];

function ArrowIcon({ diagonal = false }: { diagonal?: boolean }) {
  return diagonal ? (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M5 15 15 5M6 5h9v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M3.5 10h13m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <circle cx="8.8" cy="8.8" r="5.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M16 8.2c0 4.1-6 9-6 9s-6-4.9-6-9a6 6 0 1 1 12 0Z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function VehicleArtwork({ kind }: { kind: Vehicle["image"] }) {
  return (
    <svg className={`vehicle-art vehicle-art-${kind}`} viewBox="0 0 600 330" fill="none" aria-hidden="true">
      <ellipse cx="308" cy="279" rx="246" ry="18" fill="#20394B" opacity=".12" />
      {kind === "fire" ? (
        <g stroke="#183348" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M105 135h234v104H105z" fill="#D94B3D" />
          <path d="M126 147h192v79H126z" fill="#E95849" strokeWidth="4" />
          <path d="M129 171h185M164 148v77m48-77v77m48-77v77" stroke="#F6B8A7" strokeWidth="3" />
          <path d="M339 167h103l47 72H339z" fill="#D94B3D" />
          <path d="M359 176h59l34 45h-93z" fill="#D9E8EA" strokeWidth="4" />
          <path d="M115 239h412M364 152h59" />
          <path d="M140 135v-15h55v15m-42-15v-13h30v13" fill="#E5AF32" strokeWidth="5" />
          <path d="M451 167h18v14h-18z" fill="#E5AF32" strokeWidth="4" />
          <circle cx="184" cy="252" r="25" fill="#1A2F40" />
          <circle cx="184" cy="252" r="10" fill="#E7EDEF" strokeWidth="4" />
          <circle cx="440" cy="252" r="25" fill="#1A2F40" />
          <circle cx="440" cy="252" r="10" fill="#E7EDEF" strokeWidth="4" />
          <path d="M100 238h-16v-30h21m394 30h20" />
        </g>
      ) : kind === "rescue" ? (
        <g stroke="#183348" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M107 161h224v76H107z" fill="#E8A72F" />
          <path d="m114 160 10-62h153l13 62z" fill="#E8A72F" />
          <path d="M331 180h98l48 57H331z" fill="#E8A72F" />
          <path d="M351 188h59l34 39h-93z" fill="#D9E8EA" strokeWidth="4" />
          <path d="M122 113h145m-128 16h120" stroke="#F8D77B" strokeWidth="5" />
          <path d="M153 237h364M317 177l77-78 23 12-68 76m-11-11 104-91 14 12-87 79" fill="#5D7888" />
          <path d="m396 100 20-20 14 11-20 20m14-21 33-20 8 10-27 23m-57 84 23 4-5 17" />
          <circle cx="178" cy="250" r="25" fill="#1A2F40" />
          <circle cx="178" cy="250" r="10" fill="#E7EDEF" strokeWidth="4" />
          <circle cx="432" cy="250" r="25" fill="#1A2F40" />
          <circle cx="432" cy="250" r="10" fill="#E7EDEF" strokeWidth="4" />
          <path d="M115 238h-18v-35h19" />
        </g>
      ) : (
        <g stroke="#183348" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M89 114h268v126H89z" fill="#54788E" />
          <path d="m104 128 16-30h222l12 30z" fill="#7695A6" strokeWidth="4" />
          <path d="M111 148h225m-224 19h225m-225 19h225m-225 19h225" stroke="#A9BEC6" strokeWidth="3" />
          <path d="M357 166h90l49 74H357z" fill="#E8A72F" />
          <path d="M376 175h54l34 48h-88z" fill="#D9E8EA" strokeWidth="4" />
          <path d="M89 240h436" />
          <path d="M357 148h57v14" stroke="#F3C757" strokeWidth="5" />
          <circle cx="165" cy="252" r="25" fill="#1A2F40" />
          <circle cx="165" cy="252" r="10" fill="#E7EDEF" strokeWidth="4" />
          <circle cx="425" cy="252" r="25" fill="#1A2F40" />
          <circle cx="425" cy="252" r="10" fill="#E7EDEF" strokeWidth="4" />
          <path d="M100 240H82v-35h19m-2-91h248" />
        </g>
      )}
      <path d="M42 287h510" stroke="#A9B9C0" strokeWidth="2" strokeDasharray="7 10" />
    </svg>
  );
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [search, setSearch] = useState("");

  const filteredVehicles = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi");
    return vehicles.filter((vehicle) => {
      const matchesCategory = activeCategory === "Tất cả" || vehicle.category === activeCategory;
      const matchesSearch =
        !query ||
        `${vehicle.name} ${vehicle.type} ${vehicle.category}`
          .toLocaleLowerCase("vi")
          .includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  return (
    <main>
      <div className="topbar">
        <div className="topbar-inner">
          <span className="topbar-brand">XE CHUYÊN DỤNG <i /> ĐỒNG HÀNH CÙNG DOANH NGHIỆP VIỆT</span>
          <div className="topbar-info">
            <span><PinIcon /> Tư vấn và hỗ trợ khách hàng toàn quốc</span>
            <a href="#tu-van">Trao đổi với chuyên viên <ArrowIcon /></a>
          </div>
        </div>
      </div>

      <header className="site-header">
        <a className="brand" href="#trang-chu" aria-label="Xe Chuyên Dụng, trang chủ">
          <span className="brand-mark"><span /></span>
          <span className="brand-name">XE CHUYÊN DỤNG<span>.VN</span><small>GIẢI PHÁP VẬN TẢI</small></span>
        </a>
        <nav className="main-nav" aria-label="Điều hướng chính">
          <a className="nav-active" href="#trang-chu">Trang chủ</a>
          <a href="#danh-muc">Danh mục xe</a>
          <a href="#san-pham">Sản phẩm</a>
          <a href="#dich-vu">Dịch vụ</a>
        </nav>
        <a className="header-contact" href="#tu-van">Nhận tư vấn <ArrowIcon /></a>
      </header>

      <section className="hero" id="trang-chu">
        <div className="hero-copy">
          <div className="eyebrow"><span /> CHUYÊN XE TẢI &amp; XE CHUYÊN DỤNG</div>
          <h1>Một chiếc xe tốt.<br /><span>Vững mọi công trình.</span></h1>
          <p>Tư vấn giải pháp vận tải theo đúng nhu cầu — từ xe tải đến xe chuyên dụng được thiết kế riêng cho công việc của bạn.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#san-pham">Khám phá dòng xe <ArrowIcon /></a>
            <a className="button button-ghost" href="#tu-van">Hỗ trợ chọn xe</a>
          </div>
          <div className="hero-assurance">
            <span className="assurance-icon"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z" stroke="currentColor" strokeWidth="1.5" /><path d="m8.5 12 2.2 2.2 4.8-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
            <span><strong>Tư vấn đúng nhu cầu</strong><small>Hỗ trợ cấu hình và thủ tục xe</small></span>
          </div>
        </div>
        <div className="hero-scene">
          <div className="scene-circle" />
          <div className="scene-label"><span /> XE CHUYÊN DỤNG NỔI BẬT</div>
          <div className="scene-model">ISUZU <span>4 KHỐI</span></div>
          <VehicleArtwork kind="fire" />
          <div className="scene-caption"><span>GIẢI PHÁP CHO CÔNG TRÌNH</span><strong>Thiết kế theo nhiệm vụ</strong></div>
          <div className="scene-number">01 <span>/ 03</span></div>
        </div>
      </section>

      <section className="benefits" id="dich-vu" aria-label="Dịch vụ hỗ trợ">
        <div className="benefit-item"><span className="benefit-number">01</span><div><strong>Tư vấn cấu hình</strong><small>Chọn xe theo đúng mục đích sử dụng</small></div></div>
        <div className="benefit-item"><span className="benefit-number">02</span><div><strong>Hỗ trợ hồ sơ</strong><small>Đồng hành trong quá trình hoàn thiện xe</small></div></div>
        <div className="benefit-item"><span className="benefit-number">03</span><div><strong>Phục vụ toàn quốc</strong><small>Kết nối tư vấn ở mọi tỉnh thành</small></div></div>
        <a className="benefit-link" href="#tu-van">Tìm hiểu dịch vụ <ArrowIcon diagonal /></a>
      </section>

      <section className="catalog" id="san-pham">
        <div className="section-heading">
          <div>
            <div className="section-kicker">DANH MỤC XE</div>
            <h2>Giải pháp xe<br /><span>cho từng công việc.</span></h2>
          </div>
          <p>Tham khảo các dòng xe tiêu biểu và trao đổi với chuyên viên để lựa chọn cấu hình phù hợp với nhu cầu vận hành.</p>
        </div>

        <div className="category-ribbon" id="danh-muc">
          <div className="category-ribbon-label">KHÁM PHÁ THEO NHU CẦU</div>
          <div className="category-ribbon-links">
            {categories.slice(1).map((category, index) => (
              <button
                className={activeCategory === category ? "category-link category-link-active" : "category-link"}
                key={category}
                onClick={() => setActiveCategory(activeCategory === category ? "Tất cả" : category)}
                type="button"
              >
                <span>0{index + 1}</span>{category}<ArrowIcon diagonal />
              </button>
            ))}
          </div>
        </div>

        <div className="catalog-controls">
          <div className="catalog-title"><strong>SẢN PHẨM TIÊU BIỂU</strong><span>{filteredVehicles.length} dòng xe</span></div>
          <div className="catalog-tools">
            <div className="category-tabs" role="group" aria-label="Lọc theo danh mục">
              {categories.map((category) => (
                <button
                  className={activeCategory === category ? "category-tab selected" : "category-tab"}
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>
            <label className="search-box">
              <SearchIcon />
              <input
                aria-label="Tìm kiếm xe"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm dòng xe..."
                value={search}
              />
            </label>
          </div>
        </div>

        {filteredVehicles.length > 0 ? (
          <div className="vehicle-grid">
            {filteredVehicles.map((vehicle) => (
              <article className="vehicle-card" key={vehicle.name}>
                <div className={`card-image card-image-${vehicle.image}`}>
                  <span className="vehicle-badge"><i />{vehicle.badge}</span>
                  <VehicleArtwork kind={vehicle.image} />
                  <a className="card-open" href="#tu-van" aria-label={`Tư vấn ${vehicle.name}`}><ArrowIcon diagonal /></a>
                </div>
                <div className="card-details">
                  <span className="vehicle-type">{vehicle.type}</span>
                  <h3>{vehicle.name}</h3>
                  <p>{vehicle.description}</p>
                  <div className="card-footer"><strong>Liên hệ báo giá</strong><a href="#tu-van">Tư vấn xe <ArrowIcon /></a></div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">Chưa tìm thấy dòng xe phù hợp. Hãy thử từ khóa hoặc danh mục khác.</div>
        )}

        <div className="catalog-footer">
          <span>Giá bán và cấu hình thay đổi theo nhu cầu thực tế.</span>
          <a href="#tu-van">Xem thêm danh mục <ArrowIcon /></a>
        </div>
      </section>

      <section className="quote-banner" id="tu-van">
        <div className="quote-copy">
          <span className="section-kicker">BẠN ĐANG TÌM DÒNG XE NÀO?</span>
          <h2>Chia sẻ nhu cầu.<br /><span>Chúng tôi cùng tìm giải pháp.</span></h2>
        </div>
        <p>Từ mục đích sử dụng đến cấu hình xe, hãy bắt đầu bằng một cuộc trao đổi với đội ngũ tư vấn.</p>
        <a className="button button-primary" href="#san-pham">Chọn dòng xe quan tâm <ArrowIcon /></a>
      </section>

      <footer className="site-footer">
        <a className="brand" href="#trang-chu">
          <span className="brand-mark"><span /></span>
          <span className="brand-name">XE CHUYÊN DỤNG<span>.VN</span><small>GIẢI PHÁP VẬN TẢI</small></span>
        </a>
        <span>Giải pháp xe tải và xe chuyên dụng cho doanh nghiệp Việt.</span>
        <a href="#tu-van">Liên hệ tư vấn <ArrowIcon /></a>
      </footer>
    </main>
  );
}
