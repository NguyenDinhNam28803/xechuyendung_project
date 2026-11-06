import { cookies } from "next/headers";
import { articles } from "../../../../data/articles";
import { vehicles } from "../../../../data/vehicles";

const apiBaseUrl =
  process.env.CONTENT_API_URL ?? "http://localhost:4000/api/v1";
const sessionCookie = "xe_admin_session";
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
    return Response.json(
      { message: "Đường dẫn không hợp lệ." },
      { status: 404 },
    );
  }

  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) {
    return Response.json(
      { message: "Vui lòng đăng nhập quản trị." },
      { status: 401 },
    );
  }

  const requestUrl = new URL(request.url);
  const query = new URLSearchParams();
  if (request.method === "GET") {
    for (const key of ["page", "limit", "q", "type"]) {
      const value = requestUrl.searchParams.get(key);
      if (value !== null) query.set(key, value);
    }
  }
  const queryString = query.size > 0 ? `?${query.toString()}` : "";
  const url = `${apiBaseUrl}/admin/${path.map(encodeURIComponent).join("/")}${queryString}`;
  const headers = new Headers({ Authorization: `Bearer ${token}` });
  let body: string | undefined;

  if (request.method !== "GET" && request.method !== "DELETE") {
    headers.set("Content-Type", "application/json");
    if (
      path.length === 1 &&
      path[0] === "import-defaults" &&
      request.method === "POST"
    ) {
      body = JSON.stringify({
        vehicles: vehicles.map((vehicle) => ({
          ...vehicle,
          isPublished: true,
        })),
        articles: articles.map((article) => ({
          ...article,
          isPublished: true,
        })),
      });
    } else {
      body = await request.text();
    }
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
    console.error(
      "Unable to reach the content API for an admin request.",
      error,
    );
    return Response.json(
      { message: "Máy chủ quản trị hiện chưa khả dụng." },
      { status: 503 },
    );
  }

  const responseBody = await response.text();
  return new Response(responseBody, {
    status: response.status,
    headers: {
      "Content-Type":
        response.headers.get("content-type") ?? "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function isAllowedPath(path: string[]) {
  if (path.length === 1) {
    return [
      "vehicles",
      "articles",
      "legal-resources",
      "activity",
      "contact-submissions",
      "import-defaults",
    ].includes(path[0]);
  }
  return (
    (path.length === 2 &&
      ((["vehicles", "articles", "legal-resources"].includes(path[0]) &&
        /^[a-zA-Z0-9_-]+$/.test(path[1])) ||
        (path[0] === "contact-submissions" && path[1] === "search") ||
        (path[0] === "contact-submissions" &&
          /^[0-9a-f-]{36}$/i.test(path[1])))) ||
    (path.length === 3 &&
      path[0] === "contact-submissions" &&
      /^[0-9a-f-]{36}$/i.test(path[1]) &&
      path[2] === "status")
  );
}
