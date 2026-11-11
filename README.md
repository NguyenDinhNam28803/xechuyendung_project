# Xe Chuyên Dụng — Client

Ứng dụng web Next.js dành cho khách truy cập và trang quản trị nội dung. Client
chạy mặc định ở `http://localhost:3000`; API NestJS chạy riêng ở cổng `4000`
trong repository
[`xechuyendung_project_server`](https://github.com/NguyenDinhNam28803/xechuyendung_project_server).

Sơ đồ hệ thống, người dùng, luồng dữ liệu và quy trình nghiệp vụ:
[`docs/architecture.md`](https://github.com/NguyenDinhNam28803/xechuyendung_project_server/blob/main/docs/architecture.md) (trong repo server).

## Kiến trúc và luồng dữ liệu

```text
Trình duyệt
  ├─ Trang công khai ──> Next.js Server Components ──> NestJS API ──> PostgreSQL
  ├─ Form liên hệ ────> POST /api/contact ───────────> NestJS API ──> PostgreSQL
  └─ /admin ──────────> API proxy cùng origin ───────> NestJS API ──> PostgreSQL
        ▲                  └─ phiên admin trong cookie HttpOnly
        └─ proxy.ts: chưa có cookie → /admin/login; POST/PATCH/DELETE khác origin → 403
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
| `/admin/login`                              | Đăng nhập quản trị (mỗi người một tài khoản)                    |
| `/admin`                                    | Tổng quan chỉ số, yêu cầu liên hệ gần đây và hoạt động quản trị |
| `/admin/vehicles`, `/admin/articles`        | CRUD danh mục xe và bài viết                                    |
| `/admin/policies`, `/admin/regulations`     | CRUD chính sách và quy định                                     |
| `/admin/legal-guides`                       | CRUD hướng dẫn tìm hiểu pháp lý                                 |
| `/admin/contact-submissions`                | Hộp thư yêu cầu tư vấn, trạng thái và xóa dữ liệu               |
| `/admin/activity`                           | Lịch sử thao tác, ghi rõ tài khoản thực hiện                    |
| `/admin/users`                              | Quản lý tài khoản (chỉ vai trò `admin`)                         |
| `/admin/account`                            | Đổi mật khẩu của chính mình                                     |

Danh mục mẫu tĩnh nằm trong `app/data/`. Ảnh nằm trong `app/assets/` và ánh xạ
tại `app/data/vehicle-images.ts`. Nội dung lấy từ API là nguồn dữ liệu khi API
đang hoạt động; dữ liệu mẫu không tự đồng bộ ngược vào PostgreSQL.

### Form liên hệ

Form gửi đến `POST /api/contact`; Next.js kiểm tra JSON/kích thước request,
honeypot và chuyển tiếp đến `POST /api/v1/contact-submissions`. NestJS kiểm tra
các trường, lưu thông tin yêu cầu cùng nội dung/thời điểm đồng ý vào PostgreSQL.
Form không sử dụng Google Sheets (mã Google Apps Script cũ đã được gỡ bỏ).

Admin tìm kiếm và phân trang yêu cầu gần nhất, gọi điện, cập nhật trạng thái
(`new`, `in_progress`, `contacted`, `closed`, `spam`) hoặc xóa yêu cầu. Audit
log ghi nhận cập nhật/xóa nhưng không chứa tên, số điện thoại hay nội dung tin
nhắn. Form có honeypot và API giới hạn tốc độ; vẫn nên cấu hình rate limit/WAF
ở reverse proxy khi triển khai nhiều instance.

### Trang quản trị

- **Tài khoản:** mỗi người đăng nhập bằng tài khoản riêng do quản trị viên tạo
  tại `/admin/users`. Vai trò `admin` quản lý thêm tài khoản; `editor` quản lý
  nội dung và hộp thư. Tài khoản đầu tiên do server tạo từ
  `ADMIN_USERNAME`/`ADMIN_PASSWORD` (xem README server).
- **Phiên:** Next.js nhận token từ API và lưu trong cookie `HttpOnly`,
  `SameSite=Lax` (`Secure` trong production); token không bao giờ đến
  JavaScript của trình duyệt. Đăng xuất thu hồi phiên ở server; khóa tài khoản
  hoặc đổi vai trò/mật khẩu đăng xuất mọi thiết bị của tài khoản đó.
- **`proxy.ts`** (Next.js 16, thay cho `middleware.ts`): chưa có cookie thì
  chuyển `/admin/*` về `/admin/login?next=…` (chỉ chấp nhận `next` nội bộ để
  tránh open redirect); request thay đổi dữ liệu tới `/api/admin/*` phải cùng
  origin (chống CSRF). Proxy chuyển tiếp chỉ cho phép các đường dẫn trong
  whitelist `app/lib/admin-paths.ts`.
- **Nhập nội dung mẫu** chỉ thêm xe/bài viết có slug chưa tồn tại, không ghi đè
  và luôn ở trạng thái **nháp** để người quản trị duyệt trước khi công khai.
- Mỗi phân hệ có URL riêng, chỉ tải dữ liệu của chính nó, có tìm kiếm
  (debounce) và phân trang phía server.

### Cấu trúc mã quản trị

```text
app/admin/
  layout.tsx                 # CSS + metadata noindex
  login/                     # Trang đăng nhập
  (console)/layout.tsx       # Khung sidebar/topbar + kiểm tra phiên
  (console)/<phân hệ>/page.tsx
  _components/
    admin-console.tsx        # Sidebar (huy hiệu liên hệ mới), topbar, menu theo vai trò
    session-context.tsx      # Người dùng hiện tại, đăng xuất, xử lý phiên hết hạn
    ui-feedback.tsx          # Toast + hộp xác nhận/nhập (thay window.confirm/prompt)
    drawer.tsx               # Panel tạo/sửa trượt từ phải (<dialog> modal)
    form-editors.tsx         # Slug tự sinh, bảng thông số, danh sách ảnh, mục bài viết
    ui.tsx, detail-dialog.tsx
    sections/*-section.tsx   # Một file cho mỗi phân hệ
  _lib/
    types.ts                 # Kiểu dữ liệu lấy từ OpenAPI của server
    admin-api.ts             # fetch qua route handler cùng origin
    use-paged-list.ts        # Danh sách phân trang + tìm kiếm + bộ lọc, đồng bộ lên URL
    use-entity-editor.ts     # Tạo/sửa/xóa dùng chung, cảnh báo thay đổi chưa lưu
    contact-stats.ts         # Đếm yêu cầu liên hệ theo trạng thái
    list-query.ts, slug.ts, content-fields.ts  # Hàm thuần (có unit test)
admin.css, admin-components.css
```

Hành vi chung của các phân hệ:

- **Drawer tạo/sửa**: form mở trong panel bên phải, danh sách vẫn ở phía sau.
  Đóng khi còn thay đổi chưa lưu sẽ hỏi xác nhận; tải lại/đóng tab thì trình
  duyệt cảnh báo.
- **Trạng thái trên URL**: trang, từ khóa và bộ lọc (`?published=false`,
  `?status=new`, `?q=...&page=2`) được giữ khi tải lại hoặc chia sẻ link.
  Riêng hộp thư liên hệ **không** đưa từ khóa lên URL (dữ liệu cá nhân).
- **Bộ lọc**: xe/bài viết/pháp lý lọc theo Đang công khai/Bản nháp; liên hệ lọc
  theo 5 trạng thái, có số đếm từng trạng thái.
- **Nhập liệu có cấu trúc**: slug tự sinh từ tên khi tạo mới (bỏ dấu tiếng
  Việt); thông số xe nhập dạng bảng; ảnh có xem trước và chỉ nhận `https://`
  hoặc đường dẫn `/`; nội dung bài viết nhập theo từng mục.
- **Hộp thư liên hệ**: drawer chi tiết với nút gọi, thông tin đồng ý, đổi trạng
  thái bằng nút Lưu; sidebar hiển thị số yêu cầu "Mới".

Kiểu dữ liệu API sinh từ `openapi.yaml` của server bằng
[`openapi-typescript`](https://openapi-ts.dev) vào
`app/lib/generated/api-schema.ts` (đã commit). Khi server đổi hợp đồng API:

```bash
npm run gen:api   # tìm ../xechuyendung_project_server/openapi.yaml rồi ../server/openapi.yaml
OPENAPI_SPEC=https://api.example.com/openapi.yaml npm run gen:api
```

`gen:api` chạy qua `scripts/gen-api.mjs` nên dùng được trên cả Windows.

## Chạy local

Yêu cầu Node.js 22/npm và PostgreSQL đã được cấu hình trong `.env` của repo
server.

1. Clone hai repository cạnh nhau (`xechuyendung_project` và
   `xechuyendung_project_server`). Trong repo server, cài dependencies, áp
   dụng migrations và chạy API:

   ```powershell
   cd xechuyendung_project_server
   npm install
   npm run db:migrate
   npm run start:dev
   ```

2. Mở terminal khác tại thư mục gốc workspace, cấu hình API và chạy Next.js:

   ```powershell
   cd xechuyendung_project
   if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
   npm install
   npm run dev
   ```

   `.env.example` mặc định trỏ đến API local. Nếu `.env.local` đã tồn tại, hãy
   kiểm tra `CONTENT_API_URL` thay vì ghi đè các thiết lập khác.

3. Mở `http://localhost:3000`; trang quản trị ở `http://localhost:3000/admin`.

Nếu đổi cổng hoặc địa chỉ server, cập nhật `CONTENT_API_URL` trong
`.env.local` thành URL API đầy đủ, ví dụ
`https://api.example.com/api/v1`, rồi khởi động lại Next.js. Khi deploy,
URL này phải truy cập được **từ môi trường chạy Next.js**; đây không phải URL
được gửi xuống trình duyệt.

## Lệnh

```bash
npm run dev        # Next.js dev server, cổng 3000
npm run lint       # ESLint
npm run typecheck  # Sinh route types và kiểm tra TypeScript
npm test           # node:test cho các hàm bảo mật (redirect, whitelist, CSRF)
npm run build      # Build production
npm run start      # Chạy build production, cổng 3000
npm run gen:api    # Sinh lại kiểu dữ liệu từ OpenAPI của server
npm run test:e2e   # Playwright E2E trang quản trị (cần API + PostgreSQL, xem dưới)
```

CI (`.github/workflows/ci.yml`) có hai job trên mỗi push vào `main` và mỗi pull
request:

- **verify**: lint, typecheck, unit test, build.
- **e2e**: checkout repo server (`main`), PostgreSQL 16 mới, migrate, chạy API,
  build Next.js rồi chạy Playwright bằng Google Chrome có sẵn trên runner
  (`E2E_BROWSER_CHANNEL=chrome`). Khi lỗi, báo cáo Playwright và
  log API được đính kèm làm artifact.

### Kiểm thử E2E

Bộ test trong `e2e/` tạo/sửa/xóa dữ liệu thật: **chỉ chạy với database dành
riêng cho kiểm thử, không bao giờ với production**.

1. Chạy API với database kiểm thử đã migrate và tài khoản admin khởi tạo, ví
   dụ `ADMIN_USERNAME=e2e-admin`, `ADMIN_PASSWORD=e2e-admin-password-123`.
2. Ở repo client:

   ```bash
   npm run build
   CONTENT_API_URL=http://127.0.0.1:4000/api/v1 \
   E2E_ADMIN_USERNAME=e2e-admin E2E_ADMIN_PASSWORD=e2e-admin-password-123 \
   npm run test:e2e
   ```

Playwright tự chạy `next start` ở cổng 3100 (`E2E_PORT`). Đặt
`E2E_BASE_URL` để dùng server có sẵn, hoặc `E2E_BROWSER_CHANNEL=msedge`/`chrome`
để dùng trình duyệt đã cài thay cho Chromium tải về. Bộ test đăng nhập 2 lần
mỗi lượt chạy; endpoint đăng nhập giới hạn 5 lần/IP/15 phút, nên chạy liên
tiếp nhiều lượt có thể nhận lỗi "quá thường xuyên".

## Cấu trúc chính

```text
app/
  admin/                 # Trang quản trị
  api/admin/             # Login/logout/me và proxy có xác thực
  api/contact/           # Proxy nhận form liên hệ
  components/            # Thành phần giao diện dùng chung
  data/                  # Dữ liệu mẫu và kiểu nội dung
  lib/content.ts         # Lấy nội dung công khai từ API, có fallback
  lib/admin-backend.ts   # Cookie phiên, kiểm tra cùng origin
  lib/admin-paths.ts     # Whitelist đường dẫn proxy quản trị
  lib/generated/         # Kiểu dữ liệu sinh từ OpenAPI
proxy.ts                 # Chuyển hướng đăng nhập, chống CSRF
tests/                   # node:test
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

Chi tiết API, database và migrations xem tại
[README server](https://github.com/NguyenDinhNam28803/xechuyendung_project_server#readme).
