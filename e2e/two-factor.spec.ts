import { expect, test, type Browser } from "@playwright/test";
import {
  admin,
  adminSecret,
  confirmDialog,
  drawer,
  enrollTwoFactor,
  enterTotp,
  runId,
  submitPassword,
  toast,
  totp,
} from "./helpers";

/** Trình duyệt "sạch" (chưa đăng nhập), như một thiết bị khác. */
async function freshPage(browser: Browser) {
  const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  return { context, page: await context.newPage() };
}

test("đăng nhập hai bước bằng ứng dụng xác thực", async ({ browser }) => {
  const { context, page } = await freshPage(browser);
  await submitPassword(page, admin.username, admin.password);
  await expect(page.getByRole("heading", { name: "Nhập mã xác thực" })).toBeVisible();
  // Bước 1 xong chưa tạo phiên; mã thử thách nằm trong cookie HttpOnly riêng.
  const cookies = await context.cookies();
  expect(cookies.map((cookie) => cookie.name)).not.toContain("xe_admin_session");
  expect(cookies.find((cookie) => cookie.name === "xe_admin_challenge")?.httpOnly).toBe(true);

  await enterTotp(page, adminSecret());
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: "Tổng quan" })).toBeVisible();
  await context.close();
});

test("tài khoản mới bị hạn chế tới khi bật 2FA; mã khôi phục; admin đặt lại 2FA", async ({
  page,
  browser,
}) => {
  const username = `tfa.${runId}`;
  const password = "two-factor-password-123";

  await page.goto("/admin/users");
  await page.getByRole("button", { name: "+ Tạo tài khoản" }).click();
  const panel = drawer(page);
  await panel.getByLabel("Tên đăng nhập").fill(username);
  await panel.getByLabel("Tên hiển thị").fill(`2FA ${runId}`);
  await panel.getByLabel("Mật khẩu tạm (≥ 12 ký tự)").fill(password);
  await panel.getByRole("button", { name: "Tạo tài khoản" }).click();
  await expect(toast(page, "Đã tạo tài khoản.")).toBeVisible();

  // Lần đầu đăng nhập: phiên bị hạn chế, mọi trang khác chuyển về thiết lập 2FA.
  const user = await freshPage(browser);
  await submitPassword(user.page, username, password);
  await expect(user.page).toHaveURL(/\/admin\/account\/2fa$/);
  await expect(user.page.getByText("Bạn cần bật xác thực hai lớp để tiếp tục.")).toBeVisible();
  await user.page.goto("/admin/vehicles");
  await expect(user.page).toHaveURL(/\/admin\/account\/2fa$/);

  const { secret, recoveryCodes } = await enrollTwoFactor(user.page);
  await expect(user.page).toHaveURL(/\/admin$/);
  await user.page.goto("/admin/vehicles");
  await expect(user.page).toHaveURL(/\/admin\/vehicles$/);
  await user.context.close();

  // Mã sai bị từ chối (tài khoản dùng một lần nên không ảnh hưởng admin E2E).
  const lost = await freshPage(browser);
  await submitPassword(lost.page, username, password);
  const wrong = (Number(await totp(secret, 1)) + 1) % 1_000_000;
  await lost.page.getByLabel("Mã xác thực").fill(String(wrong).padStart(6, "0"));
  await lost.page.getByRole("button", { name: "Xác nhận" }).click();
  await expect(lost.page.getByText("Mã xác thực không đúng hoặc đã được dùng.")).toBeVisible();

  // Mất điện thoại: dùng mã khôi phục (không phân biệt hoa thường) trên cùng thử thách.
  await lost.page.getByRole("button", { name: "Mất điện thoại? Dùng mã khôi phục" }).click();
  await lost.page.getByLabel("Mã khôi phục").fill(recoveryCodes[0].toLowerCase());
  await lost.page.getByRole("button", { name: "Xác nhận" }).click();
  await expect(lost.page).toHaveURL(/\/admin\/account\/2fa\?recovered=9$/);
  await expect(lost.page.getByText(/còn lại\s*9\s*mã/)).toBeVisible();
  await expect(lost.page.getByText("9 / 10")).toBeVisible();

  // Admin đặt lại 2FA: phiên của người dùng bị thu hồi ngay.
  await page.getByLabel("Tìm tài khoản").fill(runId);
  const row = page.getByRole("row", { name: new RegExp(username.replace(".", "\\.")) });
  await expect(row.getByText("Đã bật")).toBeVisible();
  await row.getByRole("button", { name: "Đặt lại 2FA" }).click();
  await confirmDialog(page, "Đặt lại 2FA");
  await expect(toast(page, `Đã đặt lại 2FA cho ${username}.`)).toBeVisible();
  await expect(row.getByText("Chưa bật")).toBeVisible();

  await lost.page.reload();
  await expect(lost.page).toHaveURL(/\/admin\/login/);
  // Đăng nhập lại không cần mã, nhưng phải đăng ký 2FA lại từ đầu.
  await submitPassword(lost.page, username, password);
  await expect(lost.page).toHaveURL(/\/admin\/account\/2fa$/);
  await lost.context.close();
});
