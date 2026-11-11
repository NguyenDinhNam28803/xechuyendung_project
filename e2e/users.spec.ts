import { expect, test } from "@playwright/test";
import { confirmDialog, drawer, login, runId, toast } from "./helpers";

test("quản trị viên tạo biên tập viên; biên tập viên không vào được quản lý tài khoản", async ({
  page,
  browser,
}) => {
  const username = `editor.${runId}`;
  const password = "editor-password-1234";

  await page.goto("/admin/users");
  await page.getByRole("button", { name: "+ Tạo tài khoản" }).click();
  const panel = drawer(page);
  await panel.getByLabel("Tên đăng nhập").fill(username);
  await panel.getByLabel("Tên hiển thị").fill(`Biên tập ${runId}`);
  await panel.getByLabel("Mật khẩu tạm (≥ 12 ký tự)").fill(password);
  await panel.getByRole("button", { name: "Tạo tài khoản" }).click();
  await expect(toast(page, "Đã tạo tài khoản.")).toBeVisible();

  // Đặt lại mật khẩu bằng hộp nhập của trang (không dùng window.prompt).
  await page.getByLabel("Tìm tài khoản").fill(runId);
  const row = page.getByRole("row", { name: new RegExp(username.replace(".", "\\.")) });
  await row.getByRole("button", { name: "Đặt lại mật khẩu" }).click();
  const dialog = page.locator("dialog.admin-request-dialog");
  await dialog.getByLabel("Mật khẩu mới (tối thiểu 12 ký tự)").fill(password);
  await dialog.getByRole("button", { name: "Đặt lại mật khẩu" }).click();
  await expect(toast(page, `Đã đặt lại mật khẩu cho ${username}.`)).toBeVisible();

  // Biên tập viên đăng nhập trong ngữ cảnh riêng.
  const editorContext = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const editorPage = await editorContext.newPage();
  await login(editorPage, username, password);
  await expect(editorPage.getByRole("link", { name: "Tài khoản quản trị" })).toHaveCount(0);
  await editorPage.goto("/admin/users");
  await expect(editorPage.getByText("Chỉ quản trị viên mới có quyền quản lý tài khoản.")).toBeVisible();
  await editorContext.close();

  // Khóa tài khoản có xác nhận.
  await row.getByRole("button", { name: "Khóa" }).click();
  await confirmDialog(page, "Khóa tài khoản");
  await expect(row.getByText("Đã khóa")).toBeVisible();
});
