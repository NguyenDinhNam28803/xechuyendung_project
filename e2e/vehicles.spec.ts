import { expect, test } from "@playwright/test";
import { confirmDialog, drawer, runId, toast } from "./helpers";

test.describe("Quản lý xe qua drawer", () => {
  const name = `Xe chữa cháy E2E ${runId}`;
  const slug = `xe-chua-chay-e2e-${runId}`;

  test("tạo, lọc, sửa và xóa xe", async ({ page }) => {
    await page.goto("/admin/vehicles");
    await page.getByRole("button", { name: "+ Tạo mới" }).click();
    const panel = drawer(page);
    await expect(panel.getByRole("heading", { name: "Thêm xe" })).toBeVisible();

    // Slug tự sinh từ tên (bỏ dấu tiếng Việt).
    await panel.getByLabel("Tên xe").fill(name);
    await expect(panel.getByLabel("Slug")).toHaveValue(slug);

    await panel.getByLabel("Hãng xe").fill("Hino");
    await panel.getByLabel("Mô tả").fill("Xe chữa cháy dùng cho kiểm thử tự động.");
    await panel.getByLabel("Mục đích sử dụng").fill("Kiểm thử");
    await panel.getByLabel("Điểm nổi bật (mỗi dòng một ý)").fill("Bồn 5 khối\nBơm cao áp");
    await panel.getByLabel("Tên thông số 1").fill("Dung tích bồn");
    await panel.getByLabel("Giá trị thông số 1").fill("5 m³");

    // Ảnh sai định dạng bị chặn ngay trên form, không gửi lên server.
    await panel.getByRole("button", { name: "+ Thêm ảnh" }).click();
    await panel.getByLabel("URL ảnh 1").fill("http://khong-an-toan.example/a.jpg");
    await panel.getByRole("button", { name: "Lưu xe" }).click();
    await expect(panel.getByRole("alert")).toContainText("https://");
    await panel.getByLabel("Xóa ảnh 1").click();

    await panel.getByRole("button", { name: "Lưu xe" }).click();
    await expect(toast(page, "Đã lưu thông tin xe.")).toBeVisible();
    await expect(panel).toBeHidden();

    // Bộ lọc "Bản nháp" được ghi lên URL và giữ nguyên khi tải lại trang.
    await page.getByRole("button", { name: "Bản nháp" }).click();
    await expect(page).toHaveURL(/published=false/);
    await page.getByLabel("Tìm trong xe").fill(runId);
    // Từ khóa được ghi lên URL sau khi danh sách tải xong (debounce 250 ms).
    await expect(page).toHaveURL(new RegExp(`q=${runId}`));
    await expect(page.getByRole("row", { name: new RegExp(name) })).toBeVisible();
    await page.reload();
    await expect(page.getByRole("button", { name: "Bản nháp" })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByLabel("Tìm trong xe")).toHaveValue(runId);
    await expect(page.getByRole("row", { name: new RegExp(name) })).toBeVisible();

    // Lọc "Đang công khai" không còn thấy bản nháp.
    await page.getByRole("button", { name: "Đang công khai" }).click();
    await expect(page.getByText("Không có mục phù hợp.")).toBeVisible();
    await page.getByRole("button", { name: "Tất cả" }).click();

    // Sửa: đóng khi còn thay đổi chưa lưu thì phải xác nhận.
    const row = page.getByRole("row", { name: new RegExp(name) });
    await row.getByRole("button", { name: "Sửa" }).click();
    await expect(panel.getByLabel("Slug")).toHaveValue(slug);
    await expect(panel.getByLabel("Giá trị thông số 1")).toHaveValue("5 m³");
    await panel.getByLabel("Hãng xe").fill("Hino 500");
    await expect(panel.getByText("Có thay đổi chưa lưu")).toBeVisible();
    await panel.getByRole("button", { name: "Hủy" }).click();
    await confirmDialog(page, "Tiếp tục sửa");
    await expect(panel).toBeVisible();
    await panel.getByLabel("Hiển thị công khai").check();
    await panel.getByRole("button", { name: "Lưu xe" }).click();
    await expect(toast(page, "Đã lưu thông tin xe.")).toBeVisible();
    await expect(row.getByText("Đang công khai")).toBeVisible();
    await expect(row.getByText("Hino 500")).toBeVisible();

    // Xóa có hộp xác nhận.
    await row.getByRole("button", { name: "Xóa" }).click();
    await confirmDialog(page, "Xóa");
    await expect(toast(page, "Đã xóa xe.")).toBeVisible();
    await expect(page.getByRole("row", { name: new RegExp(name) })).toHaveCount(0);
  });
});
