import type { Metadata } from "next";
import Link from "next/link";
import "./(public)/public.css";

export const metadata: Metadata = {
  title: "Không tìm thấy trang · Xe Chuyên Dụng",
  robots: { index: false },
};

/** 404 cho URL không khớp route nào (app có nhiều root layout nên cần trang 404 dùng chung). */
export default function GlobalNotFound() {
  return (
    <html lang="vi" data-type="product" data-radius="soft" data-buttons="solid">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- cùng nguồn font với các trang khác */}
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..600&display=swap"
          rel="stylesheet"
        />
        {/* eslint-disable-next-line @next/next/no-css-tags -- kit CSS tĩnh dùng chung với trang chủ */}
        <link rel="stylesheet" href="/assets/system.css" precedence="kit" />
      </head>
      <body>
        <main className="section pg-404">
          <div className="wrap section-head">
            <p className="t-label muted">Lỗi 404</p>
            <h1>Không tìm thấy trang</h1>
            <p>Đường dẫn không tồn tại hoặc đã được chuyển.</p>
            <div className="btn-row">
              <Link className="btn btn--primary" href="/xe">Xem danh mục xe</Link>
              <Link className="btn btn--secondary" href="/">Về trang chủ</Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
