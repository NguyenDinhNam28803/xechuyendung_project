import { apiBaseUrl, clientAddressHeaders } from "../../lib/admin-backend";

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 8_192) {
    return Response.json(
      { error: "Nội dung gửi lên quá lớn." },
      { status: 413 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Dữ liệu gửi lên không hợp lệ." },
      { status: 400 },
    );
  }

  if (!isRecord(body)) {
    return Response.json(
      { error: "Dữ liệu gửi lên không hợp lệ." },
      { status: 400 },
    );
  }

  if (typeof body.companyWebsite === "string" && body.companyWebsite.trim()) {
    return Response.json({ ok: true });
  }

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/contact-submissions`, {
      method: "POST",
      // IP thật của khách để API giới hạn 10 yêu cầu/giờ cho TỪNG người, không phải cho cả site.
      headers: { "Content-Type": "application/json", ...clientAddressHeaders(request) },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    console.error(
      "Unable to reach the API to save a contact submission.",
      error,
    );
    return Response.json(
      { error: "Máy chủ chưa thể tiếp nhận yêu cầu. Vui lòng thử lại sau." },
      { status: 503 },
    );
  }

  const responseBody: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      isRecord(responseBody) && typeof responseBody.message === "string"
        ? responseBody.message
        : "Chưa thể lưu yêu cầu. Vui lòng thử lại sau.";
    return Response.json({ error: message }, { status: response.status });
  }
  return Response.json({ ok: true }, { status: response.status });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
