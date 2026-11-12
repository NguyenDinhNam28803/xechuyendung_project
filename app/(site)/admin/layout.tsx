import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./admin.css";
import "./admin-components.css";

export const metadata: Metadata = {
  title: "Quản trị nội dung",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
