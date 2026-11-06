# Xe Chuyên Dụng — Client

Ứng dụng web Next.js dành cho khách truy cập và trang quản trị nội dung. Client
chạy mặc định ở `http://localhost:3000`; API NestJS chạy riêng ở cổng `4000`.

## Kiến trúc và luồng dữ liệu

```text
Trình duyệt
  ├─ Trang công khai ──> Next.js Server Components ──> NestJS API ──> PostgreSQL
  ├─ Form liên hệ ────> POST /api/contact ───────────> NestJS API ──> PostgreSQL
  └─ /admin ──────────> API proxy cùng origin ───────> NestJS API ──> PostgreSQL
                           └─ phiên admin trong cookie HttpOnly
```

Trình duyệt không cần gọi trực tiếp API NestJS. `CONTENT_API_URL` được đọc ở
phía server của Next.js, không có tiền tố `NEXT_PUBLIC_`. Khi API không thể kết
nối, các trang xe/bài viết/chính sách có thể dùng dữ liệu mẫu đi kèm. Nếu API
trả lỗi HTTP, client báo lỗi thay vì âm thầm dùng dữ liệu mẫu; nếu API hoạt
động nhưng cơ sở dữ liệu chưa có nội dung, các trang tương ứng sẽ không tự nhập
dữ liệu mẫu.

## Chức năng và trang

| Đường dẫn                                   | Chức năng                                                       |
| ------------------------------------------- | --------------------------------------------------------------- |
| `/`                                         | Trang chủ, giới thiệu và xe nổi bật                             |
| `/xe`, `/xe/[slug]`                         | Danh mục xe, lọc/tìm kiếm và chi tiết                           |
| `/tin-tuc`, `/tin-tuc/[slug]`               | Bài viết kiến thức                                              |
| `/lien-he`                                  | Thông tin liên hệ và form tư vấn                                |
| `/chinh-sach`                               | Nội dung chính sách                                             |
| `/phap-ly`                                  | Tài liệu pháp lý tham khảo                                      |
| `/dich-vu`, `/tu-van-mua-xe`, `/gioi-thieu` | Nội dung dịch vụ và hướng dẫn                                   |
| `/admin`                                    | Tổng quan chỉ số, yêu cầu liên hệ gần đây và hoạt động quản trị |
| `/admin/vehicles`, `/admin/articles`        | CRUD danh mục xe và bài viết                                    |
| `/admin/policies`, `/admin/regulations`     | CRUD chính sách và quy định                                     |
| `/admin/legal-guides`                       | CRUD hướng dẫn tìm hiểu pháp lý                                 |
| `/admin/contact-submissions`                | Hộp thư yêu cầu tư vấn, trạng thái và xóa dữ liệu               |
| `/admin/activity`                           | Lịch sử thao tác quản trị chỉ đọc                               |

Danh mục mẫu tĩnh nằm trong `app/data/`. Ảnh nằm trong `app/assets/` và ánh xạ
tại `app/data/vehicle-images.ts`. Nội dung lấy từ API là nguồn dữ liệu khi API
đang hoạt động; dữ liệu mẫu không tự đồng bộ ngược vào PostgreSQL.

### Form liên hệ

Form gửi đến `POST /api/contact`; Next.js kiểm tra JSON/kích thước request,
honeypot và chuyển tiếp đến `POST /api/v1/contact-submissions`. NestJS kiểm tra
các trường, lưu thông tin yêu cầu cùng nội dung/thời điểm đồng ý vào PostgreSQL.
Form không sử dụng Google Sheets.

Admin tìm kiếm và phân trang yêu cầu gần nhất, gọi điện, cập nhật trạng thái
(`new`, `in_progress`, `contacted`, `closed`, `spam`) hoặc xóa yêu cầu. Audit
log ghi nhận cập nhật/xóa nhưng không chứa tên, số điện thoại hay nội dung tin
nhắn. Form có honeypot và API giới hạn tốc độ; vẫn nên cấu hình rate limit/WAF
ở reverse proxy khi triển khai nhiều instance.

### Trang quản trị

Đăng nhập bằng `ADMIN_USERNAME` và `ADMIN_PASSWORD` do server cấu hình. Next.js
nhận token từ API và lưu trong cookie `HttpOnly`, `SameSite=Lax`; trong
production cookie có cờ `Secure`. Client không lưu token trong `localStorage`.
API proxy giới hạn các đường dẫn quản trị được phép chuyển tiếp.

Nút **Nhập nội dung mẫu** chỉ thêm xe/bài viết có slug chưa tồn tại và không ghi
đè nội dung hiện có. Dữ liệu nhập qua proxy được đánh dấu công khai.

Giao diện quản trị dùng sidebar chung và các URL riêng cho từng phân hệ; có thể
mở trực tiếp hoặc tải lại từng trang mà vẫn giữ đúng mục đang quản lý. Danh
sách có tìm kiếm và phân trang phía server; trang tổng quan cung cấp số lượng
bản ghi cùng danh sách yêu cầu liên hệ và hoạt động gần đây.
Các trang xe, bài viết và pháp lý mở đầu bằng danh sách; dùng **Xem chi tiết**
để kiểm tra đầy đủ nội dung, hoặc chọn **Tạo mới**/**Sửa** khi cần mở biểu mẫu.
Danh sách nội dung, yêu cầu liên hệ và lịch sử hoạt động trình bày dạng bảng có
cột dữ liệu riêng; thao tác xem/sửa/xóa và đổi trạng thái nằm trong cột
**Hành động** phù hợp với từng loại dữ liệu.

## Chạy local

Yêu cầu Node.js/npm và PostgreSQL đã được cấu hình trong `server/.env`.

1. Mở terminal ở thư mục gốc workspace, cài dependencies, áp dụng migrations
   và chạy API:

   ```powershell
   cd server
   npm install
   npm run db:migrate
   npm run start:dev
   ```

2. Mở terminal khác tại thư mục gốc workspace, cấu hình API và chạy Next.js:

   ```powershell
   cd client
   if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
   npm install
   npm run dev
   ```

   `.env.example` mặc định trỏ đến API local. Nếu `.env.local` đã tồn tại, hãy
   kiểm tra `CONTENT_API_URL` thay vì ghi đè các thiết lập khác.

3. Mở `http://localhost:3000`; trang quản trị ở `http://localhost:3000/admin`.

Nếu đổi cổng hoặc địa chỉ server, cập nhật `CONTENT_API_URL` trong
`client/.env.local` thành URL API đầy đủ, ví dụ
`https://api.example.com/api/v1`, rồi khởi động lại Next.js. Khi deploy,
URL này phải truy cập được **từ môi trường chạy Next.js**; đây không phải URL
được gửi xuống trình duyệt.

## Lệnh

```bash
npm run dev    # Next.js dev server, cổng 3000
npm run lint   # ESLint
npm run build  # Build production và kiểm tra TypeScript
npm run start  # Chạy build production, cổng 3000
```

Client hiện chưa khai báo script kiểm thử tự động riêng. Build kiểm tra
TypeScript; cần bổ sung kiểm thử UI/API cho các luồng quan trọng.

## Cấu trúc chính

```text
app/
  admin/                 # Trang quản trị
  api/admin/             # Login/logout và proxy có xác thực
  api/contact/           # Proxy nhận form liên hệ
  components/            # Thành phần giao diện dùng chung
  data/                  # Dữ liệu mẫu và kiểu nội dung
  lib/content.ts         # Lấy nội dung công khai từ API, có fallback
  xe/, tin-tuc/          # Danh mục và trang chi tiết
  lien-he/, chinh-sach/, phap-ly/
  globals.css            # Style toàn cục
  layout.tsx             # Metadata và font
```

## Trước khi phát hành

- Đặt `CONTENT_API_URL` trỏ đến server production qua HTTPS; bảo đảm Next.js
  server truy cập được API và API truy cập được PostgreSQL.
- Dùng secrets riêng cho môi trường production; không commit `.env.local`.
- Cập nhật tên pháp nhân, đầu mối liên hệ, thông số/ảnh xe và nội dung pháp lý
  đã được kiểm duyệt.
- Xác nhận pháp nhân kiểm soát dữ liệu, mục đích/thời hạn lưu trữ và cách xử lý
  yêu cầu truy cập/xóa thông tin liên hệ.
- Cấu hình rate limit/WAF cho form liên hệ và endpoint đăng nhập.
- Kiểm tra backup/restore PostgreSQL và giám sát lỗi API.

Chi tiết API, database và migrations xem tại [README server](../server/README.md).
