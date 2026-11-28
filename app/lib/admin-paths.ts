const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const twoFactorActions = ["setup", "confirm", "disable", "recovery-codes"];
const crudCollections = ["vehicles", "articles", "legal-resources", "users"];

/**
 * Whitelist đường dẫn được phép chuyển tiếp tới /api/v1/admin/*. Mọi đường
 * dẫn khác trả 404 ngay tại Next.js, nên proxy không thể bị dùng để gọi tùy ý
 * vào API (SSRF/path traversal). Quyền theo vai trò do NestJS kiểm tra.
 */
export function isAllowedPath(path: string[]) {
  const [first, second, third] = path;
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
      (first === "contact-submissions" &&
        (second === "search" || uuid.test(second))) ||
      (first === "account" && (second === "password" || second === "2fa"))
    );
  }
  if (path.length === 3) {
    return (
      (first === "contact-submissions" &&
        uuid.test(second) &&
        third === "status") ||
      (first === "account" &&
        second === "2fa" &&
        twoFactorActions.includes(third))
    );
  }
  // Admin đặt lại 2FA cho tài khoản khác: users/:id/2fa/reset.
  return (
    path.length === 4 &&
    first === "users" &&
    uuid.test(second) &&
    third === "2fa" &&
    path[3] === "reset"
  );
}
