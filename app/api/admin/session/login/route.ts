import { cookies } from "next/headers";

const sessionCookie = "xe_admin_session";
const apiBaseUrl = process.env.CONTENT_API_URL ?? "http://localhost:4000/api/v1";

export async function POST(request: Request) {
  let credentials: unknown;
  try {
    credentials = await request.json();
  } catch {
    return Response.json({ message: "Dữ liệu đăng nhập không hợp lệ." }, { status: 400 });
  }

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    console.error("Unable to reach the content API for admin login.", error);
    return Response.json({ message: "Máy chủ quản trị hiện chưa khả dụng." }, { status: 503 });
  }

  const result: unknown = await response.json();
  if (!response.ok || !isLoginResult(result)) {
    return Response.json(
      { message: isRecord(result) && typeof result.message === "string" ? result.message : "Đăng nhập thất bại." },
      { status: response.status },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(sessionCookie, result.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: result.expiresIn,
  });
  return Response.json({ ok: true });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isLoginResult(value: unknown): value is { accessToken: string; expiresIn: number } {
  return (
    isRecord(value) &&
    typeof value.accessToken === "string" &&
    typeof value.expiresIn === "number"
  );
}
