const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const crudCollections = [
  "vehicles",
  "articles",
  "legal-resources",
  "users",
  "vehicle-categories",
];
/** Nội dung có trạng thái xuất bản, hỗ trợ thao tác hàng loạt. */
const bulkCollections = ["vehicles", "articles", "legal-resources"];
const statsReports = ["overview", "contacts", "activity"];

/**
 * Tham số query (GET) được chuyển tiếp tới API; mọi tham số khác bị bỏ. Giá
 * trị do NestJS kiểm tra, ở đây chỉ giới hạn TÊN tham số.
 */
export const forwardedQueryKeys = [
  "page",
  "limit",
  "q",
  "type",
  "published",
  "sort",
  "action",
  "entityType",
  "from",
  "to",
  "days",
] as const;

/**
 * Whitelist đường dẫn được phép chuyển tiếp tới /api/v1/admin/*. Mọi đường
 * dẫn khác trả 404 ngay tại Next.js, nên proxy không thể bị dùng để gọi tùy ý
 * vào API (SSRF/path traversal). Quyền theo vai trò do NestJS kiểm tra.
 */
export function isAllowedPath(path: string[]) {
  const [first, second, third, fourth] = path;
  if (path.length === 1) {
    return [
      ...crudCollections,
      "activity",
      "contact-submissions",
      "import-defaults",
    ].includes(first);
  }
  if (path.length === 2) {
    return (
      (crudCollections.includes(first) && uuid.test(second)) ||
      (bulkCollections.includes(first) && second === "bulk") ||
      (first === "stats" && statsReports.includes(second)) ||
      (first === "contact-submissions" &&
        (second === "search" || uuid.test(second))) ||
      (first === "account" && (second === "password" || second === "sessions"))
    );
  }
  if (path.length === 3) {
    return (
      (first === "contact-submissions" && uuid.test(second) && third === "status") ||
      (first === "users" && uuid.test(second) && third === "sessions") ||
      (first === "account" && second === "sessions" && uuid.test(third))
    );
  }
  return (
    path.length === 4 &&
    first === "users" &&
    uuid.test(second) &&
    third === "sessions" &&
    fourth === "revoke"
  );
}
