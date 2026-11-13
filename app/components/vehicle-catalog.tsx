"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import KitImage from "./kit-image";
import VehicleArtwork from "./vehicle-artwork";
import {
  vehicleCategories,
  vehicleCategoryBySlug,
  type VehicleCategory,
  type Vehicle,
} from "../data/vehicles";

const maximumComparedVehicles = 3;
type CatalogCategory = "Tất cả" | VehicleCategory;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLocaleLowerCase("vi");
}

export default function VehicleCatalog({ vehicles }: { vehicles: Vehicle[] }) {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("loai");
  const category =
    Object.entries(vehicleCategoryBySlug).find(([slug]) => slug === categorySlug)?.[1] ?? "Tất cả";
  const initialCategory: CatalogCategory =
    category === "Tất cả" || vehicleCategories.includes(category) ? category : "Tất cả";

  return <VehicleCatalogContent key={searchParams.toString()} initialCategory={initialCategory} vehicles={vehicles} />;
}

function VehicleCatalogContent({
  initialCategory,
  vehicles,
}: {
  initialCategory: CatalogCategory;
  vehicles: Vehicle[];
}) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [search, setSearch] = useState("");
  const [comparedSlugs, setComparedSlugs] = useState<string[]>([]);
  const comparisonDialog = useRef<HTMLDialogElement>(null);
  const comparedVehicles = comparedSlugs
    .map((slug) => vehicles.find((vehicle) => vehicle.slug === slug))
    .filter((vehicle) => vehicle !== undefined);

  const filteredVehicles = useMemo(() => {
    const query = normalize(search.trim());
    return vehicles.filter((vehicle) => {
      const matchesCategory = activeCategory === "Tất cả" || vehicle.category === activeCategory;
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
  }, [activeCategory, search, vehicles]);

  const countOf = (category: CatalogCategory) =>
    category === "Tất cả" ? vehicles.length : vehicles.filter((vehicle) => vehicle.category === category).length;

  function toggleComparedVehicle(slug: string) {
    setComparedSlugs((current) => {
      if (current.includes(slug)) return current.filter((item) => item !== slug);
      if (current.length >= maximumComparedVehicles) return current;
      return [...current, slug];
    });
  }

  return (
    <>
      <div className="pg-filters" id="danh-muc">
        <div className="tabs" role="group" aria-label="Lọc theo nhóm xe">
          {vehicleCategories.map((category) => (
            <button
              aria-pressed={activeCategory === category}
              className="tab"
              key={category}
              onClick={() => setActiveCategory(category)}
              type="button"
            >
              {category} <span className="pg-count">{countOf(category)}</span>
            </button>
          ))}
        </div>
        <label className="field pg-search">
          <span className="sr-only">Tìm kiếm xe</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
            <circle cx="8.8" cy="8.8" r="5.6" stroke="currentColor" strokeWidth="1.6" />
            <path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo tên xe, hãng, công năng"
            type="search"
            value={search}
          />
        </label>
      </div>
      <p className="pg-result t-small muted" aria-live="polite" aria-atomic="true">
        {filteredVehicles.length} dòng xe{activeCategory !== "Tất cả" ? ` trong nhóm ${activeCategory}` : ""}
      </p>

      {filteredVehicles.length > 0 ? (
        <ul className="grid pg-vehicles">
          {filteredVehicles.map((vehicle) => {
            const compared = comparedSlugs.includes(vehicle.slug);
            return (
              <li className="span-4 pg-vehicle" key={vehicle.slug}>
                <Link className="tile" href={`/xe/${vehicle.slug}`}>
                  <div className="tile__media">
                    {vehicle.images[0] ? (
                      <KitImage
                        alt={vehicle.name}
                        loading="lazy"
                        maxWidth={1080}
                        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 420px"
                        src={vehicle.images[0]}
                      />
                    ) : (
                      <div className="pg-artwork"><VehicleArtwork kind={vehicle.artwork} /></div>
                    )}
                  </div>
                  <div className="tile__head">
                    <h2 className="pg-tile-title">{vehicle.name}</h2>
                  </div>
                  <p className="tile__facts">{vehicle.make} · {vehicle.category}</p>
                  <p className="pg-clamp">{vehicle.description}</p>
                </Link>
                <div className="pg-vehicle__actions">
                  <button
                    aria-pressed={compared}
                    className="btn btn--secondary btn--sm"
                    disabled={!compared && comparedSlugs.length >= maximumComparedVehicles}
                    onClick={() => toggleComparedVehicle(vehicle.slug)}
                    type="button"
                  >
                    {compared ? "✓ Đã chọn so sánh" : "Chọn so sánh"}
                  </button>
                  <Link className="link" href={`/lien-he?xe=${vehicle.slug}#contact-form`}>Hỏi về xe này</Link>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="card pg-empty">
          <h3>Không có dòng xe khớp bộ lọc</h3>
          <p>Thử từ khóa khác hoặc chọn nhóm “Tất cả”.</p>
        </div>
      )}
      <p className="pg-note t-small muted">
        Danh mục gồm thông tin mẫu và thông tin tham khảo từ nguồn bên ngoài. Hãy xác nhận cấu hình, tình trạng xe, giá bán và thời gian giao trước khi quyết định.
      </p>

      {comparedVehicles.length > 0 && (
        <aside className="pg-compare-bar ground-inverse" aria-label="Danh sách xe đang chọn so sánh">
          <div className="wrap pg-compare-bar__in">
            <div className="pg-compare-bar__text">
              <strong aria-live="polite">Đã chọn {comparedVehicles.length}/{maximumComparedVehicles} xe</strong>
              <span>{comparedVehicles.map((vehicle) => vehicle.name).join(" · ")}</span>
            </div>
            <div className="btn-row">
              <button className="btn btn--secondary btn--sm" onClick={() => setComparedSlugs([])} type="button">
                Xóa lựa chọn
              </button>
              <button
                className="btn btn--primary btn--sm"
                disabled={comparedVehicles.length < 2}
                onClick={() => comparisonDialog.current?.showModal()}
                type="button"
              >
                {comparedVehicles.length < 2 ? "Chọn thêm 1 xe để so sánh" : "So sánh xe"}
              </button>
            </div>
          </div>
        </aside>
      )}

      <dialog
        aria-labelledby="vehicle-comparison-title"
        className="pg-dialog"
        onClick={(event) => {
          // Bấm vào nền mờ bên ngoài hộp thoại thì đóng.
          if (event.target === event.currentTarget) comparisonDialog.current?.close();
        }}
        ref={comparisonDialog}
      >
        <div className="pg-dialog__head">
          <div className="section-head">
            <h2 id="vehicle-comparison-title">So sánh xe đã chọn</h2>
            <p className="t-small">
              Đối chiếu thông tin tham khảo hiện có, không phải bảng thông số đã xác minh. Xác nhận cấu hình và hồ sơ từng xe trước khi quyết định.
            </p>
          </div>
          <button
            aria-label="Đóng bảng so sánh"
            className="nav__toggle pg-dialog__close"
            onClick={() => comparisonDialog.current?.close()}
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div className="pg-table-wrap">
          <table className="pg-table">
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
                        <li key={detail.label}><span className="muted">{detail.label}:</span> {detail.value}</li>
                      ))}
                    </ul>
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row">Mục đích sử dụng</th>
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
        <div className="pg-dialog__foot">
          <span className="t-small muted">Chọn tối đa {maximumComparedVehicles} xe để dễ đối chiếu.</span>
          <button className="btn btn--primary" onClick={() => comparisonDialog.current?.close()} type="button">
            Đóng bảng so sánh
          </button>
        </div>
      </dialog>
    </>
  );
}
