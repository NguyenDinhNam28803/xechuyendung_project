import { cookies } from "next/headers";
import { articles } from "../../../../data/articles";
import { vehicles } from "../../../../data/vehicles";
import {
  apiBaseUrl,
  sessionCookie,
  sessionCookieOptions,
  unavailable,
} from "../../../../lib/admin-backend";
import { isAllowedPath } from "../../../../lib/admin-paths";

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, context: RouteContext) {
  return proxy(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return proxy(request, context);
}

export async function PATCH(request: Request, context: RouteContext) {
  return proxy(request, context);
}

export async function DELETE(request: Request, context: RouteContext) {
  return proxy(request, context);
}

async function proxy(request: Request, context: RouteContext) {
  const { path } = await context.params;
  if (!isAllowedPath(path)) {
    return Response.json({ message: "Đường dẫn không hợp lệ." }, { status: 404 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookie)?.value;
  if (!token) {
    return Response.json(
      { message: "Vui lòng đăng nhập quản trị." },
      { status: 401 },
    );
  }

  const requestUrl = new URL(request.url);
  const query = new URLSearchParams();
  if (request.method === "GET") {
    for (const key of ["page", "limit", "q", "type", "published"]) {
      const value = requestUrl.searchParams.get(key);
      if (value !== null) query.set(key, value);
    }
  }
  const queryString = query.size > 0 ? `?${query.toString()}` : "";
  const url = `${apiBaseUrl}/admin/${path.map(encodeURIComponent).join("/")}${queryString}`;
  const headers = new Headers({ Authorization: `Bearer ${token}` });
  let body: string | undefined;

  if (request.method === "POST" || request.method === "PATCH") {
    headers.set("Content-Type", "application/json");
    // Nội dung mẫu lấy từ dữ liệu tĩnh của website; server luôn lưu ở trạng
    // thái nháp để người quản trị duyệt trước khi công khai.
    body =
      path.length === 1 && path[0] === "import-defaults"
        ? JSON.stringify({
            vehicles: vehicles.map(withDraftFlag),
            articles: articles.map(withDraftFlag),
          })
        : await request.text();
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    return unavailable("an admin request", error);
  }

  if (response.status === 401) {
    cookieStore.set(sessionCookie, "", sessionCookieOptions(0));
  }
  return new Response(await response.text(), {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function withDraftFlag<T extends object>(item: T) {
  return { ...item, isPublished: false };
}
