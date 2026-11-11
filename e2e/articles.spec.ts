import { expect, test } from "@playwright/test";
import { confirmDialog, drawer, runId, toast } from "./helpers";

test("tạo bài viết bằng trình nhập theo mục, xem chi tiết và xóa", async ({ page }) => {
  const title = `Hướng dẫn chọn xe E2E ${runId}`;
  await page.goto("/admin/articles");
  await page.getByRole("button", { name: "+ Tạo mới" }).click();
  const panel = drawer(page);

  await panel.getByLabel("Tiêu đề", { exact: true }).fill(title);
  await expect(panel.getByLabel("Slug")).toHaveValue(`huong-dan-chon-xe-e2e-${runId}`);
  await panel.getByLabel("Chuyên mục").fill("Kiến thức");
  await panel.getByLabel("Mô tả ngắn").fill("Bài viết kiểm thử.");

  // Mục thiếu tiêu đề bị báo lỗi trước khi gửi.
  await panel.getByLabel("Đoạn văn của mục 1").fill("Đoạn một.\n\nĐoạn hai.");
  await panel.getByRole("button", { name: "Lưu bài viết" }).click();
  await expect(panel.getByRole("alert")).toContainText("Mục thứ 1 cần có tiêu đề");

  await panel.getByLabel("Tiêu đề mục 1").fill("Giới thiệu");
  await panel.getByRole("button", { name: "+ Thêm mục" }).click();
  await panel.getByLabel("Tiêu đề mục 2").fill("Kết luận");
  await panel.getByLabel("Đoạn văn của mục 2").fill("Tổng kết.");
  await panel.getByLabel("Đưa mục 2 lên").click();
  await expect(panel.getByLabel("Tiêu đề mục 1")).toHaveValue("Kết luận");
  await panel.getByRole("button", { name: "Lưu bài viết" }).click();
  await expect(toast(page, "Đã lưu bài viết.")).toBeVisible();

  await page.getByLabel("Tìm trong bài viết").fill(runId);
  const row = page.getByRole("row", { name: new RegExp(title) });
  await row.getByRole("button", { name: "Chi tiết" }).click();
  const detail = page.getByRole("dialog", { name: title });
  await expect(detail.getByRole("heading", { name: "Kết luận" })).toBeVisible();
  await expect(detail.getByText("Đoạn hai.")).toBeVisible();
  await detail.getByRole("button", { name: "Đóng" }).first().click();

  await row.getByRole("button", { name: "Xóa" }).click();
  await confirmDialog(page, "Xóa");
  await expect(toast(page, "Đã xóa bài viết.")).toBeVisible();
});
