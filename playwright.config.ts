import { defineConfig, devices } from "@playwright/test";

/**
 * E2E cho trang quản trị, chạy với NestJS API + PostgreSQL thật.
 *
 * Yêu cầu trước khi chạy (xem README, mục "Kiểm thử E2E"):
 * - API đang chạy và đã migrate, có tài khoản admin E2E_ADMIN_USERNAME/PASSWORD;
 * - CONTENT_API_URL trỏ tới API đó (mặc định http://127.0.0.1:4000/api/v1);
 * - đã `npm run build` (webServer chạy `next start`).
 *
 * KHÔNG trỏ vào database production: bộ test tạo/xóa dữ liệu thật.
 */
const port = Number(process.env.E2E_PORT ?? 3100);
const baseURL = process.env.E2E_BASE_URL ?? `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    locale: "vi-VN",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
      use: { channel: process.env.E2E_BROWSER_CHANNEL || undefined },
    },
    {
      name: "admin",
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        // Tùy chọn: dùng trình duyệt đã cài sẵn (ví dụ "msedge", "chrome") thay cho Chromium tải về.
        channel: process.env.E2E_BROWSER_CHANNEL || undefined,
        storageState: "e2e/.auth/admin.json",
      },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npx next start --port ${port}`,
        url: `${baseURL}/admin/login`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          CONTENT_API_URL: process.env.CONTENT_API_URL ?? "http://127.0.0.1:4000/api/v1",
          NEXT_TELEMETRY_DISABLED: "1",
        },
      },
});
