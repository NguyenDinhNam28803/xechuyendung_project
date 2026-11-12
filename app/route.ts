import { cacheLife } from "next/cache";
import { renderHome } from "./_home/document";
import { vehicles as sampleVehicles, type Vehicle } from "./data/vehicles";

/**
 * Trang chủ "/" là HTML tĩnh (xem app/_home/document.ts): không qua root layout của (site) nên
 * không nạp globals.css, và không có React hydrate nên bộ kit của skill toàn quyền với DOM.
 * HTML được cache theo profile "minutes"; API lỗi hoặc không kết nối được thì dùng dữ liệu mẫu.
 */
async function buildHome(): Promise<string> {
  "use cache";
  cacheLife("minutes");
  const base = process.env.CONTENT_API_URL ?? "http://localhost:4000/api/v1";
  let vehicles: Vehicle[] = sampleVehicles;
  try {
    const response = await fetch(`${base}/vehicles`, { signal: AbortSignal.timeout(5000) });
    if (response.ok) vehicles = (await response.json()) as Vehicle[];
  } catch {
    // API không kết nối được: giữ dữ liệu mẫu.
  }
  return renderHome(vehicles, sampleVehicles);
}

export async function GET() {
  return new Response(await buildHome(), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
