import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Đăng nhập quản trị" };

export default function LoginPage() {
  return (
    <Suspense
      fallback={<main className="admin-shell admin-login-shell">Đang tải...</main>}
    >
      <LoginForm />
    </Suspense>
  );
}
