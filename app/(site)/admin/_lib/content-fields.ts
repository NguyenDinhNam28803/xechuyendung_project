/**
 * Chuẩn hóa và kiểm tra các trường có cấu trúc trong form nội dung (thông số
 * xe, ảnh, mục bài viết) trước khi gửi lên server. Giới hạn khớp với
 * content-validation.ts của server để báo lỗi ngay trên form.
 */

export type SpecRow = { label: string; value: string };
export type ArticleSectionRow = { heading: string; paragraphs: string };

export const limits = {
  images: 4,
  imageLength: 500,
  specs: 30,
  specLabel: 120,
  specValue: 500,
  sections: 50,
  paragraphs: 50,
} as const;

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

/** Ảnh hợp lệ: URL HTTPS hoặc đường dẫn nội bộ bắt đầu bằng "/" (không phải "//"). */
export function isAllowedImageUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > limits.imageLength) return false;
  if (trimmed.startsWith("/")) return !trimmed.startsWith("//") && !trimmed.includes("\\");
  try {
    return new URL(trimmed).protocol === "https:";
  } catch {
    return false;
  }
}

export function cleanImages(rows: string[]): Result<string[]> {
  const images = rows.map((row) => row.trim()).filter(Boolean);
  if (images.length > limits.images) {
    return { ok: false, error: `Tối đa ${limits.images} ảnh cho mỗi xe.` };
  }
  const invalid = images.find((image) => !isAllowedImageUrl(image));
  if (invalid) {
    return {
      ok: false,
      error: `Ảnh "${invalid.slice(0, 60)}" phải là URL https:// hoặc đường dẫn bắt đầu bằng /.`,
    };
  }
  return { ok: true, value: images };
}

/** Bỏ dòng trống hoàn toàn; dòng chỉ có nhãn hoặc chỉ có giá trị là lỗi. */
export function cleanSpecs(rows: SpecRow[]): Result<SpecRow[]> {
  const specs = rows
    .map((row) => ({ label: row.label.trim(), value: row.value.trim() }))
    .filter((row) => row.label || row.value);
  if (specs.length > limits.specs) {
    return { ok: false, error: `Tối đa ${limits.specs} thông số.` };
  }
  const index = specs.findIndex((row) => !row.label || !row.value);
  if (index >= 0) {
    return { ok: false, error: `Thông số thứ ${index + 1} cần có cả tên và giá trị.` };
  }
  const tooLong = specs.findIndex(
    (row) => row.label.length > limits.specLabel || row.value.length > limits.specValue,
  );
  if (tooLong >= 0) {
    return {
      ok: false,
      error: `Thông số thứ ${tooLong + 1} quá dài (tên ≤ ${limits.specLabel}, giá trị ≤ ${limits.specValue} ký tự).`,
    };
  }
  return { ok: true, value: specs };
}

/** Tách đoạn văn theo dòng trống. */
export function splitParagraphs(value: string) {
  return value
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function joinParagraphs(paragraphs: string[]) {
  return paragraphs.join("\n\n");
}

export function cleanSections(
  rows: ArticleSectionRow[],
): Result<{ heading: string; paragraphs: string[] }[]> {
  const sections = rows
    .map((row) => ({ heading: row.heading.trim(), paragraphs: splitParagraphs(row.paragraphs) }))
    .filter((row) => row.heading || row.paragraphs.length > 0);
  if (sections.length === 0) {
    return { ok: false, error: "Bài viết cần ít nhất một mục nội dung." };
  }
  if (sections.length > limits.sections) {
    return { ok: false, error: `Tối đa ${limits.sections} mục nội dung.` };
  }
  const missingHeading = sections.findIndex((section) => !section.heading);
  if (missingHeading >= 0) {
    return { ok: false, error: `Mục thứ ${missingHeading + 1} cần có tiêu đề.` };
  }
  const tooMany = sections.findIndex((section) => section.paragraphs.length > limits.paragraphs);
  if (tooMany >= 0) {
    return { ok: false, error: `Mục thứ ${tooMany + 1} có quá ${limits.paragraphs} đoạn văn.` };
  }
  return { ok: true, value: sections };
}

/** Di chuyển phần tử trong mảng (dùng cho nút lên/xuống). */
export function moveItem<T>(items: T[], from: number, to: number) {
  if (to < 0 || to >= items.length || from === to) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
