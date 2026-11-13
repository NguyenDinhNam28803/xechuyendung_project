/**
 * Dùng chung cho các route handler quản trị (chỉ chạy phía server Next.js).
 * Token phiên do NestJS cấp được giữ trong cookie HttpOnly; trình duyệt không
 * đọc được và không gửi được nó tới origin khác.
 */
export const apiBaseUrl =
  process.env.CONTENT_API_URL ?? "http://localhost:4000/api/v1";

export const sessionCookie = "xe_admin_session";

export function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/** Đọc JSON từ response; trả null khi body không phải JSON (ví dụ trang lỗi 502 HTML). */
export async function readJson(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function messageFrom(value: unknown, fallback: string) {
  return isRecord(value) && typeof value.message === "string"
    ? value.message
    : fallback;
}

export function unavailable(context: string, error: unknown) {
  console.error(`Unable to reach the content API for ${context}.`, error);
  return Response.json(
    { message: "Máy chủ quản trị hiện chưa khả dụng." },
    { status: 503 },
  );
}

/**
 * IP thật của người dùng để NestJS giới hạn tần suất theo từng người (đăng nhập 5 lần/15 phút,
 * form liên hệ 10 lần/giờ). Không có nó, API chỉ thấy IP của server Next (127.0.0.1) và giới hạn
 * thành chung cho MỌI khách truy cập.
 *
 * Chỉ đọc X-Real-IP, header mà Nginx GHI ĐÈ bằng $remote_addr (xem DEPLOY.md), nên khách không giả
 * được. Không đọc X-Forwarded-For vì khách có thể tự thêm giá trị vào đầu chuỗi đó.
 * API cần TRUST_PROXY=loopback để tin header này khi nhận từ Next cùng máy.
 */
export function clientAddressHeaders(request: Request): Record<string, string> {
  const ip = request.headers.get("x-real-ip")?.trim();
  if (!ip || ip.length > 45 || !/^[0-9a-fA-F:.]+$/.test(ip)) return {};
  return { "X-Forwarded-For": ip };
}

/**
 * Kiểm tra request thay đổi dữ liệu xuất phát từ chính website (chống CSRF,
 * bổ sung cho cookie SameSite=Lax):
 *  - Có header Origin: host phải trùng host của request.
 *  - Không có Origin nhưng có Sec-Fetch-Site: phải là same-origin.
 *  - Không có cả hai (client không phải trình duyệt): cho qua, vì request đó
 *    không mang cookie của nạn nhân nên không phải tình huống CSRF.
 */
export function isSameOriginRequest(request: Request) {
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    request.headers.get("host");
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return host !== null && new URL(origin).host === host;
    } catch {
      return false;
    }
  }
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite) return fetchSite === "same-origin" || fetchSite === "none";
  return true;
}
