# Xe Chuyên Dụng

Website giới thiệu các dòng xe tải và xe chuyên dụng, giúp khách hàng khám phá danh mục xe và liên hệ tư vấn cấu hình phù hợp.

## Nội dung dự án

Website hướng đến doanh nghiệp và khách hàng đang tìm phương tiện phục vụ vận tải, công trình và các nhiệm vụ chuyên biệt. Giao diện tập trung vào việc giới thiệu dòng xe, phân loại theo mục đích sử dụng và hướng khách hàng đến bước tư vấn.

### Các nội dung trên trang chủ

- **Giới thiệu:** thông điệp chính về giải pháp xe tải và xe chuyên dụng, cùng liên kết đến danh mục và tư vấn.
- **Dịch vụ hỗ trợ:** tư vấn cấu hình, hỗ trợ hồ sơ và kết nối khách hàng toàn quốc.
- **Danh mục xe tiêu biểu:** hiện có xe tải FAW J6L thùng bạt 2 tầng, xe chữa cháy Isuzu 4 khối và xe cứu hộ Foton 2 chức năng.
- **Khu vực tư vấn:** hướng khách hàng trao đổi nhu cầu và nhận tư vấn về dòng xe.

### Tương tác hiện có

- Lọc danh sách xe theo loại: xe tải, xe chữa cháy và xe cứu hộ.
- Tìm kiếm dòng xe theo tên, thương hiệu hoặc loại xe.
- Các nút điều hướng đến khu vực sản phẩm và tư vấn trên trang.
- Giao diện responsive cho desktop và thiết bị di động.

Danh sách xe và hình minh họa hiện là dữ liệu mẫu hiển thị trực tiếp trong giao diện. Website chưa kết nối cơ sở dữ liệu, quản trị kho xe, gửi biểu mẫu liên hệ hay hệ thống báo giá thực tế.

## Công nghệ

- [Next.js](https://nextjs.org) (App Router)
- React
- TypeScript
- Tailwind CSS

## Bắt đầu

Yêu cầu Node.js và npm đã được cài đặt. Từ thư mục `client`, cài dependencies và chạy máy chủ phát triển:

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem website. Thay đổi trong `app/` sẽ được cập nhật tự động.

## Các lệnh thường dùng

```bash
npm run dev    # Chạy máy chủ phát triển
npm run lint   # Kiểm tra ESLint
npm run build  # Tạo bản build production
npm run start  # Chạy bản build production
```

## Cấu trúc chính

```text
app/
  globals.css  # Kiểu dáng và responsive
  layout.tsx   # Layout gốc và metadata
  page.tsx     # Trang chủ và danh mục xe
public/        # Tài nguyên tĩnh
```

## Quy trình GitFlow

Dự án sử dụng GitFlow với `main` và `develop` là hai nhánh dài hạn:

- `main`: mã nguồn của phiên bản đã phát hành; gắn tag phiên bản, ví dụ `v1.0.0`.
- `develop`: nhánh tích hợp các tính năng cho phiên bản kế tiếp.
- `feature/*`: phát triển tính năng; tạo từ `develop`, gộp lại vào `develop`.
- `release/*`: ổn định phiên bản chuẩn bị phát hành; tạo từ `develop`, sau đó gộp vào cả `main` và `develop`.
- `hotfix/*`: sửa lỗi khẩn cấp trên phiên bản đang phát hành; tạo từ `main`, sau đó gộp vào cả `main` và `develop`.

### Phát triển tính năng

Tạo nhánh tính năng từ `develop`, làm việc và mở Pull Request trở lại `develop`:

```bash
git switch develop
git pull
git switch -c feature/vehicle-detail

# Sau khi thay đổi
npm run lint
npm run build
git add .
git commit -m "feat: add vehicle detail page"
git push -u origin feature/vehicle-detail
```

Đặt tên nhánh theo mục tiêu cụ thể, ví dụ `feature/vehicle-catalog`, `feature/contact-form` hoặc `fix/mobile-layout`. Xóa nhánh tính năng sau khi Pull Request được gộp.

### Chuẩn bị phát hành

Khi các tính năng cần thiết đã có trong `develop`, tạo nhánh phát hành để kiểm thử và chỉ sửa các lỗi cần cho phiên bản đó:

```bash
git switch develop
git pull
git switch -c release/1.0.0
```

Sau khi kiểm thử đạt yêu cầu:

1. Gộp `release/1.0.0` vào `main` và tạo tag `v1.0.0`.
2. Gộp `release/1.0.0` trở lại `develop` để giữ các thay đổi sửa lỗi phát hành.
3. Xóa nhánh release sau khi hoàn tất.

### Sửa lỗi khẩn cấp

Tạo nhánh hotfix từ `main`. Sau khi sửa và kiểm thử, gộp thay đổi vào cả `main` và `develop`, rồi tạo tag phiên bản vá, ví dụ `v1.0.1`:

```bash
git switch main
git pull
git switch -c hotfix/fix-contact-link
```

## Tài liệu Next.js

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
