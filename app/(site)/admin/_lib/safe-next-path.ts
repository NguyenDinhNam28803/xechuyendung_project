/**
 * Chỉ cho phép quay lại đường dẫn nội bộ trong /admin để tránh open redirect
 * (ví dụ ?next=https://trang-gia-mao.example hoặc ?next=//evil.example).
 */
export function safeNextPath(value: string | null) {
  if (!value) return "/admin";
  const isAdminPath = value === "/admin" || value.startsWith("/admin/");
  if (!isAdminPath || value.includes("\\") || value.startsWith("/admin/login")) {
    return "/admin";
  }
  return value;
}
