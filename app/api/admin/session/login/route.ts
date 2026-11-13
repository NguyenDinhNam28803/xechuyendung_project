import { cookies } from "next/headers";
import {
  apiBaseUrl,
  clientAddressHeaders,
  isRecord,
  messageFrom,
  readJson,
  sessionCookie,
  sessionCookieOptions,
  unavailable,
} from "../../../../lib/admin-backend";

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
  if (!response.ok || !isLoginResult(result)) {
    return Response.json(
      { message: messageFrom(result, "Đăng nhập thất bại.") },
      { status: response.ok ? 502 : response.status },
    );
  }

  (await cookies()).set(
    sessionCookie,
    result.accessToken,
    sessionCookieOptions(result.expiresIn),
  );
  // Không trả token về trình duyệt; chỉ trả thông tin hiển thị.
  return Response.json({ ok: true, user: result.user });
}

function isLoginResult(
  value: unknown,
): value is { accessToken: string; expiresIn: number; user: unknown } {
  return (
    isRecord(value) &&
    typeof value.accessToken === "string" &&
    typeof value.expiresIn === "number"
  );
}
