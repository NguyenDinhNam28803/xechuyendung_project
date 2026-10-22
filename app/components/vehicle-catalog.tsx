"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import VehicleArtwork from "./vehicle-artwork";
import {
  getVehicleBySlug,
  vehicleCategories,
  vehicleCategoryBySlug,
  type VehicleCategory,
  vehicles,
} from "../data/vehicles";

const maximumComparedVehicles = 3;
type CatalogCategory = "Tất cả" | VehicleCategory;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLocaleLowerCase("vi");
}

export default function VehicleCatalog() {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("loai");
  const category =
    Object.entries(vehicleCategoryBySlug).find(([slug]) => slug === categorySlug)?.[1] ?? "Tất cả";
  const initialCategory: CatalogCategory =
    category === "Tất cả" || vehicleCategories.includes(category) ? category : "Tất cả";

  return <VehicleCatalogContent key={searchParams.toString()} initialCategory={initialCategory} />;
}

function VehicleCatalogContent({ initialCategory }: { initialCategory: CatalogCategory }) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [search, setSearch] = useState("");
  const [comparedSlugs, setComparedSlugs] = useState<string[]>([]);
  const comparisonDialog = useRef<HTMLDialogElement>(null);
  const comparedVehicles = comparedSlugs
    .map((slug) => getVehicleBySlug(slug))
    .filter((vehicle) => vehicle !== undefined);

  const filteredVehicles = useMemo(() => {
    const query = normalize(search.trim());
    return vehicles.filter((vehicle) => {
      const matchesCategory =
        activeCategory === "Tất cả" || vehicle.category === activeCategory;
      const matchesSearch =
        !query ||
        normalize(
          [
            vehicle.name,
            vehicle.make,
            vehicle.category,
            vehicle.description,
            vehicle.useCase,
            ...vehicle.highlights,
            ...vehicle.knownDetails.flatMap(({ label, value }) => [label, value]),
          ].join(" "),
        ).includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  function toggleComparedVehicle(slug: string) {
    setComparedSlugs((current) => {
      if (current.includes(slug)) return current.filter((item) => item !== slug);
      if (current.length >= maximumComparedVehicles) return current;
      return [...current, slug];
    });
  }

  return (
    <>
      <div className="catalog-controls" id="danh-muc">
        <div className="catalog-title">
          <strong>XE THEO NHU CẦU</strong>
          <span aria-atomic="true" aria-live="polite">{filteredVehicles.length} dòng xe</span>
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
              placeholder="Tìm xe, hãng, công năng..."
              type="search"
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
                <h2><Link href={`/xe/${vehicle.slug}`}>{vehicle.name}</Link></h2>
                <p>{vehicle.description}</p>
                <button
                  aria-pressed={comparedSlugs.includes(vehicle.slug)}
                  className="vehicle-compare-toggle"
                  disabled={
                    !comparedSlugs.includes(vehicle.slug) &&
                    comparedSlugs.length >= maximumComparedVehicles
                  }
                  onClick={() => toggleComparedVehicle(vehicle.slug)}
                  type="button"
                >
                  {comparedSlugs.includes(vehicle.slug) ? "Đã chọn so sánh" : "Chọn so sánh"}
                </button>
                <div className="card-footer">
                  <Link href={`/lien-he?xe=${vehicle.slug}#contact-form`}>Yêu cầu tư vấn</Link>
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
        Danh mục gồm thông tin mẫu và thông tin tham khảo từ nguồn bên ngoài. Hãy xác nhận cấu hình, tình trạng xe, giá bán và thời gian giao trước khi quyết định.
      </p>

      {comparedVehicles.length > 0 && (
        <aside className="vehicle-compare-bar" aria-label="Danh sách xe đang chọn so sánh">
          <div className="vehicle-compare-summary">
            <strong aria-live="polite">
              Đã chọn {comparedVehicles.length}/{maximumComparedVehicles} xe
            </strong>
            <span>{comparedVehicles.map((vehicle) => vehicle.name).join(" · ")}</span>
          </div>
          <div className="vehicle-compare-actions">
            <button
              className="button button-primary"
              disabled={comparedVehicles.length < 2}
              onClick={() => comparisonDialog.current?.showModal()}
              type="button"
            >
              So sánh xe
            </button>
            <button
              className="vehicle-compare-clear"
              onClick={() => setComparedSlugs([])}
              type="button"
            >
              Xóa lựa chọn
            </button>
          </div>
        </aside>
      )}

      <dialog
        aria-labelledby="vehicle-comparison-title"
        className="vehicle-comparison-dialog"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            comparisonDialog.current?.close();
          }
        }}
        ref={comparisonDialog}
      >
        <div className="vehicle-comparison-heading">
          <div>
            <span className="section-kicker">ĐỐI CHIẾU DANH MỤC</span>
            <h2 id="vehicle-comparison-title">So sánh xe đã chọn</h2>
          </div>
          <button
            aria-label="Đóng bảng so sánh"
            className="vehicle-comparison-close"
            onClick={() => comparisonDialog.current?.close()}
            type="button"
          >
            ×
          </button>
        </div>
        <p className="vehicle-comparison-note">
          Đây là đối chiếu thông tin tham khảo hiện có, không phải bảng thông số kỹ thuật đã xác minh.
          Vui lòng xác nhận cấu hình và hồ sơ của từng xe trước khi quyết định.
        </p>
        <div className="vehicle-comparison-table-wrap">
          <table className="vehicle-comparison-table">
            <thead>
              <tr>
                <th scope="col">Tiêu chí</th>
                {comparedVehicles.map((vehicle) => (
                  <th key={vehicle.slug} scope="col">{vehicle.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Nhóm xe</th>
                {comparedVehicles.map((vehicle) => <td key={vehicle.slug}>{vehicle.category}</td>)}
              </tr>
              <tr>
                <th scope="row">Nhãn hiệu</th>
                {comparedVehicles.map((vehicle) => <td key={vehicle.slug}>{vehicle.make}</td>)}
              </tr>
              <tr>
                <th scope="row">Thông tin đang có</th>
                {comparedVehicles.map((vehicle) => (
                  <td key={vehicle.slug}>
                    <ul>
                      {vehicle.knownDetails.map((detail) => (
                        <li key={detail.label}><strong>{detail.label}:</strong> {detail.value}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">Mục đích tham khảo</th>
                {comparedVehicles.map((vehicle) => <td key={vehicle.slug}>{vehicle.useCase}</td>)}
              </tr>
              <tr>
                <th scope="row">Trạng thái</th>
                {comparedVehicles.map((vehicle) => (
                  <td key={vehicle.slug}>
                    {vehicle.badge === "Dữ liệu mẫu"
                      ? "Cấu hình tham khảo, chưa xác nhận"
                      : "Nội dung giới thiệu, cần đối chiếu thực tế"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div className="vehicle-comparison-footer">
          <span>Chọn tối đa {maximumComparedVehicles} xe để dễ đối chiếu.</span>
          <button
            className="button button-primary"
            onClick={() => comparisonDialog.current?.close()}
            type="button"
          >
            Đóng bảng so sánh
          </button>
        </div>
      </dialog>
    </>
  );
}
