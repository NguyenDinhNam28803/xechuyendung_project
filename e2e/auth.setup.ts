import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { expect, test as setup } from "@playwright/test";
import { admin, adminSecret, adminSecretFile, enrollTwoFactor, enterTotp, submitPassword } from "./helpers";

/**
 * Đăng nhập một lần và lưu cookie phiên cho các test khác (endpoint đăng nhập
 * bị giới hạn theo IP, nên không đăng nhập lại ở mỗi test).
 *
 * Server bắt buộc 2FA cho mọi vai trò, nên lần đầu (database mới, như CI) tài
 * khoản admin bị chuyển tới trang thiết lập và đăng ký 2FA qua giao diện. Khi
 * chạy lại trên database cũ, admin đã bật 2FA: nhập mã từ khóa đã lưu.
 */
setup("đăng nhập quản trị viên (đăng ký 2FA lần đầu)", async ({ page }) => {
  await submitPassword(page, admin.username, admin.password);
  const codeHeading = page.getByRole("heading", { name: "Nhập mã xác thực" });
  const startSetup = page.getByRole("button", { name: "Bắt đầu thiết lập" });
  await expect(codeHeading.or(startSetup)).toBeVisible();

  if (await startSetup.isVisible()) {
    // Phiên bị hạn chế: chỉ còn mục 2FA trên thanh điều hướng.
    await expect(page.getByRole("link", { name: "Xe", exact: true })).toHaveCount(0);
    const { secret } = await enrollTwoFactor(page);
    mkdirSync("e2e/.auth", { recursive: true });
    writeFileSync(adminSecretFile, JSON.stringify({ secret }));
  } else {
    if (!existsSync(adminSecretFile)) {
      throw new Error(
        `Tài khoản ${admin.username} đã bật 2FA nhưng thiếu ${adminSecretFile}. Đặt lại bằng: npm run admin:reset-2fa -- ${admin.username} (repo server).`,
      );
    }
    await enterTotp(page, adminSecret());
  }

  await expect(page).toHaveURL(/\/admin$/);
  await page.context().storageState({ path: "e2e/.auth/admin.json" });
});
