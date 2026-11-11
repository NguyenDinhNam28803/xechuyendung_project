import { NextResponse, type NextRequest } from "next/server";
import { isSameOriginRequest, sessionCookie } from "./app/lib/admin-backend";

/**
 * Next.js 16 Proxy (thay cho middleware.ts):
 *
 * 1. Trang /admin/*: chưa có cookie phiên thì chuyển ngay về /admin/login,
 *    không phải tải khung giao diện rồi mới phát hiện chưa đăng nhập. Đây chỉ
 *    là kiểm tra lạc quan (có cookie hay không); tính hợp lệ của phiên vẫn do
 *    NestJS xác minh ở từng request.
 * 2. API /api/admin/*: request thay đổi dữ liệu phải đến từ cùng origin
 *    (chống CSRF, bổ sung cho cookie SameSite=Lax).
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/api/admin/")) {
    const isMutation = !["GET", "HEAD", "OPTIONS"].includes(request.method);
    if (isMutation && !isSameOriginRequest(request)) {
      return NextResponse.json(
        { message: "Yêu cầu không hợp lệ (khác nguồn gốc)." },
        { status: 403 },
      );
    }
    return NextResponse.next();
  }

  const isLoginPage = pathname === "/admin/login";
  if (!isLoginPage && !request.cookies.has(sessionCookie)) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
