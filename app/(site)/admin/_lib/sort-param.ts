export type SortState = { key: string; direction: "asc" | "desc" } | null;

/** "name:asc" ↔ { key, direction }. Chuỗi rỗng = thứ tự mặc định của server. */
export function parseSortParam(value: string | undefined): SortState {
  const match = /^([A-Za-z]+):(asc|desc)$/.exec(value ?? "");
  return match ? { key: match[1], direction: match[2] as "asc" | "desc" } : null;
}

/** Bấm lần lượt: tăng dần → giảm dần → về mặc định. */
export function nextSortParam(current: SortState, key: string) {
  if (!current || current.key !== key) return `${key}:asc`;
  return current.direction === "asc" ? `${key}:desc` : "";
}
