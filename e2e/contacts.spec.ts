import { expect, test } from "@playwright/test";
import { confirmDialog, drawer, runId, toast } from "./helpers";

test("xử lý yêu cầu liên hệ: huy hiệu, lọc trạng thái, đổi trạng thái và xóa", async ({ page, request }) => {
  const name = `Khách E2E ${runId}`;
  // Gửi yêu cầu qua form công khai (đi qua /api/contact như khách thật).
  const response = await request.post("/api/contact", {
    data: {
      name,
      phone: "0901 234 567",
      category: "Xe tải",
      location: "Hà Nội",
      message: "Cần tư vấn xe tải 5 tấn.",
      consent: true,
      companyWebsite: "",
    },
  });
  expect(response.ok()).toBeTruthy();

  await page.goto("/admin/contact-submissions");
  const navBadge = page.locator(".admin-nav-badge");
  await expect(navBadge).toBeVisible();
  const badgeBefore = Number(await navBadge.textContent());
  expect(badgeBefore).toBeGreaterThan(0);

  // Tab "Mới" ghi trạng thái lên URL; từ khóa tìm kiếm (dữ liệu cá nhân) thì không.
  await page.getByRole("button", { name: /^Mới/ }).click();
  await expect(page).toHaveURL(/status=new/);
  await page.getByLabel("Tìm trong yêu cầu liên hệ").fill(runId);
  const row = page.getByRole("row", { name: new RegExp(name) });
  await expect(row).toBeVisible();
  await expect(page).not.toHaveURL(new RegExp(runId));

  // Drawer chi tiết: đổi trạng thái chỉ khi bấm lưu.
  await row.getByRole("button", { name: "Xử lý" }).click();
  const panel = drawer(page);
  await expect(panel.getByText("Cần tư vấn xe tải 5 tấn.")).toBeVisible();
  await expect(panel.getByRole("link", { name: /Gọi 0901 234 567/ })).toHaveAttribute("href", "tel:0901 234 567");
  const save = panel.getByRole("button", { name: "Lưu trạng thái" });
  await expect(save).toBeDisabled();
  await panel.getByRole("radio").nth(2).check();
  await save.click();
  await expect(toast(page, /Đã liên hệ/)).toBeVisible();

  // Không còn trong tab "Mới"; huy hiệu sidebar giảm.
  await expect(page.getByRole("row", { name: new RegExp(name) })).toHaveCount(0);
  if (badgeBefore === 1) await expect(navBadge).toHaveCount(0);
  else await expect(navBadge).toHaveText(String(badgeBefore - 1));

  // Tab "Đã liên hệ" có yêu cầu; xóa có xác nhận.
  await page.getByRole("button", { name: /^Đã liên hệ/ }).click();
  await expect(page).toHaveURL(/status=contacted/);
  const contacted = page.getByRole("row", { name: new RegExp(name) });
  await contacted.getByRole("button", { name: "Xóa" }).click();
  await confirmDialog(page, "Xóa yêu cầu");
  await expect(toast(page, "Đã xóa yêu cầu liên hệ.")).toBeVisible();
  await expect(contacted).toHaveCount(0);
});

test("tổng quan hiển thị việc cần xử lý và mở đúng bộ lọc", async ({ page }) => {
  await page.goto("/admin");
  const card = page.getByRole("link", { name: /Yêu cầu liên hệ chờ xử lý/ });
  await expect(card).toBeVisible();
  await expect(page.getByRole("link", { name: /Bản nháp chờ duyệt/ })).toBeVisible();
  await card.click();
  await expect(page).toHaveURL(/\/admin\/contact-submissions\?status=new/);
  await expect(page.getByRole("button", { name: /^Mới/ })).toHaveAttribute("aria-pressed", "true");
});
