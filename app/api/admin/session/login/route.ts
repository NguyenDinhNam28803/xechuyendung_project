import {
  apiBaseUrl,
  clientAddressHeaders,
  isRecord,
  messageFrom,
  readJson,
  retryAfter,
  unavailable,
} from "../../../../lib/admin-backend";
import {
  completeSession,
  isLoginChallenge,
  isLoginSession,
  startChallenge,
} from "../../../../lib/admin-login";

/**
 * Bước 1 đăng nhập (tên + mật khẩu). NestJS trả một trong hai:
 *  - phiên đăng nhập (tài khoản chưa bật 2FA): lưu cookie phiên;
 *  - thử thách 2FA: lưu mã thử thách vào cookie HttpOnly, trình duyệt chỉ nhận
 *    `{ mfaRequired: true }` rồi gửi mã ở /session/login/verify.
 */
export async function POST(request: Request) {
  const credentials: unknown = await request.json().catch(() => null);
  if (!isRecord(credentials)) {
    return Response.json(
      { message: "Dữ liệu đăng nhập không hợp lệ." },
      { status: 400 },
    );
  }

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.headers.get("user-agent") ?? "next-admin-proxy",
        ...clientAddressHeaders(request),
      },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    return unavailable("admin login", error);
  }

  const result = await readJson(response);
  if (response.ok && isLoginChallenge(result)) return startChallenge(result);
  if (response.ok && isLoginSession(result)) return completeSession(result);
  return Response.json(
    { message: messageFrom(result, "Đăng nhập thất bại.") },
    { status: response.ok ? 502 : response.status, headers: retryAfter(response) },
  );
}
