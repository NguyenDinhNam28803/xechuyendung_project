import { expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { generate } from "otplib";

export const admin = {
  username: process.env.E2E_ADMIN_USERNAME ?? "e2e-admin",
  password: process.env.E2E_ADMIN_PASSWORD ?? "e2e-admin-password-123",
};

/** Khóa TOTP của tài khoản admin E2E (ghi khi đăng ký ở auth.setup.ts). */
export const adminSecretFile = "e2e/.auth/admin-2fa.json";

export function adminSecret() {
  return (JSON.parse(readFileSync(adminSecretFile, "utf8")) as { secret: string }).secret;
}

/** Hậu tố duy nhất cho mỗi lần chạy để test không phụ thuộc dữ liệu cũ. */
export const runId = Date.now().toString(36);

/** Bước 1 đăng nhập (tên + mật khẩu); bước tiếp theo tùy trạng thái 2FA. */
export async function submitPassword(page: Page, username: string, password: string) {
  await page.goto("/admin/login");
  await page.getByLabel("Tên đăng nhập").fill(username);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: /đăng nhập/i }).click();
}

/**
 * Nhập mã TOTP ở bước 2 đăng nhập. Server chặn dùng lại mã đã dùng (chống
 * replay), nên khi chạy lại bộ test trong cùng khoảng 30 giây, mã có thể vừa
 * được dùng ở lần trước: khi đó chờ sang bước thời gian sau rồi thử một lần nữa.
 */
export async function enterTotp(page: Page, secret: string) {
  const rejected = page.getByText("Mã xác thực không đúng hoặc đã được dùng.");
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await page.getByLabel("Mã xác thực").fill(await totp(secret, 1));
    await page.getByRole("button", { name: "Xác nhận" }).click();
    await expect(rejected.or(page.locator(".admin-sidebar"))).toBeVisible();
    if (!(await rejected.isVisible())) return;
    await page.waitForTimeout(30_000 - (Date.now() % 30_000) + 1_000);
  }
  throw new Error("Mã TOTP bị từ chối hai lần liên tiếp.");
}

/** Mã TOTP 6 số; `stepOffset` = số bước 30 giây so với hiện tại. */
export function totp(secret: string, stepOffset = 0) {
  return generate({ secret, epoch: Math.floor(Date.now() / 1000) + stepOffset * 30 });
}

/**
 * Đăng ký 2FA qua giao diện thật khi đang ở trang thiết lập: đọc khóa ở mục
 * "nhập khóa thủ công" (như người dùng không quét được QR), nhập mã, lưu mã
 * khôi phục rồi tiếp tục. Trả về khóa và mã khôi phục để dùng ở bước sau.
 */
export async function enrollTwoFactor(page: Page) {
  await expect(page).toHaveURL(/\/admin\/account\/2fa/);
  await page.getByRole("button", { name: "Bắt đầu thiết lập" }).click();
  await expect(page.getByAltText(/Mã QR/)).toBeVisible();
  await page.getByText("Không quét được? Nhập khóa thủ công").click();
  const secret = (await page.getByLabel("Khóa thiết lập").textContent())!.replace(/\s/g, "");
  expect(secret).toMatch(/^[A-Z2-7]{16,}$/);

  await page.getByLabel("Mã xác thực").fill(await totp(secret));
  await page.getByRole("button", { name: "Xác nhận và bật 2FA" }).click();

  const codes = page.getByRole("list", { name: "Mã khôi phục" }).locator("code");
  await expect(codes).toHaveCount(10);
  const recoveryCodes = await codes.allTextContents();
  const next = page.getByRole("button", { name: "Tiếp tục" });
  await expect(next).toBeDisabled();
  await page.getByLabel("Tôi đã lưu các mã khôi phục ở nơi an toàn").check();
  await next.click();
  return { secret, recoveryCodes };
}

/** Toast thành công/thất bại hiện trong vùng aria-live. */
export function toast(page: Page, text: string | RegExp) {
  return page.locator(".admin-toast").filter({ hasText: text });
}

/** Bấm nút xác nhận trong hộp thoại xác nhận của trang quản trị. */
export async function confirmDialog(page: Page, buttonName: string | RegExp) {
  const dialog = page.locator("dialog.admin-request-dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: buttonName }).click();
  await expect(dialog).toBeHidden();
}

export function drawer(page: Page) {
  return page.locator("dialog.admin-drawer");
}
