import { cacheLife } from "next/cache";
import { renderHome } from "./_home/document";
import { articles as sampleArticles, type Article } from "./data/articles";
import { vehicles as sampleVehicles, type Vehicle } from "./data/vehicles";

/**
 * Trang chủ "/" là HTML tĩnh (xem app/_home/document.ts): không qua root layout của (public) nên
 * không có React hydrate, bộ kit của skill toàn quyền với DOM.
 * HTML được cache theo profile "minutes"; API lỗi hoặc không kết nối được thì dùng dữ liệu mẫu.
 */
async function fetchOr<T>(base: string, path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(5000) });
    if (response.ok) return (await response.json()) as T;
  } catch {
    // API không kết nối được: giữ dữ liệu mẫu.
  }
  return fallback;
}

async function buildHome(): Promise<string> {
  "use cache";
  cacheLife("minutes");
  const base = process.env.CONTENT_API_URL ?? "http://localhost:4000/api/v1";
  const [vehicles, articles] = await Promise.all([
    fetchOr<Vehicle[]>(base, "/vehicles", sampleVehicles),
    fetchOr<Article[]>(base, "/articles", sampleArticles),
  ]);
  return renderHome(vehicles, sampleVehicles, articles);
}

export async function GET() {
  return new Response(await buildHome(), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
