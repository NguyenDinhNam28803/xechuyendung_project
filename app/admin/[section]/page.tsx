import { Suspense } from "react";
import type { Metadata } from "next";
import AdminDashboard from "../admin-dashboard";
import "../admin.css";

const sections = [
  "vehicles",
  "articles",
  "policies",
  "regulations",
  "legal-guides",
  "contact-submissions",
  "activity",
];

export function generateStaticParams() {
  return [...sections].map((section) => ({ section }));
}

export const metadata: Metadata = {
  title: "Quản trị nội dung",
  robots: { index: false, follow: false },
};

export default function AdminSectionPage() {
  return (
    <Suspense
      fallback={<main className="admin-shell">Đang tải quản trị...</main>}
    >
      <AdminDashboard />
    </Suspense>
  );
}
