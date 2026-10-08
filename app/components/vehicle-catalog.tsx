"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import VehicleArtwork from "./vehicle-artwork";
import { vehicleCategories, vehicles } from "../data/vehicles";

const categoryBySlug: Record<string, string> = {
  "xe-tai": "Xe tải",
  "xe-chua-chay": "Xe chữa cháy",
  "xe-cuu-ho": "Xe cứu hộ",
  "xe-bon-moi-truong": "Xe bồn / xe môi trường",
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("vi");
}

export default function VehicleCatalog() {
  const searchParams = useSearchParams();
  const category = categoryBySlug[searchParams.get("loai") ?? ""] ?? "Tất cả";
  const initialCategory = vehicleCategories.includes(category) ? category : "Tất cả";

  return <VehicleCatalogContent key={searchParams.toString()} initialCategory={initialCategory} />;
}

function VehicleCatalogContent({ initialCategory }: { initialCategory: string }) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [search, setSearch] = useState("");

  const filteredVehicles = useMemo(() => {
    const query = normalize(search.trim());
    return vehicles.filter((vehicle) => {
      const matchesCategory =
        activeCategory === "Tất cả" || vehicle.category === activeCategory;
      const matchesSearch =
        !query ||
        normalize(`${vehicle.name} ${vehicle.make} ${vehicle.category} ${vehicle.description}`).includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  return (
    <>
      <div className="catalog-controls" id="danh-muc">
        <div className="catalog-title">
          <strong>XE THEO NHU CẦU</strong>
          <span>{filteredVehicles.length} dòng xe</span>
        </div>
        <div className="catalog-tools">
          <div className="category-tabs" role="group" aria-label="Lọc theo danh mục">
            {vehicleCategories.map((category) => (
              <button
                aria-pressed={activeCategory === category}
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
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
              <circle cx="8.8" cy="8.8" r="5.6" stroke="currentColor" strokeWidth="1.6" />
              <path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              aria-label="Tìm kiếm xe"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm tên xe, hãng xe..."
              value={search}
            />
          </label>
        </div>
      </div>

      {filteredVehicles.length > 0 ? (
        <div className="vehicle-grid">
          {filteredVehicles.map((vehicle) => (
            <article className="vehicle-card" key={vehicle.slug}>
              <Link className={`card-image card-image-${vehicle.artwork}`} href={`/xe/${vehicle.slug}`} aria-label={`Xem ${vehicle.name}`}>
                <span className="vehicle-badge"><i />{vehicle.badge}</span>
                <VehicleArtwork kind={vehicle.artwork} />
                <span className="card-open" aria-hidden="true">↗</span>
              </Link>
              <div className="card-details">
                <span className="vehicle-type">{vehicle.make} · {vehicle.category}</span>
                <h2><Link href={`/xe/${vehicle.slug}`}>{vehicle.name}</Link></h2>
                <p>{vehicle.description}</p>
                <div className="card-footer">
                  <strong>Liên hệ báo giá</strong>
                  <Link href={`/xe/${vehicle.slug}`}>Xem chi tiết <span aria-hidden="true">→</span></Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          Không tìm thấy dòng xe phù hợp. Thử từ khóa khác hoặc chọn “Tất cả”.
        </div>
      )}
      <p className="catalog-disclaimer">
        Danh mục đang dùng dữ liệu mẫu. Thông số, tình trạng xe, giá bán và thời gian giao cần được xác nhận trực tiếp.
      </p>
    </>
  );
}
