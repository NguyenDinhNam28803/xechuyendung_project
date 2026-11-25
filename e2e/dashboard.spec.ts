import { expect, test } from "@playwright/test";
import { confirmDialog, drawer, runId, toast } from "./helpers";

/** Ảnh chụp màn hình chỉ khi đặt E2E_SCREENSHOTS=thư-mục (dùng khi review giao diện). */
async function snap(page: import("@playwright/test").Page, name: string) {
  const directory = process.env.E2E_SCREENSHOTS;
  if (directory) await page.screenshot({ path: `${directory}/${name}.png`, fullPage: true });
}

test("tổng quan hiển thị chỉ số, biểu đồ và chế độ xem bảng", async ({ page, request }) => {
  // Tự tạo dữ liệu: database E2E có thể trống (CI tạo mới mỗi lần), và bảng
  // thay thế chỉ liệt kê những ngày có yêu cầu liên hệ.
  const response = await request.post("/api/contact", {
    data: {
      name: `Khách tổng quan ${runId}`,
      phone: "0901 234 568",
      category: "Xe tải",
      location: "Hà Nội",
      message: "Kiểm thử biểu đồ tổng quan.",
      consent: true,
      companyWebsite: "",
    },
  });
  expect(response.ok()).toBeTruthy();

  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Yêu cầu liên hệ theo ngày" })).toBeVisible();
  await expect(page.getByRole("img", { name: /Biểu đồ cột chồng: \d+ yêu cầu liên hệ/ })).toBeVisible();
  await expect(page.getByText("Tỷ lệ đã phản hồi")).toBeVisible();
  await expect(page.getByText(/Quá 24 giờ chưa phản hồi/)).toBeVisible();
  await snap(page, "01-dashboard");

  // Đổi khoảng thời gian tải lại xu hướng.
  await page.getByRole("button", { name: "7 ngày" }).click();
  await expect(page.getByRole("button", { name: "7 ngày" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Yêu cầu liên hệ · 7 ngày")).toBeVisible();

  // Tooltip bằng bàn phím trên biểu đồ.
  const chart = page.getByRole("img", { name: /yêu cầu liên hệ trong 7 ngày/ });
  await chart.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".admin-chart-tooltip").first()).toContainText("Tổng:");

  // Bảng thay thế cho biểu đồ.
  const card = page.locator(".admin-chart-card", { hasText: "Yêu cầu liên hệ theo ngày" });
  await card.getByRole("button", { name: "Xem dạng bảng" }).click();
  await expect(card.getByRole("columnheader", { name: "Ngày" })).toBeVisible();
  await card.getByRole("button", { name: "Xem biểu đồ" }).click();
});

test("xe: sắp xếp, bật/tắt công khai trên dòng và thao tác hàng loạt", async ({ page }) => {
  const names = [`Bulk B ${runId}`, `Bulk A ${runId}`];
  await page.goto("/admin/vehicles");
  for (const name of names) {
    await page.getByRole("button", { name: "+ Tạo mới" }).click();
    const panel = drawer(page);
    await panel.getByLabel("Tên xe").fill(name);
    await panel.getByLabel("Hãng xe").fill("E2E");
    await panel.getByLabel("Mô tả").fill("Xe kiểm thử thao tác hàng loạt.");
    await panel.getByLabel("Mục đích sử dụng").fill("Kiểm thử");
    await panel.getByLabel("Điểm nổi bật (mỗi dòng một ý)").fill("Một");
    await panel.getByRole("button", { name: "Lưu xe" }).click();
    await expect(toast(page, "Đã lưu thông tin xe.")).toBeVisible();
  }

  await page.getByLabel("Tìm trong xe").fill(runId);
  await expect(page.getByRole("row", { name: new RegExp(`Bulk A ${runId}`) })).toBeVisible();

  // Sắp xếp theo tên: tăng dần, được ghi lên URL.
  await page.getByRole("button", { name: /^Tên xe/ }).click();
  await expect(page).toHaveURL(/sort=name%3Aasc/);
  const firstRow = page.locator("tbody tr").first();
  await expect(firstRow).toContainText(`Bulk A ${runId}`);
  await expect(page.getByRole("columnheader", { name: /Tên xe/ })).toHaveAttribute("aria-sort", "ascending");

  // Bật công khai ngay trên dòng.
  const rowA = page.getByRole("row", { name: new RegExp(`Bulk A ${runId}`) });
  await rowA.getByRole("button", { name: `Xuất bản: Bulk A ${runId}` }).click();
  await expect(toast(page, "Đã xuất bản xe.")).toBeVisible();
  await expect(rowA.getByText("Đang công khai")).toBeVisible();

  // Chọn tất cả (2 dòng tìm được) → xuất bản hàng loạt: 1 thay đổi, 1 giữ nguyên.
  await page.getByLabel("Chọn tất cả dòng trên trang").check();
  await expect(page.getByText("Đã chọn 2")).toBeVisible();
  await snap(page, "02-vehicles-bulk");
  await page.getByRole("region", { name: "Thao tác hàng loạt" }).getByRole("button", { name: "Xuất bản" }).click();
  await confirmDialog(page, "Xuất bản");
  await expect(toast(page, /Đã xuất bản 1 xe \(1 mục không cần thay đổi\)/)).toBeVisible();

  // Xóa hàng loạt.
  await page.getByLabel("Chọn tất cả dòng trên trang").check();
  await page.getByRole("region", { name: "Thao tác hàng loạt" }).getByRole("button", { name: "Xóa" }).click();
  await confirmDialog(page, "Xóa");
  await expect(toast(page, "Đã xóa 2 xe.")).toBeVisible();
  await expect(page.getByRole("row", { name: new RegExp(runId) })).toHaveCount(0);
});

test("danh mục xe: thêm, đổi tên và xóa", async ({ page }) => {
  const name = `Danh mục E2E ${runId}`;
  await page.goto("/admin/vehicle-categories");
  await expect(page.getByRole("row", { name: /Xe tải/ })).toBeVisible();
  await page.getByRole("button", { name: "+ Thêm danh mục" }).click();
  const panel = drawer(page);
  await panel.getByLabel("Tên danh mục").fill(name);
  await panel.getByLabel("Thứ tự hiển thị (nhỏ đứng trước)").fill("999");
  await panel.getByRole("button", { name: "Lưu danh mục" }).click();
  await expect(toast(page, "Đã lưu danh mục.")).toBeVisible();
  await snap(page, "03-vehicle-categories");

  // Danh mục mới xuất hiện trong form xe.
  await page.goto("/admin/vehicles");
  await page.getByRole("button", { name: "+ Tạo mới" }).click();
  await expect(drawer(page).getByLabel("Danh mục").locator("option", { hasText: name })).toHaveCount(1);
  await drawer(page).getByRole("button", { name: "Hủy" }).click();

  await page.goto("/admin/vehicle-categories");
  const row = page.getByRole("row", { name: new RegExp(name) });
  await row.getByRole("button", { name: "Sửa" }).click();
  await drawer(page).getByLabel("Tên danh mục").fill(`${name} mới`);
  await drawer(page).getByRole("button", { name: "Lưu danh mục" }).click();
  await expect(toast(page, "Đã lưu danh mục.")).toBeVisible();

  const renamed = page.getByRole("row", { name: new RegExp(`${name} mới`) });
  await renamed.getByRole("button", { name: "Xóa" }).click();
  await confirmDialog(page, "Xóa");
  await expect(toast(page, "Đã xóa danh mục.")).toBeVisible();
});

test("lịch sử hoạt động lọc theo thao tác và đối tượng", async ({ page }) => {
  await page.goto("/admin/activity");
  await expect(page.getByRole("heading", { name: "Nhịp độ hoạt động" })).toBeVisible();
  await page.getByLabel("Thao tác").selectOption("DELETE");
  await page.getByLabel("Đối tượng").selectOption("vehicle_category");
  await expect(page).toHaveURL(/action=DELETE/);
  await expect(page).toHaveURL(/entityType=vehicle_category/);
  await expect(page.locator("tbody tr").first()).toContainText("Danh mục xe");
  await snap(page, "04-activity");
  await page.getByRole("button", { name: "Xóa bộ lọc" }).click();
  await expect(page).not.toHaveURL(/action=/);
});

test("tài khoản: xem thiết bị đang đăng nhập", async ({ page }) => {
  await page.goto("/admin/account");
  await expect(page.getByRole("heading", { name: "Thiết bị đang đăng nhập" })).toBeVisible();
  await expect(page.locator(".admin-session-list li.is-current")).toHaveCount(1);
  await expect(page.getByText(/thiết bị này/)).toBeVisible();
  await snap(page, "05-account-sessions");

  await page.goto("/admin/users");
  await page.getByRole("row", { name: /bạn/ }).getByRole("button", { name: "Thiết bị" }).click();
  await expect(drawer(page).getByText(/Đăng nhập/).first()).toBeVisible();
  await snap(page, "06-users-devices");
});
