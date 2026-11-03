# Xe Chuyên Dụng

Website giới thiệu xe tải và xe chuyên dụng, giúp khách hàng tìm dòng xe theo công năng, xem thông tin tham khảo và chuẩn bị yêu cầu tư vấn.

> Nội dung xe và bài viết được quản lý trong PostgreSQL; dự án vẫn có dữ liệu tĩnh để dự phòng khi API không kết nối. Form liên hệ gửi yêu cầu qua Next.js tới NestJS và lưu trong PostgreSQL. Cần xác nhận thông tin doanh nghiệp, xe và chính sách quyền riêng tư trước khi mở form công khai.

## Nội dung và chức năng

- Trang chủ giới thiệu các nhóm xe, nội dung hướng dẫn và lối vào trang liên hệ.
- Banner trang chủ dùng ảnh xe đông lạnh thật có trong asset, ghi rõ là ảnh tham khảo; các trang Dịch vụ, Tư vấn mua xe, Giới thiệu và Tin tức có bố cục responsive, chữ dễ đọc và thao tác rõ ràng.
- Danh mục xe hỗ trợ lọc theo loại, tìm kiếm không phân biệt dấu theo tên, thương hiệu, mô tả, công năng và thông tin cấu hình, đồng thời chọn tối đa ba xe để đối chiếu thông tin hiện có.
- Một số trang xe có ảnh trong `app/assets/` và thông tin tham khảo với liên kết nguồn; các thông tin này vẫn cần được xác nhận theo phiên bản và hồ sơ thực tế.
- Trang chi tiết cho từng xe trình bày thông tin đã biết, công năng, lưu ý và liên kết tư vấn theo xe đang xem.
- Trang liên hệ kiểm tra dữ liệu và sự đồng ý, gửi yêu cầu tới API; admin có thể xem, cập nhật trạng thái và xóa yêu cầu trong dashboard.
- Các trang nội dung gồm giới thiệu, dịch vụ, tư vấn mua xe, bài viết kiến thức và trạng thái chính sách.
- Giao diện responsive; nội dung dữ liệu được render tĩnh khi phù hợp.
- Kiểu chữ, tương phản và vùng thao tác được điều chỉnh để dễ đọc, dễ sử dụng trên nhiều kích thước màn hình.

### Các trang

| Đường dẫn         | Nội dung                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------- |
| `/`               | Trang chủ                                                                                |
| `/xe`             | Danh mục xe                                                                              |
| `/xe/[slug]`      | Chi tiết xe                                                                              |
| `/lien-he`        | Thông tin liên hệ Phước Nguyễn và form yêu cầu tư vấn; gửi dữ liệu khi API được cấu hình |
| `/gioi-thieu`     | Giới thiệu dự án                                                                         |
| `/dich-vu`        | Các bước tư vấn tham khảo                                                                |
| `/tu-van-mua-xe`  | Checklist chuẩn bị khi tìm mua xe                                                        |
| `/tin-tuc`        | Danh sách bài viết kiến thức                                                             |
| `/tin-tuc/[slug]` | Chi tiết bài viết                                                                        |
| `/chinh-sach`     | Trạng thái các nội dung chính sách cần xác nhận                                          |

## Dữ liệu và thông tin cần xác nhận

Danh mục hiện có 18 dòng xe thuộc bốn nhóm được định nghĩa tập trung trong `app/data/vehicles.ts`: xe tải, xe chữa cháy, xe cứu hộ và xe bồn / xe môi trường. Một số cấu hình có thông tin tham khảo được tổng hợp từ trang sản phẩm cụ thể, gồm FAW JH6 gắn cẩu, xe chữa cháy Isuzu/Dongfeng, Foton cứu hộ/nâng đầu, xe hút chất thải Foton và xe quét đường Isuzu; trang chi tiết liên kết tới nguồn tương ứng. Ảnh sản phẩm được lưu cục bộ trong `app/assets/` và ánh xạ theo đúng cấu hình ở `app/data/vehicle-images.ts`; mỗi xe hiển thị tối đa bốn ảnh. Số liệu được nguồn gọi là dự kiến, có điều kiện hoặc mâu thuẫn được ghi chú để người đọc không nhầm là thông số đã xác minh. Một số ảnh có thể còn logo hoặc thông tin liên hệ của nguồn ảnh; trang chi tiết ghi rõ đây không phải thông tin liên hệ của website. Những cấu hình chưa có ảnh phù hợp hiển thị hình minh họa có ghi chú, không mượn ảnh của loại xe khác. Trang chủ chọn các xe có ảnh để giới thiệu; trang `/xe` có toàn bộ danh mục. Công cụ so sánh chỉ đối chiếu dữ liệu đang hiển thị, không thay thế thông số đã xác minh. Thông tin nguồn tham khảo không xác nhận tình trạng xe đang bán.

Thông tin xe được khai báo tại `app/data/vehicles.ts`; ảnh xe tại `app/assets/` và ánh xạ ảnh tại `app/data/vehicle-images.ts`; bài viết tại `app/data/articles.ts`. Trước khi đưa website vào hoạt động, cần:

1. Xác nhận tên pháp nhân, địa chỉ, giờ làm việc, showroom và các kênh mạng xã hội. Thông tin đầu mối Phước Nguyễn, số điện thoại và email đã được cung cấp để hiển thị.
2. Thay dữ liệu minh họa bằng danh sách xe, ảnh, phiên bản và thông số đã được doanh nghiệp kiểm duyệt.
3. Xác nhận phạm vi dịch vụ, báo giá, tình trạng hàng, giao nhận, bảo hành, thanh toán và hồ sơ pháp lý.
4. Cấu hình API nhận yêu cầu và hoàn thiện chính sách quyền riêng tư, bao gồm đơn vị chịu trách nhiệm, thời hạn lưu trữ và đầu mối xử lý yêu cầu dữ liệu.
5. Chỉ nhúng bản đồ, số điện thoại hoặc liên kết mạng xã hội sau khi có thông tin chính thức.

Thông tin xe tham khảo không phải thông tin doanh nghiệp của website này; không sao chép địa chỉ, hotline, chính sách hoặc tuyên bố thương mại của nguồn tham khảo thành thông tin của dự án. Cần xác minh thông số và quyền sử dụng ảnh/nội dung trước khi phát hành. Các bài kiến thức chỉ mang tính định hướng; thông số và quy định cần được đối chiếu theo xe và thời điểm thực tế.

## Công nghệ

- [Next.js](https://nextjs.org) App Router
- [NestJS](https://nestjs.com) REST API
- PostgreSQL qua `pg` và migration SQL
- React
- TypeScript
- Tailwind CSS và CSS tùy chỉnh

## Bắt đầu

Yêu cầu Node.js và npm. Từ thư mục `client`, cài dependencies và chạy máy chủ phát triển:

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000). Thay đổi trong thư mục `app/` sẽ được cập nhật tự động.

### Form liên hệ và quản lý yêu cầu

Form gửi `POST /api/contact` tới Next.js; route này chuyển tiếp tới
`POST /api/v1/contact-submissions` của NestJS. Server xác thực trường dữ liệu,
kiểm tra checkbox đồng ý và lưu nội dung cùng phiên bản câu chữ đồng ý/thời
điểm gửi vào PostgreSQL. Form không cần biến môi trường Google Apps Script.

Admin xem tối đa 200 yêu cầu gần nhất tại **/admin → Yêu cầu liên hệ**, tìm
theo thông tin gửi, gọi số điện thoại, cập nhật trạng thái (mới, đang xử lý,
đã liên hệ, hoàn tất, spam) hoặc xóa dữ liệu theo yêu cầu. Audit log ghi thao
tác nhưng không ghi tên, số điện thoại hay nội dung tin nhắn.

Trước khi bật công khai, xác nhận pháp nhân kiểm soát dữ liệu, mục đích và
thời hạn lưu trữ, đầu mối xử lý yêu cầu truy cập/xóa và chính sách bảo mật
backup. Form có honeypot chống bot cơ bản; triển khai production nên cấu hình
rate limit ở reverse proxy/WAF.

### Backend quản trị xe và tin tức

Backend quản trị nằm trong `server/`, chạy riêng trên cổng `4000`; website Next.js chạy trên cổng `3000`. Đổi cổng API bằng biến `PORT` phía server và cập nhật `CONTENT_API_URL` phía client để trỏ đến API tương ứng. Dữ liệu xe, bài viết và yêu cầu tư vấn được lưu trong PostgreSQL. Trang `/admin` dùng cookie phiên `HttpOnly` và proxy API phía Next.js.

#### Chạy local

1. Cấu hình `DATABASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` và
   `ADMIN_AUTH_SECRET` trong `server/.env`.
2. Từ `server`, cài dependencies, áp dụng migration và chạy API:

   ```bash
   npm install
   npm run db:migrate
   npm run start:dev
   ```

3. Trong cửa sổ terminal khác, từ `client`, chạy Next.js:

   ```bash
   npm install
   npm run dev
   ```

4. Mở `http://localhost:3000/admin` để quản lý nội dung và yêu cầu tư vấn.

API công khai: `GET /api/v1/vehicles`, `GET /api/v1/vehicles/:slug`, `GET /api/v1/articles`, `GET /api/v1/articles/:slug` và `POST /api/v1/contact-submissions`. CRUD quản trị nằm dưới `/api/v1/admin/vehicles` và `/api/v1/admin/articles`; hộp thư liên hệ nằm dưới `/api/v1/admin/contact-submissions`; đăng nhập tại `/api/v1/auth/login`. Các endpoint quản trị yêu cầu xác thực admin. Xe/bài viết ở trạng thái bản nháp chỉ xuất hiện trong trang quản trị, không được trả về API công khai. Slug phải là chữ thường không dấu, số và dấu gạch nối; danh mục xe được giới hạn theo các nhóm có sẵn trên website.

Next.js đọc `CONTENT_API_URL` từ `.env.local` phía máy chủ. Khi API chưa chạy, trang công khai ghi lỗi vào log và dùng nội dung mẫu tĩnh; khi API đã kết nối, dữ liệu PostgreSQL là nguồn hiển thị. Trên production, đặt biến môi trường trong `server/.env` theo mẫu, cấu hình `CONTENT_API_URL` để Next.js gọi được API, chạy `npm run db:migrate`, rồi chạy API bằng `npm run start:prod`. Không dùng static export.

Ảnh xe trong CMS nhận URL HTTPS hoặc đường dẫn cùng website; ảnh được trình duyệt tải trực tiếp, không qua proxy tối ưu ảnh của server. Hệ thống hiện chưa có chức năng tải ảnh lên.

### Các lệnh thường dùng

```bash
npm run dev    # Chạy máy chủ phát triển
npm run lint   # Kiểm tra ESLint
npm run build  # Build production và kiểm tra TypeScript
npm run start  # Chạy bản build production
```

## Cấu trúc chính

```text
app/
  components/          # Header, footer, form và thành phần danh mục dùng chung
  assets/              # Ảnh xe dùng trong danh mục và trang chi tiết
  data/                # Dữ liệu xe, ánh xạ ảnh và bài viết
  api/contact/         # Chuyển yêu cầu tư vấn tới NestJS
  xe/                  # Danh mục xe và trang chi tiết [slug]
  lien-he/             # Trang liên hệ
  gioi-thieu/          # Trang giới thiệu
  dich-vu/             # Trang dịch vụ
  tu-van-mua-xe/       # Hướng dẫn chọn xe
  tin-tuc/             # Danh sách và bài viết [slug]
  chinh-sach/          # Trạng thái thông tin chính sách
  globals.css          # Design system và responsive
  layout.tsx           # Layout gốc và metadata
  page.tsx             # Trang chủ
public/                # Tài nguyên tĩnh
```

## Quy trình GitFlow

Dự án sử dụng `main` và `develop` làm hai nhánh dài hạn:

- `main`: mã nguồn phiên bản đã phát hành; gắn tag phiên bản, ví dụ `v1.0.0`.
- `develop`: nhánh tích hợp các tính năng cho phiên bản kế tiếp.
- `feature/*`: phát triển tính năng; tạo từ `develop` và gộp trở lại `develop`.
- `release/*`: ổn định phiên bản chuẩn bị phát hành; tạo từ `develop`, sau đó gộp vào cả `main` và `develop`.
- `hotfix/*`: sửa lỗi khẩn cấp trên phiên bản đã phát hành; tạo từ `main`, sau đó gộp vào cả `main` và `develop`.

### Phát triển tính năng

Tạo nhánh tính năng từ `develop`, kiểm tra thay đổi rồi mở Pull Request trở lại `develop`:

```bash
git switch develop
git pull
git switch -c feature/ten-tinh-nang

# Sau khi thay đổi
npm run lint
npm run build
git add .
git commit -m "feat: mo ta tinh nang"
git push -u origin feature/ten-tinh-nang
```

Không gộp nhánh `feature/*` trực tiếp vào `main`. Xóa nhánh tính năng sau khi Pull Request được gộp.

### Chuẩn bị phát hành

Khi các tính năng cần thiết đã có trong `develop`, tạo nhánh phát hành để kiểm thử và chỉ sửa các lỗi cần cho phiên bản đó:

```bash
git switch develop
git pull
git switch -c release/1.0.0
```

Sau khi kiểm thử đạt yêu cầu, gộp nhánh release vào `main`, tạo tag phiên bản, rồi gộp nhánh release trở lại `develop` để giữ các thay đổi sửa lỗi. Xóa nhánh release sau khi hoàn tất.

### Sửa lỗi khẩn cấp

Tạo nhánh hotfix từ `main`. Sau khi sửa và kiểm thử, gộp thay đổi vào cả `main` và `develop`, rồi tạo tag phiên bản vá, ví dụ `v1.0.1`:

```bash
git switch main
git pull
git switch -c hotfix/mo-ta-loi
```

## Tài liệu Next.js

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
