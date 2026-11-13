import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./public.css";

/*
 * Root layout của các trang public (trừ "/" do app/route.ts trả HTML tĩnh).
 * Dùng cùng bộ kit với trang chủ (public/assets/system.css + ui/cards.css, palette stone-blueprint,
 * chữ Archivo có đủ dấu tiếng Việt) để toàn site cùng một giao diện. Không nạp system.js:
 * script đó sửa DOM nên React hydrate sẽ lệch; phần menu điện thoại do SiteHeader (React) đảm nhận.
 * Không nạp globals.css cũ (chỉ còn trang quản trị trong (site) dùng).
 */
export const metadata: Metadata = {
  title: {
    default: "Xe Chuyên Dụng: xe tải và xe chuyên dụng cho doanh nghiệp",
    template: "%s · Xe Chuyên Dụng",
  },
  description:
    "Xe chữa cháy, xe cứu hộ, xe bồn và xe tải gắn cẩu, tư vấn cấu hình theo công việc và đối chiếu thông số với hồ sơ từng xe.",
  openGraph: { type: "website", locale: "vi_VN", siteName: "Xe Chuyên Dụng" },
};

export const viewport: Viewport = {
  themeColor: "#dfdedb",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" data-type="product" data-radius="soft" data-buttons="solid">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- cùng nguồn font với trang chủ tĩnh */}
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..600&display=swap"
          rel="stylesheet"
        />
        {/* eslint-disable-next-line @next/next/no-css-tags -- kit CSS tĩnh dùng chung với trang chủ */}
        <link rel="stylesheet" href="/assets/system.css" precedence="kit" />
        {/* eslint-disable-next-line @next/next/no-css-tags -- kit CSS tĩnh dùng chung với trang chủ */}
        <link rel="stylesheet" href="/assets/ui/cards.css" precedence="kit" />
      </head>
      <body>{children}</body>
    </html>
  );
}
