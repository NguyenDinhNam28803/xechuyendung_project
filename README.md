# Xe Chuyên Dụng

Website giới thiệu xe tải và xe chuyên dụng, giúp khách hàng tìm dòng xe theo công năng, xem thông tin tham khảo và chuẩn bị yêu cầu tư vấn.

> Dự án hiện là bản giao diện mẫu. Danh mục xe và bài viết là dữ liệu tĩnh để minh họa; form liên hệ chưa gửi hoặc lưu thông tin. Cần xác nhận thông tin doanh nghiệp, xe, chính sách và tích hợp kênh tiếp nhận yêu cầu trước khi công khai.

## Nội dung và chức năng

- Trang chủ giới thiệu các nhóm xe, nội dung hướng dẫn và lối vào trang liên hệ.
- Danh mục xe hỗ trợ lọc theo loại, tìm kiếm theo tên, thương hiệu hoặc mô tả, và chọn tối đa ba xe để đối chiếu thông tin hiện có.
- Trang chi tiết cho từng xe trình bày thông tin đã biết, công năng, lưu ý và liên kết tư vấn theo xe đang xem.
- Trang liên hệ có form mẫu, kiểm tra trường bắt buộc và hiển thị trạng thái. Form chưa gửi dữ liệu đến máy chủ.
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

Danh mục hiện có 18 dòng xe minh họa thuộc các nhóm xe tải, xe chữa cháy, xe cứu hộ và xe bồn / xe môi trường. Trang chủ hiển thị một số xe tiêu biểu; trang `/xe` có toàn bộ danh mục. Công cụ so sánh chỉ đối chiếu nội dung mẫu đang có, không phải bảng thông số kỹ thuật đã xác minh. Các mục mẫu không đại diện cho xe đang bán.

Thông tin xe được khai báo tại `app/data/vehicles.ts`; bài viết tại `app/data/articles.ts`. Trước khi đưa website vào hoạt động, cần:

1. Xác nhận tên pháp nhân, địa chỉ, hotline, email, giờ làm việc, showroom và các kênh mạng xã hội.
2. Thay dữ liệu minh họa bằng danh sách xe, ảnh, phiên bản và thông số đã được doanh nghiệp kiểm duyệt.
3. Xác nhận phạm vi dịch vụ, báo giá, tình trạng hàng, giao nhận, bảo hành, thanh toán và hồ sơ pháp lý.
4. Kết nối form liên hệ với API hoặc dịch vụ nhận yêu cầu, bổ sung xử lý thành công/lỗi và chính sách quyền riêng tư trước khi thu thập dữ liệu.
5. Chỉ nhúng bản đồ, số điện thoại hoặc liên kết mạng xã hội sau khi có thông tin chính thức.

Không sử dụng nội dung tham khảo trên website khác làm thông tin doanh nghiệp của dự án. Các bài kiến thức chỉ mang tính định hướng; thông số và quy định cần được xác minh theo xe và thời điểm thực tế.

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
  data/                # Dữ liệu xe và bài viết mẫu
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
