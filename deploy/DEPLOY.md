# Triển khai Xe Chuyên Dụng lên VPS

Hai ứng dụng chạy trên cùng một VPS, database dùng Supabase (PostgreSQL có sẵn):

```
Trình duyệt ──HTTPS──▶ Nginx :443 ──▶ Next.js 127.0.0.1:3000 ──▶ NestJS API 127.0.0.1:4000 ──TLS──▶ Supabase
```

- Trình duyệt chỉ nói chuyện với Next. API **không** mở ra Internet.
- Next gọi API phía server qua `CONTENT_API_URL`. Cookie phiên quản trị là HttpOnly và `Secure` khi `NODE_ENV=production`, nên **bắt buộc chạy HTTPS**. Nếu chạy HTTP thì đăng nhập admin sẽ không giữ được phiên.

## 0. Trước khi deploy (làm trên máy local)

1. **Gộp nhánh giao diện mới.** Thư mục `client-redesign` là git worktree của repo client, đang ở nhánh `redesign/homepage-taste`. Commit, merge vào `main` rồi push. VPS sẽ clone nhánh `main`.
2. **Push repo server** (có các thay đổi `HOST`, `DATABASE_SSL_CA`).
3. **Tải chứng chỉ CA của Supabase**: Dashboard → Project Settings → Database → SSL Configuration → *Download certificate* (`prod-ca-2021.crt`).
   - Thiếu file này mà vẫn đặt `DATABASE_SSL=true` thì API báo `SELF_SIGNED_CERT_IN_CHAIN` và không khởi động được (đã kiểm chứng).
   - Bỏ `DATABASE_SSL` thì kết nối VPS ↔ Supabase không được mã hóa.
4. **Đặt mật khẩu admin mạnh.** `ADMIN_USERNAME`/`ADMIN_PASSWORD` chỉ dùng để tạo tài khoản admin **đầu tiên** khi bảng `admin_users` còn trống. Nếu database Supabase đã có admin (do bạn tạo khi chạy local) thì hai biến này bị bỏ qua. Khi đó hãy đổi mật khẩu trong `/admin/account` sau khi đăng nhập.
5. `ADMIN_AUTH_SECRET` trong `server/.env` hiện tại **không được code dùng**, có thể bỏ.

## 1. Chuẩn bị VPS (Ubuntu 22.04/24.04)

Cấu hình tối thiểu: **2 vCPU, 2 GB RAM**. `next build` cần khoảng 1,5 GB, nên VPS 1 GB phải thêm swap.

```bash
# Người dùng riêng cho ứng dụng (không chạy bằng root)
sudo adduser --disabled-password deploy && sudo usermod -aG sudo deploy

# Swap 2 GB (bỏ qua nếu RAM >= 4 GB)
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Node.js 22 LTS (Next 16 cần >= 20.9; local đang chạy Node 24, cũng được)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git
sudo npm i -g pm2

# Firewall: chỉ mở SSH, HTTP, HTTPS. KHÔNG mở 3000/4000.
sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable
```

Trỏ DNS: bản ghi `A` của `ten-mien.vn` và `www.ten-mien.vn` về IP của VPS.

## 2. Lấy mã nguồn

```bash
sudo mkdir -p /var/www/xechuyendung && sudo chown deploy:deploy /var/www/xechuyendung
cd /var/www/xechuyendung
git clone https://github.com/NguyenDinhNam28803/xechuyendung_project_server.git server
git clone https://github.com/NguyenDinhNam28803/xechuyendung_project.git client
```

Nếu repo để private, tạo deploy key (`ssh-keygen`, thêm public key vào GitHub → Settings → Deploy keys) rồi clone bằng URL `git@github.com:...`.

## 3. API (NestJS)

```bash
cd /var/www/xechuyendung/server
mkdir -p certs && nano certs/supabase-ca.crt     # dán nội dung file CA đã tải ở bước 0.3
nano .env                                         # nội dung bên dưới
chmod 600 .env
npm ci
npm run build
npm run db:migrate        # an toàn khi chạy lại: chỉ chạy migration chưa có trong bảng schema_migrations
```

`server/.env`:

```env
NODE_ENV=production
PORT=4000
HOST=127.0.0.1
DATABASE_URL=postgresql://postgres.<project>:<mật-khẩu>@aws-1-eu-central-1.pooler.supabase.com:5432/postgres
DATABASE_SSL=true
DATABASE_SSL_CA=/var/www/xechuyendung/server/certs/supabase-ca.crt
# Bắt buộc: Next chạy cùng máy và chuyển IP thật của khách qua X-Forwarded-For.
TRUST_PROXY=loopback
ADMIN_USERNAME=<tên-đăng-nhập-admin>
ADMIN_PASSWORD=<mật-khẩu-mạnh-ít-nhất-16-ký-tự>
ACTIVITY_RETENTION_DAYS=365
```

| Biến | Bắt buộc | Ý nghĩa |
|---|---|---|
| `DATABASE_URL` | có | Chuỗi kết nối Supabase (Session pooler, cổng 5432). |
| `DATABASE_SSL` / `DATABASE_SSL_CA` | nên có | Mã hóa và kiểm tra chứng chỉ tới Supabase. |
| `TRUST_PROXY` | có | `loopback`. Đặt sai thì giới hạn tần suất áp lên cả site thay vì từng khách. |
| `HOST` | nên có | `127.0.0.1`: API chỉ nhận kết nối nội bộ. |
| `PORT` | không | Mặc định 4000; phải khớp `CONTENT_API_URL` của web. |
| `ADMIN_USERNAME`/`ADMIN_PASSWORD` | lần đầu | Chỉ tạo admin đầu tiên khi bảng còn trống. |
| `ACTIVITY_RETENTION_DAYS` | không | Tự xóa nhật ký hoạt động cũ (tối thiểu 30). |

## 4. Web (Next.js)

```bash
cd /var/www/xechuyendung/client
echo 'CONTENT_API_URL=http://127.0.0.1:4000/api/v1' > .env.production
npm ci
npm run build
```

Web chỉ cần một biến là `CONTENT_API_URL`. Trang chủ và danh mục xe đọc API khi build và khi chạy. Nếu API không gọi được, site dùng dữ liệu mẫu đóng gói sẵn chứ không báo lỗi, nên hãy kiểm tra log ở bước 7.

## 5. Chạy bằng PM2

```bash
pm2 start /var/www/xechuyendung/client/deploy/ecosystem.config.cjs
pm2 save
pm2 startup systemd -u deploy --hp /home/deploy   # chạy lệnh sudo mà PM2 in ra
pm2 status                                          # xe-api và xe-web phải "online"
```

## 6. Nginx + HTTPS

```bash
# 1) Lấy chứng chỉ TRƯỚC (cấu hình Nginx trỏ tới file chứng chỉ, chưa có thì nginx -t báo lỗi).
#    --standalone tạm dừng Nginx vài giây; hook được lưu lại nên lần gia hạn tự động cũng chạy đúng.
sudo apt-get install -y certbot
sudo certbot certonly --standalone -d TEN-MIEN-THAT -d www.TEN-MIEN-THAT \
  --pre-hook "systemctl stop nginx" --post-hook "systemctl start nginx"

# 2) Cài cấu hình site
sudo cp /var/www/xechuyendung/client/deploy/nginx.conf /etc/nginx/sites-available/xechuyendung
sudo sed -i 's/ten-mien.vn/TEN-MIEN-THAT/g' /etc/nginx/sites-available/xechuyendung
sudo ln -s /etc/nginx/sites-available/xechuyendung /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# 3) Thử gia hạn (không đổi gì thật)
sudo certbot renew --dry-run
```

Hai dòng **không được bỏ** trong `nginx.conf`: `proxy_set_header X-Real-IP $remote_addr;` và `proxy_set_header X-Forwarded-Host $host;`. Dòng đầu cho giới hạn tần suất theo từng khách. Dòng sau phục vụ kiểm tra CSRF của trang quản trị.

## 7. Kiểm tra sau khi deploy

```bash
curl -s http://127.0.0.1:4000/health/ready            # {"status":"ready","checks":{"database":"ok"}}
curl -s http://127.0.0.1:4000/api/v1/vehicles | head -c 200
curl -sI https://TEN-MIEN-THAT/ | head -1               # HTTP/2 200
curl -sI https://TEN-MIEN-THAT/xe | head -1
curl -s -o /dev/null -w '%{http_code}\n' http://<IP-VPS>:4000/health/live   # phải bị chặn (timeout/000)
pm2 logs xe-web --lines 50 | grep -i "Content API is unavailable"           # không được có dòng nào
```

Kiểm tra thủ công trên trình duyệt:

- [ ] `/`, `/xe`, một trang `/xe/<slug>`, `/tin-tuc`, `/lien-he` hiển thị đúng, ảnh xe tải được.
- [ ] Gửi một yêu cầu ở `/lien-he`, sau đó thấy yêu cầu đó trong `/admin/contact-submissions`.
- [ ] Đăng nhập `/admin`, F5 vẫn còn phiên, đăng xuất được.
- [ ] Menu trên điện thoại mở/đóng được.

## 8. Cập nhật phiên bản mới

```bash
cd /var/www/xechuyendung/server && git pull && npm ci && npm run build && npm run db:migrate && pm2 restart xe-api
cd /var/www/xechuyendung/client && git pull && npm ci && npm run build && pm2 restart xe-web
```

`next build` chạy song song với bản đang phục vụ. Nếu build lỗi, bản cũ vẫn chạy: chỉ `pm2 restart` khi build thành công. Để quay lại bản trước: `git checkout <commit-cũ>`, build lại, rồi restart.

## Lưu ý đã biết

- **Đường dẫn ảnh xe trong database** có dạng `/_next/static/media/<tên>.<hash>.png`, được sinh từ ảnh trong `app/assets`. Hash phụ thuộc nội dung file. Hiện tại 34/34 ảnh trong DB khớp bản build, nhưng nếu thay file ảnh hoặc nâng cấp Next làm đổi cách hash, ảnh sẽ vỡ. Lâu dài nên chuyển ảnh sang `public/` với đường dẫn cố định, hoặc dùng Supabase Storage.
- **Chưa có tên miền chính thức**: thẻ `canonical` và ảnh chia sẻ `og:image` của trang chủ đang để chú thích chờ (`app/_home/document.ts`).
- **Sao lưu database**: Supabase gói Free không có backup tự động theo ngày. Nên định kỳ chạy `pg_dump "$DATABASE_URL" > backup-$(date +%F).sql` (cron) hoặc nâng gói.
- **Font chữ** tải từ Google Fonts. Nếu cần chạy không phụ thuộc bên ngoài thì tự host file font Archivo.
