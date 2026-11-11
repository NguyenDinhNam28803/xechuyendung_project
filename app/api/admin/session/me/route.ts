import { cookies } from "next/headers";
import {
  apiBaseUrl,
  readJson,
  sessionCookie,
  sessionCookieOptions,
  unavailable,
} from "../../../../lib/admin-backend";

/** Người dùng hiện tại; xóa cookie nếu phiên đã hết hạn hoặc bị thu hồi. */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookie)?.value;
  if (!token) {
    return Response.json(
      { message: "Vui lòng đăng nhập quản trị." },
      { status: 401 },
    );
  }

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    return unavailable("the current admin", error);
  }

  if (response.status === 401) {
    cookieStore.set(sessionCookie, "", sessionCookieOptions(0));
  }
  return Response.json(await readJson(response), {
    status: response.status,
    headers: { "Cache-Control": "no-store" },
  });
}
