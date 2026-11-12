import type { Metadata } from "next";
import Link from "next/link";
import "./(site)/globals.css";

export const metadata: Metadata = {
  title: "Không tìm thấy trang · Xe Chuyên Dụng",
  robots: { index: false },
};

/** 404 cho URL không khớp route nào (app có hai root layout nên cần trang 404 dùng chung). */
export default function GlobalNotFound() {
  return (
    <html lang="vi">
      <body>
        <main className="content-page" style={{ padding: "96px 24px", textAlign: "center" }}>
          <h1>Không tìm thấy trang</h1>
          <p>Đường dẫn không tồn tại hoặc đã được chuyển.</p>
          <p>
            <Link href="/">Về trang chủ</Link> · <Link href="/xe">Xem danh mục xe</Link>
          </p>
        </main>
      </body>
    </html>
  );
}
