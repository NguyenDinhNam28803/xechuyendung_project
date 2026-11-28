import { cookies } from "next/headers";
import {
  apiBaseUrl,
  challengeCookie,
  clientAddressHeaders,
  isRecord,
  messageFrom,
  readJson,
  retryAfter,
  unavailable,
} from "../../../../../lib/admin-backend";
import { completeSession, isLoginSession } from "../../../../../lib/admin-login";

/**
 * Bước 2 đăng nhập: `{ code }` (mã 6 số từ ứng dụng xác thực) hoặc
 * `{ recoveryCode }`. Mã thử thách lấy từ cookie HttpOnly do bước 1 đặt,
 * trình duyệt không gửi và không biết nó.
 */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!isRecord(body)) {
    return Response.json({ message: "Dữ liệu xác thực không hợp lệ." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const challengeToken = cookieStore.get(challengeCookie)?.value;
  if (!challengeToken) {
    return Response.json(
      { message: "Phiên xác thực đã hết hạn. Vui lòng đăng nhập lại.", code: "CHALLENGE_EXPIRED" },
      { status: 401 },
    );
  }

  // Chỉ chuyển tiếp đúng một trong hai trường; server tự kiểm tra định dạng.
  const factor =
    typeof body.recoveryCode === "string"
      ? { recoveryCode: body.recoveryCode }
      : { code: body.code };

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/auth/login/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.headers.get("user-agent") ?? "next-admin-proxy",
        ...clientAddressHeaders(request),
      },
      body: JSON.stringify({ challengeToken, ...factor }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    return unavailable("admin login verification", error);
  }

  const result = await readJson(response);
  if (response.ok && isLoginSession(result)) return completeSession(result);

  // Mã sai: server trả 401 nhưng thử thách vẫn dùng được (tối đa 5 lần), nên
  // giữ cookie để người dùng nhập lại. Thử thách hết hiệu lực thì server tiếp
  // tục trả 401 với lời nhắc đăng nhập lại, và cookie tự hết hạn sau 5 phút.
  return Response.json(
    { message: messageFrom(result, "Xác thực thất bại.") },
    { status: response.ok ? 502 : response.status, headers: retryAfter(response) },
  );
}
