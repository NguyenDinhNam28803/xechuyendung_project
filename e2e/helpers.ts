import { expect, type Page } from "@playwright/test";

export const admin = {
  username: process.env.E2E_ADMIN_USERNAME ?? "e2e-admin",
  password: process.env.E2E_ADMIN_PASSWORD ?? "e2e-admin-password-123",
};

/** Hậu tố duy nhất cho mỗi lần chạy để test không phụ thuộc dữ liệu cũ. */
export const runId = Date.now().toString(36);

export async function login(page: Page, username: string, password: string) {
  await page.goto("/admin/login");
  await page.getByLabel("Tên đăng nhập").fill(username);
  await page.getByLabel("Mật khẩu").fill(password);
  await page.getByRole("button", { name: /đăng nhập/i }).click();
  await expect(page).toHaveURL(/\/admin$/);
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
