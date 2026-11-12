"use client";

import {
  isAllowedImageUrl,
  limits,
  moveItem,
  type ArticleSectionRow,
  type SpecRow,
} from "../_lib/content-fields";
import { slugify } from "../_lib/slug";

/**
 * Ô slug: khi tạo mới, slug tự sinh theo tên cho tới khi người dùng tự sửa;
 * khi chỉnh sửa, slug giữ nguyên (đổi slug làm hỏng link đã chia sẻ) nhưng có
 * nút tạo lại từ tên.
 */
export function SlugField({
  value,
  source,
  onChange,
  hint,
}: {
  value: string;
  source: string;
  onChange: (slug: string) => void;
  hint?: string;
}) {
  const suggested = slugify(source);
  return (
    <label>
      Slug
      <span className="admin-slug-field">
        <input
          maxLength={120}
          onChange={(event) => onChange(event.target.value)}
          placeholder={suggested || "vi-du-slug"}
          required
          value={value}
        />
        <button
          className="admin-table-button"
          disabled={!suggested || suggested === value}
          onClick={() => onChange(suggested)}
          title="Tạo slug từ tên"
          type="button"
        >
          ↻ Từ tên
        </button>
      </span>
      {hint && <small className="admin-field-hint">{hint}</small>}
    </label>
  );
}

function RowButtons({
  index,
  count,
  onMove,
  onRemove,
  label,
}: {
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  label: string;
}) {
  return (
    <span className="admin-row-buttons">
      <button
        aria-label={`Đưa ${label} ${index + 1} lên`}
        disabled={index === 0}
        onClick={() => onMove(index, index - 1)}
        type="button"
      >
        ↑
      </button>
      <button
        aria-label={`Đưa ${label} ${index + 1} xuống`}
        disabled={index === count - 1}
        onClick={() => onMove(index, index + 1)}
        type="button"
      >
        ↓
      </button>
      <button
        aria-label={`Xóa ${label} ${index + 1}`}
        className="is-danger"
        onClick={() => onRemove(index)}
        type="button"
      >
        ✕
      </button>
    </span>
  );
}

/** Bảng thông số kỹ thuật dạng tên/giá trị, thay cho nhập JSON thủ công. */
export function SpecsEditor({
  value,
  onChange,
}: {
  value: SpecRow[];
  onChange: (rows: SpecRow[]) => void;
}) {
  const update = (index: number, patch: Partial<SpecRow>) =>
    onChange(value.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  return (
    <fieldset className="admin-fieldset admin-full-width">
      <legend>Thông số kỹ thuật</legend>
      {value.length === 0 && <p className="admin-field-hint">Chưa có thông số nào.</p>}
      <div className="admin-repeat-list">
        {value.map((row, index) => (
          <div className="admin-spec-row" key={index}>
            <input
              aria-label={`Tên thông số ${index + 1}`}
              maxLength={limits.specLabel}
              onChange={(event) => update(index, { label: event.target.value })}
              placeholder="Ví dụ: Tải trọng"
              value={row.label}
            />
            <input
              aria-label={`Giá trị thông số ${index + 1}`}
              maxLength={limits.specValue}
              onChange={(event) => update(index, { value: event.target.value })}
              placeholder="Ví dụ: 5 tấn"
              value={row.value}
            />
            <RowButtons
              count={value.length}
              index={index}
              label="thông số"
              onMove={(from, to) => onChange(moveItem(value, from, to))}
              onRemove={(target) => onChange(value.filter((_, rowIndex) => rowIndex !== target))}
            />
          </div>
        ))}
      </div>
      <button
        className="admin-add-button"
        disabled={value.length >= limits.specs}
        onClick={() => onChange([...value, { label: "", value: "" }])}
        type="button"
      >
        + Thêm thông số
      </button>
    </fieldset>
  );
}

/** Danh sách URL ảnh kèm ảnh xem trước (tối đa 4 ảnh). */
export function ImageListEditor({
  value,
  onChange,
}: {
  value: string[];
  onChange: (images: string[]) => void;
}) {
  return (
    <fieldset className="admin-fieldset admin-full-width">
      <legend>Hình ảnh (tối đa {limits.images})</legend>
      <p className="admin-field-hint">
        URL bắt đầu bằng https:// hoặc đường dẫn nội bộ bắt đầu bằng /. Ảnh đầu tiên là ảnh đại diện.
      </p>
      <div className="admin-repeat-list">
        {value.map((image, index) => {
          const valid = isAllowedImageUrl(image);
          return (
            <div className="admin-image-row" key={index}>
              <span className="admin-image-preview">
                {valid ? (
                  // Ảnh xem trước từ URL tùy ý: dùng <img> thường, không qua tối ưu ảnh của Next.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt={`Ảnh ${index + 1}`} loading="lazy" src={image.trim()} />
                ) : (
                  <span aria-hidden="true">{image.trim() ? "!" : "▧"}</span>
                )}
              </span>
              <input
                aria-invalid={image.trim() !== "" && !valid}
                aria-label={`URL ảnh ${index + 1}`}
                maxLength={limits.imageLength}
                onChange={(event) =>
                  onChange(value.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))
                }
                placeholder="https://... hoặc /images/..."
                value={image}
              />
              <RowButtons
                count={value.length}
                index={index}
                label="ảnh"
                onMove={(from, to) => onChange(moveItem(value, from, to))}
                onRemove={(target) => onChange(value.filter((_, itemIndex) => itemIndex !== target))}
              />
            </div>
          );
        })}
      </div>
      <button
        className="admin-add-button"
        disabled={value.length >= limits.images}
        onClick={() => onChange([...value, ""])}
        type="button"
      >
        + Thêm ảnh
      </button>
    </fieldset>
  );
}

/** Các mục của bài viết: tiêu đề mục + đoạn văn (cách nhau bằng một dòng trống). */
export function SectionsEditor({
  value,
  onChange,
}: {
  value: ArticleSectionRow[];
  onChange: (rows: ArticleSectionRow[]) => void;
}) {
  const update = (index: number, patch: Partial<ArticleSectionRow>) =>
    onChange(value.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  return (
    <fieldset className="admin-fieldset admin-full-width">
      <legend>Nội dung bài viết</legend>
      <p className="admin-field-hint">Mỗi mục gồm tiêu đề và các đoạn văn; để một dòng trống giữa hai đoạn.</p>
      <div className="admin-repeat-list">
        {value.map((section, index) => (
          <div className="admin-section-row" key={index}>
            <div className="admin-section-row-head">
              <strong>Mục {index + 1}</strong>
              <RowButtons
                count={value.length}
                index={index}
                label="mục"
                onMove={(from, to) => onChange(moveItem(value, from, to))}
                onRemove={(target) => onChange(value.filter((_, rowIndex) => rowIndex !== target))}
              />
            </div>
            <input
              aria-label={`Tiêu đề mục ${index + 1}`}
              maxLength={250}
              onChange={(event) => update(index, { heading: event.target.value })}
              placeholder="Tiêu đề mục"
              value={section.heading}
            />
            <textarea
              aria-label={`Đoạn văn của mục ${index + 1}`}
              onChange={(event) => update(index, { paragraphs: event.target.value })}
              placeholder={"Đoạn văn thứ nhất...\n\nĐoạn văn thứ hai..."}
              rows={6}
              value={section.paragraphs}
            />
          </div>
        ))}
      </div>
      <button
        className="admin-add-button"
        disabled={value.length >= limits.sections}
        onClick={() => onChange([...value, { heading: "", paragraphs: "" }])}
        type="button"
      >
        + Thêm mục
      </button>
    </fieldset>
  );
}
