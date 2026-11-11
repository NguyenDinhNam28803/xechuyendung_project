"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { adminFetch, errorMessage, jsonBody } from "../_lib/admin-api";
import { safeNextPath } from "../_lib/safe-next-path";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await adminFetch("/session/login", {
        method: "POST",
        body: jsonBody({ username, password }),
      });
      setPassword("");
      router.replace(safeNextPath(searchParams.get("next")));
    } catch (error) {
      setMessage(errorMessage(error));
      setSaving(false);
    }
  }

  return (
    <main className="admin-shell admin-login-shell">
      <form className="admin-card admin-login" onSubmit={submit}>
        <span className="admin-eyebrow">XE CHUYÊN DỤNG</span>
        <h1>Đăng nhập quản trị</h1>
        <p>Mỗi người dùng tài khoản riêng do quản trị viên cấp.</p>
        <label>
          Tên đăng nhập
          <input
            autoComplete="username"
            onChange={(event) => setUsername(event.target.value)}
            required
            value={username}
          />
        </label>
        <label>
          Mật khẩu
          <input
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        <button className="admin-primary-button" disabled={saving} type="submit">
          {saving ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
        {message && (
          <p className="admin-feedback admin-feedback-error" role="status">
            {message}
          </p>
        )}
      </form>
    </main>
  );
}
