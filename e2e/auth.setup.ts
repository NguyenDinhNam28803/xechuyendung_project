import { test as setup } from "@playwright/test";
import { admin, login } from "./helpers";

/**
 * Đăng nhập một lần và lưu cookie phiên cho các test khác (endpoint đăng
 * nhập bị giới hạn 5 lần/IP/15 phút, nên không đăng nhập lại ở mỗi test).
 */
setup("đăng nhập quản trị viên", async ({ page }) => {
  await login(page, admin.username, admin.password);
  await page.context().storageState({ path: "e2e/.auth/admin.json" });
});
