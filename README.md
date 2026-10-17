# Xe Chuyên Dụng

Website giới thiệu xe tải và xe chuyên dụng, giúp khách hàng tìm dòng xe theo công năng, xem thông tin tham khảo và chuẩn bị yêu cầu tư vấn.

> Danh mục xe và bài viết hiện là dữ liệu tĩnh để minh họa. Form liên hệ gửi yêu cầu qua API Next.js tới Google Sheets khi đã cấu hình Apps Script và biến môi trường. Cần xác nhận thông tin doanh nghiệp, xe và nội dung quyền riêng tư trước khi mở form công khai.

## Nội dung và chức năng

- Trang chủ giới thiệu các nhóm xe, nội dung hướng dẫn và lối vào trang liên hệ.
- Danh mục xe hỗ trợ lọc theo loại, tìm kiếm theo tên, thương hiệu hoặc mô tả, và chọn tối đa ba xe để đối chiếu thông tin hiện có.
- Một số trang xe có ảnh trong `app/assets/` và thông tin tham khảo với liên kết nguồn; các thông tin này vẫn cần được xác nhận theo phiên bản và hồ sơ thực tế.
- Trang chi tiết cho từng xe trình bày thông tin đã biết, công năng, lưu ý và liên kết tư vấn theo xe đang xem.
- Trang liên hệ gửi yêu cầu tư vấn tới Google Sheets qua API phía máy chủ; báo trạng thái gửi thành công hoặc lỗi.
- Các trang nội dung gồm giới thiệu, dịch vụ, tư vấn mua xe, bài viết kiến thức và trạng thái chính sách.
- Giao diện responsive; nội dung dữ liệu được render tĩnh khi phù hợp.
- Kiểu chữ, tương phản và vùng thao tác được điều chỉnh để dễ đọc, dễ sử dụng trên nhiều kích thước màn hình.

### Các trang

| Đường dẫn | Nội dung |
| --- | --- |
| `/` | Trang chủ |
| `/xe` | Danh mục xe |
| `/xe/[slug]` | Chi tiết xe |
| `/lien-he` | Form yêu cầu tư vấn (bản mẫu, chưa gửi) |
| `/gioi-thieu` | Giới thiệu dự án |
| `/dich-vu` | Các bước tư vấn tham khảo |
| `/tu-van-mua-xe` | Checklist chuẩn bị khi tìm mua xe |
| `/tin-tuc` | Danh sách bài viết kiến thức |
| `/tin-tuc/[slug]` | Chi tiết bài viết |
| `/chinh-sach` | Trạng thái các nội dung chính sách cần xác nhận |

## Dữ liệu và thông tin cần xác nhận

Danh mục hiện có 18 dòng xe thuộc các nhóm xe tải, xe chữa cháy, xe cứu hộ và xe bồn / xe môi trường. Một số xe có thông tin tham khảo được tóm tắt từ trang sản phẩm bên ngoài và đường dẫn nguồn ở trang chi tiết; những xe còn lại là dữ liệu minh họa. Bốn bộ ảnh xe trong `app/assets/` được nối với danh mục qua `app/data/vehicle-images.ts`. Trang chủ chọn các xe có ảnh để giới thiệu; trang `/xe` có toàn bộ danh mục. Công cụ so sánh chỉ đối chiếu dữ liệu đang hiển thị, không thay thế thông số đã xác minh. Thông tin nguồn tham khảo không xác nhận tình trạng xe đang bán.

Thông tin xe được khai báo tại `app/data/vehicles.ts`; ảnh xe tại `app/assets/` và ánh xạ ảnh tại `app/data/vehicle-images.ts`; bài viết tại `app/data/articles.ts`. Trước khi đưa website vào hoạt động, cần:

1. Xác nhận tên pháp nhân, địa chỉ, hotline, email, giờ làm việc, showroom và các kênh mạng xã hội.
2. Thay dữ liệu minh họa bằng danh sách xe, ảnh, phiên bản và thông số đã được doanh nghiệp kiểm duyệt.
3. Xác nhận phạm vi dịch vụ, báo giá, tình trạng hàng, giao nhận, bảo hành, thanh toán và hồ sơ pháp lý.
4. Cấu hình API nhận yêu cầu và hoàn thiện chính sách quyền riêng tư, bao gồm đơn vị chịu trách nhiệm, thời hạn lưu trữ và đầu mối xử lý yêu cầu dữ liệu.
5. Chỉ nhúng bản đồ, số điện thoại hoặc liên kết mạng xã hội sau khi có thông tin chính thức.

Thông tin xe tham khảo không phải thông tin doanh nghiệp của website này; không sao chép địa chỉ, hotline, chính sách hoặc tuyên bố thương mại của nguồn tham khảo thành thông tin của dự án. Cần xác minh thông số và quyền sử dụng ảnh/nội dung trước khi phát hành. Các bài kiến thức chỉ mang tính định hướng; thông số và quy định cần được đối chiếu theo xe và thời điểm thực tế.

## Công nghệ

- [Next.js](https://nextjs.org) App Router
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

### Kết nối form liên hệ với Google Sheets

1. Tạo một Google Sheet dành riêng cho các yêu cầu tư vấn.
2. Tạo một dự án tại [Google Apps Script](https://script.google.com/) và chép nội dung `google-apps-script/Code.gs` vào `Code.gs`.
3. Trong **Project Settings → Script Properties**, thêm `SPREADSHEET_ID` (ID trong URL của Sheet) và `SHARED_SECRET` (một chuỗi ngẫu nhiên dài). Dùng cùng giá trị bí mật cho biến `GOOGLE_SHEETS_SHARED_SECRET` ở bước tiếp theo.
4. Deploy Apps Script dưới dạng **Web app**, chọn chạy dưới tài khoản của bạn (**Execute as me**) và cho phép truy cập (**Who has access**) phù hợp để máy chủ website gọi được. Sao chép URL `/exec` của deployment.
5. Tạo `client/.env.local` từ `.env.example`, điền URL `/exec` vào `GOOGLE_APPS_SCRIPT_URL` và cùng bí mật vào `GOOGLE_SHEETS_SHARED_SECRET`. Không dùng tiền tố `NEXT_PUBLIC_` cho bí mật; không commit `.env.local`.
6. Khởi động lại Next.js. Gửi thử một yêu cầu và xác nhận dòng mới xuất hiện trong Sheet. API kiểm tra dữ liệu và chuyển tiếp ở phía máy chủ; mật khẩu dùng chung không được gửi xuống trình duyệt.

Apps Script sẽ ghi tiêu đề cột ở lần gửi đầu tiên và thêm thời gian nhận, thông tin liên hệ, nhu cầu cùng xe đang quan tâm. Giới hạn/quyền truy cập Sheet nên chỉ cấp cho người cần xử lý khách hàng. Google Apps Script có giới hạn sử dụng và không cung cấp chống spam/rate limit đầy đủ; nếu lượng yêu cầu tăng, cần bổ sung bảo vệ phù hợp hoặc chuyển sang CRM. Trước khi bật form cho khách thật, hoàn thiện thông tin còn thiếu trong trang `/chinh-sach`.

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
google-apps-script/    # Endpoint ghi yêu cầu tư vấn vào Google Sheets
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
