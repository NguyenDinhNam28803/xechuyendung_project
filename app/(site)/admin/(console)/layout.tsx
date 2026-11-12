import { Suspense, type ReactNode } from "react";
import { AdminConsole } from "../_components/admin-console";

/**
 * Khung chung của mọi trang quản trị đã đăng nhập. AdminConsole là client
 * component dùng usePathname nên được bọc Suspense (bắt buộc khi bật
 * cacheComponents trong next.config.ts).
 */
export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={<main className="admin-shell">Đang tải quản trị...</main>}
    >
      <AdminConsole>{children}</AdminConsole>
    </Suspense>
  );
}
