import type { Metadata } from "next";
import AdminDashboard from "./admin-dashboard";
import "./admin.css";

export const metadata: Metadata = {
  title: "Quản trị nội dung",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
