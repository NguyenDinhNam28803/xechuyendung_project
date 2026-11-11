# Thiết kế nâng cấp trang quản trị (2026-11-11)

Trạng thái: đã duyệt và đã triển khai (client + server, nhánh `feature/admin-ux`).

## Mục tiêu

Nâng trải nghiệm biên tập và xử lý yêu cầu liên hệ của trang `/admin` mà không
đổi kiến trúc BFF (Next.js proxy cùng origin, cookie HttpOnly).

## Vấn đề ban đầu

1. Thông số xe và nội dung bài viết nhập bằng JSON thô.
2. Ảnh nhập URL từng dòng, không xem trước; slug gõ tay.
3. Không lọc được theo nháp/công khai hay trạng thái liên hệ (server cũng chưa hỗ trợ).
4. Đổi trạng thái liên hệ bằng `<select>` lưu ngay, không có màn chi tiết, không có số yêu cầu mới.
5. `window.confirm`/`window.prompt`, thông báo một dòng, mất dữ liệu form khi lỡ tay đóng.
6. Trang/từ khóa không nằm trên URL; phân trang chỉ Trước/Tiếp.
7. Tổng quan không có chỉ số cần xử lý.
8. Logic CRUD lặp lại ở 3 phân hệ.
9. `typecheck` lỗi do type cũ trong `.next/dev`.
10. Không có test giao diện; E2E chưa trong CI.

## Thiết kế

### Server (NestJS)
- `queryPage` nhận `filters: { column, value }[]` (so sánh bằng; cột là hằng số, giá trị là tham số; `undefined` bị bỏ qua).
- `GET /admin/{vehicles,articles,legal-resources}` nhận `published=true|false` (giá trị khác → 400).
- `POST /admin/contact-submissions/search` nhận `status` tùy chọn (5 trạng thái hợp lệ).
- OpenAPI, README, unit test cập nhật. Không thêm endpoint thống kê: đếm bằng `limit=1` và `pagination.total`.

### Client
- `Drawer` (`<dialog>` modal, bên phải, toàn màn hình mobile) cho mọi form tạo/sửa.
- `UiFeedbackProvider`: toast (popover manual để nằm trên dialog) + `confirm()`/`prompt()` dạng Promise.
- `useEntityEditor`: mở/đóng drawer, dirty-check (hỏi khi đóng, `beforeunload`), POST/PATCH/DELETE, toast.
- `usePagedList`: thêm bộ lọc, đồng bộ `page`/`q`/bộ lọc lên URL bằng `history.replaceState`; `persistSearch: false` cho hộp thư liên hệ.
- Trình nhập: `SlugField` + `autoSlug`, `SpecsEditor`, `ImageListEditor` (https:// hoặc `/`, tối đa 4), `SectionsEditor`.
- Hộp thư liên hệ: tab trạng thái có số đếm, drawer chi tiết, đổi trạng thái bằng nút Lưu; sự kiện `admin-contacts-changed` cập nhật huy hiệu sidebar.
- Tổng quan: thẻ "Yêu cầu liên hệ chờ xử lý" và "Bản nháp chờ duyệt" dẫn tới danh sách đã lọc.
- Proxy `/api/admin/content/*` cho phép thêm tham số `published`.

### Chất lượng
- Hàm thuần (`slug.ts`, `content-fields.ts`, `list-query.ts`) test bằng `node:test`.
- Playwright E2E (`e2e/`) với API + PostgreSQL thật; job `e2e` trong CI checkout repo server.
- `gen:api` chạy qua script Node để dùng được trên Windows.

## Ngoài phạm vi
Upload ảnh, trình soạn thảo rich-text, biểu đồ thống kê.
