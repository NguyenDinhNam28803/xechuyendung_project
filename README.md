# Xe Chuyên Dụng

Website giới thiệu xe tải và xe chuyên dụng, giúp khách hàng tìm dòng xe theo công năng, xem thông tin tham khảo và chuẩn bị yêu cầu tư vấn.

> Dự án hiện là bản giao diện mẫu. Danh mục xe và bài viết là dữ liệu tĩnh để minh họa; form liên hệ chưa gửi hoặc lưu thông tin. Cần xác nhận thông tin doanh nghiệp, xe, chính sách và tích hợp kênh tiếp nhận yêu cầu trước khi công khai.

## Nội dung và chức năng

- Trang chủ giới thiệu các nhóm xe, hướng dẫn và lối vào trang liên hệ.
- Danh mục xe hỗ trợ lọc theo loại và tìm kiếm theo tên, hãng hoặc mô tả; truy cập trực tiếp theo danh mục qua tham số URL.
- Trang chi tiết cho mỗi xe, có thông tin đã biết, công năng, lưu ý và đường dẫn tư vấn gắn với xe đang xem.
- Trang liên hệ riêng với form mẫu, kiểm tra trường bắt buộc và hiển thị trạng thái rõ ràng. Form không gửi dữ liệu đến máy chủ.
- Các trang giới thiệu, dịch vụ, hướng dẫn mua xe, kiến thức/bài viết và trạng thái chính sách.
- Giao diện responsive, điều hướng dùng Next.js Link và các trang dữ liệu mẫu được render tĩnh khi có thể.

### Các trang

| Đường dẫn | Nội dung |
| --- | --- |
| `/` | Trang chủ |
| `/xe` | Danh mục xe |
| `/xe/[slug]` | Chi tiết xe |
| `/lien-he` | Form yêu cầu tư vấn (bản mẫu, chưa gửi) |
| `/gioi-thieu` | Định hướng giới thiệu dự án |
| `/dich-vu` | Các bước tư vấn tham khảo |
| `/tu-van-mua-xe` | Checklist chuẩn bị khi tìm mua xe |
| `/tin-tuc` | Danh sách bài viết kiến thức |
| `/tin-tuc/[slug]` | Chi tiết bài viết |
| `/chinh-sach` | Trạng thái các nội dung chính sách cần xác nhận |

## Dữ liệu và thông tin cần xác nhận

Danh mục hiện minh họa ba dòng: FAW J6L thùng bạt 2 tầng, xe chữa cháy Isuzu 4 khối và xe cứu hộ Foton 2 chức năng. Thông tin sản phẩm đang khai báo tại `app/data/vehicles.ts`; bài viết tại `app/data/articles.ts`.

Trước khi đưa website vào hoạt động, cần:

1. Xác nhận tên pháp nhân, địa chỉ, hotline, email, giờ làm việc, showroom và các kênh mạng xã hội.
2. Thay dữ liệu minh họa bằng danh sách xe, ảnh, phiên bản và thông số đã được doanh nghiệp kiểm duyệt.
3. Xác nhận phạm vi dịch vụ, báo giá, tình trạng hàng, giao nhận, bảo hành, thanh toán và hồ sơ pháp lý.
4. Kết nối form liên hệ với API hoặc dịch vụ nhận yêu cầu, bổ sung xử lý thành công/lỗi và chính sách quyền riêng tư trước khi thu thập dữ liệu.
5. Chỉ nhúng bản đồ, số điện thoại hoặc liên kết mạng xã hội sau khi có thông tin chính thức.

Không sử dụng nội dung tham khảo trên website khác làm thông tin doanh nghiệp của dự án. Các bài kiến thức chỉ mang tính định hướng; thông số và quy định cần được xác minh theo xe và thời điểm thực tế.

## Công nghệ

- Next.js App Router
- React
- TypeScript
- Tailwind CSS và CSS tùy chỉnh

## Bắt đầu

Yêu cầu Node.js và npm. Từ thư mục `client`:

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Lệnh thường dùng

```bash
npm run dev    # Máy chủ phát triển
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
  lien-he/              # Trang liên hệ
  gioi-thieu/           # Trang giới thiệu
  dich-vu/               # Trang dịch vụ
  tu-van-mua-xe/         # Hướng dẫn chọn xe
  tin-tuc/               # Danh sách và bài viết [slug]
  chinh-sach/            # Trạng thái thông tin chính sách
  globals.css            # Design system và responsive
  layout.tsx             # Layout gốc và metadata
  page.tsx               # Trang chủ
public/                  # Tài nguyên tĩnh
```

## Quy trình GitFlow

Hai nhánh dài hạn:

- `main`: mã nguồn phiên bản đã phát hành; gắn tag như `v1.0.0`.
- `develop`: nhánh tích hợp tính năng cho bản phát hành tiếp theo.

Các nhánh công việc:

- `feature/*`: tạo từ `develop`, mở Pull Request về `develop`.
- `release/*`: tạo từ `develop`; sau khi ổn định, gộp vào `main` và `develop`.
- `hotfix/*`: tạo từ `main`; sau khi sửa lỗi khẩn cấp, gộp vào cả `main` và `develop`.

Ví dụ bắt đầu một tính năng:

```bash
git switch develop
git pull
git switch -c feature/vehicle-catalog

# Sau khi thay đổi
npm run lint
npm run build
git add .
git commit -m "feat: add vehicle catalog"
git push -u origin feature/vehicle-catalog
```

Không gộp nhánh feature trực tiếp vào `main`. Chỉ phát hành qua quy trình release đã được nhóm xác nhận.

## Tài liệu

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
