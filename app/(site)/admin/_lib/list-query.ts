/**
 * Đọc/ghi trạng thái danh sách (trang, từ khóa, bộ lọc) trên query string để
 * tải lại trang hoặc chia sẻ link vẫn giữ nguyên chỗ đang xem.
 */

export type ListQuery = {
  page: number;
  search: string;
  filters: Record<string, string>;
};

type ParamsReader = { get(name: string): string | null };

export function readListQuery(
  params: ParamsReader,
  filterKeys: readonly string[],
  options: { includeSearch?: boolean } = {},
): ListQuery {
  const rawPage = params.get("page") ?? "";
  const page = /^[1-9]\d{0,5}$/.test(rawPage) ? Number(rawPage) : 1;
  const search =
    options.includeSearch === false ? "" : (params.get("q") ?? "").slice(0, 100);
  const filters: Record<string, string> = {};
  for (const key of filterKeys) {
    const value = params.get(key);
    if (value) filters[key] = value.slice(0, 50);
  }
  return { page, search, filters };
}

/** Trả về "" hoặc "?..." và bỏ các giá trị mặc định cho URL gọn. */
export function listQueryString(
  query: ListQuery,
  filterKeys: readonly string[],
  options: { includeSearch?: boolean } = {},
) {
  const params = new URLSearchParams();
  for (const key of filterKeys) {
    const value = query.filters[key];
    if (value) params.set(key, value);
  }
  if (options.includeSearch !== false && query.search.trim()) {
    params.set("q", query.search.trim());
  }
  if (query.page > 1) params.set("page", String(query.page));
  const text = params.toString();
  return text ? `?${text}` : "";
}

/**
 * Danh sách số trang để hiển thị, có "…" khi bị rút gọn. Luôn gồm trang đầu,
 * trang cuối và hai trang lân cận trang hiện tại.
 */
export function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  const result: (number | "…")[] = [];
  for (const page of sorted) {
    const previous = result[result.length - 1];
    if (typeof previous === "number" && page - previous === 2) result.push(previous + 1);
    else if (typeof previous === "number" && page - previous > 2) result.push("…");
    result.push(page);
  }
  return result;
}
