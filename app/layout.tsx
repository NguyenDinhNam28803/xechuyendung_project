import type { Metadata } from "next";
import { Barlow_Condensed, Be_Vietnam_Pro, Geist_Mono } from "next/font/google";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Xe Chuyên Dụng | Xe tải và giải pháp vận tải",
  description:
    "Tìm hiểu các dòng xe tải, xe chữa cháy, xe cứu hộ và giải pháp xe chuyên dụng. Tư vấn cấu hình theo nhu cầu sử dụng.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${barlowCondensed.variable} ${beVietnamPro.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
