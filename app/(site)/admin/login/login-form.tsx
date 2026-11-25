"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  AdminApiError,
  adminFetch,
  errorMessage,
  jsonBody,
  twoFactorSetupPath,
} from "../_lib/admin-api";
import { safeNextPath } from "../_lib/safe-next-path";

type LoginResult =
  | { mfaRequired: true; expiresIn: number }
  | {
      ok: true;
      twoFactorSetupRequired: boolean;
      recoveryCodesRemaining?: number;
    };

type Step = "password" | "code";

/**
 * Đăng nhập hai bước:
 *  1. tên đăng nhập + mật khẩu;
 *  2. (tài khoản đã bật 2FA) mã 6 số từ ứng dụng xác thực, hoặc mã khôi phục.
 * Mã thử thách giữa hai bước nằm trong cookie HttpOnly do BFF giữ, giao diện
 * không biết và không cần biết nó.
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("password");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [useRecovery, setUseRecovery] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const codeInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "code") codeInput.current?.focus();
  }, [step, useRecovery]);

  function finish(result: Exclude<LoginResult, { mfaRequired: true }>) {
    setPassword("");
    setCode("");
    if (result.twoFactorSetupRequired) {
      router.replace(twoFactorSetupPath);
    } else if (result.recoveryCodesRemaining !== undefined) {
      // Vừa dùng mã khôi phục: thường là mất điện thoại, đưa tới trang 2FA để
      // người dùng thấy số mã còn lại và tạo bộ mới.
      router.replace(`${twoFactorSetupPath}?recovered=${result.recoveryCodesRemaining}`);
    } else {
      router.replace(safeNextPath(searchParams.get("next")));
    }
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const result = await adminFetch<LoginResult>("/session/login", {
        method: "POST",
        body: jsonBody({ username, password }),
      });
      if ("mfaRequired" in result) {
        setPassword("");
        setStep("code");
        setSaving(false);
        return;
      }
      finish(result);
    } catch (error) {
      setMessage(errorMessage(error));
      setSaving(false);
    }
  }

  async function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const result = await adminFetch<LoginResult>("/session/login/verify", {
        method: "POST",
        body: jsonBody(useRecovery ? { recoveryCode: code } : { code }),
      });
      if ("mfaRequired" in result) throw new Error("Phản hồi đăng nhập không hợp lệ.");
      finish(result);
    } catch (error) {
      setCode("");
      if (error instanceof AdminApiError && error.code === "CHALLENGE_EXPIRED") {
        backToPassword(error.message);
        return;
      }
      setMessage(errorMessage(error));
      setSaving(false);
    }
  }

  function backToPassword(notice = "") {
    setStep("password");
    setCode("");
    setUseRecovery(false);
    setSaving(false);
    setMessage(notice);
  }

  const feedback = message && (
    <p className="admin-feedback admin-feedback-error" role="status">
      {message}
    </p>
  );

  if (step === "code") {
    return (
      <main className="admin-shell admin-login-shell">
        <form className="admin-card admin-login" onSubmit={submitCode}>
          <span className="admin-eyebrow">XÁC THỰC HAI LỚP</span>
          <h1>Nhập mã xác thực</h1>
          <p>
            {useRecovery
              ? "Nhập một mã khôi phục bạn đã lưu khi bật xác thực hai lớp. Mỗi mã chỉ dùng được một lần."
              : `Mở ứng dụng xác thực (Google Authenticator, Microsoft Authenticator...) và nhập mã 6 số của tài khoản ${username}.`}
          </p>
          <label>
            {useRecovery ? "Mã khôi phục" : "Mã xác thực"}
            <input
              ref={codeInput}
              autoComplete="one-time-code"
              autoCapitalize="characters"
              inputMode={useRecovery ? "text" : "numeric"}
              maxLength={useRecovery ? 24 : 6}
              onChange={(event) =>
                setCode(
                  useRecovery
                    ? event.target.value
                    : event.target.value.replace(/\D/g, ""),
                )
              }
              pattern={useRecovery ? undefined : "\\d{6}"}
              placeholder={useRecovery ? "XXXX-XXXX-XXXX-XXXX" : "123456"}
              required
              spellCheck={false}
              value={code}
            />
          </label>
          <button className="admin-primary-button" disabled={saving} type="submit">
            {saving ? "Đang xác thực..." : "Xác nhận"}
          </button>
          {feedback}
          <div className="admin-login-links">
            <button
              className="admin-link-button"
              onClick={() => {
                setUseRecovery((value) => !value);
                setCode("");
                setMessage("");
              }}
              type="button"
            >
              {useRecovery ? "Dùng mã từ ứng dụng xác thực" : "Mất điện thoại? Dùng mã khôi phục"}
            </button>
            <button
              className="admin-link-button"
              onClick={() => backToPassword()}
              type="button"
            >
              Đăng nhập lại
            </button>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-shell admin-login-shell">
      <form className="admin-card admin-login" onSubmit={submitPassword}>
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
        {feedback}
      </form>
    </main>
  );
}
