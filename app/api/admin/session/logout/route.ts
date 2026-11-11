import { cookies } from "next/headers";
import {
  apiBaseUrl,
  sessionCookie,
  sessionCookieOptions,
} from "../../../../lib/admin-backend";

/**
 * Thu hồi phiên ở server (token không còn dùng được kể cả khi bị sao chép)
 * rồi xóa cookie. Cookie luôn được xóa, kể cả khi API tạm không phản hồi.
 */
export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookie)?.value;
  if (token) {
    await fetch(`${apiBaseUrl}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    }).catch((error: unknown) =>
      console.error("Unable to revoke the admin session on logout.", error),
    );
  }
  cookieStore.set(sessionCookie, "", sessionCookieOptions(0));
  return Response.json({ ok: true });
}
