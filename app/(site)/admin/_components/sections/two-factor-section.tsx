"use client";

import { useRouter, useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { adminFetch, errorMessage, jsonBody } from "../../_lib/admin-api";
import { formatDate } from "../../_lib/format";
import type { TwoFactorSetup, TwoFactorStatus } from "../../_lib/types";
import { useAdminSession } from "../session-context";
import { FormError } from "../ui";
import { useUiFeedback } from "../ui-feedback";

/** Còn ít hơn hoặc bằng số mã này thì nhắc tạo bộ mới. */
const lowRecoveryCodes = 3;

/**
 * Xác thực hai lớp (TOTP) của chính tài khoản đang đăng nhập:
 *  - chưa bật: quét QR (hoặc nhập khóa) → nhập mã 6 số → nhận 10 mã khôi phục;
 *  - đã bật: xem số mã khôi phục còn lại, tạo bộ mới, tắt (nếu vai trò cho phép).
 * Trang này dùng được cả khi phiên đang bị hạn chế vì chưa đăng ký 2FA.
 */
export function TwoFactorSection() {
  const { user, setupRequired, refresh, logout } = useAdminSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const recovered = searchParams.get("recovered");
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [loadError, setLoadError] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);

  const load = useCallback(
    () =>
      adminFetch<TwoFactorStatus>("/account/2fa").then(
        (result) => {
          setStatus(result);
          setLoadError("");
        },
        (error: unknown) => setLoadError(errorMessage(error)),
      ),
    [],
  );

  useEffect(() => {
    let cancelled = false;
    adminFetch<TwoFactorStatus>("/account/2fa").then(
      (result) => {
        if (!cancelled) setStatus(result);
      },
      (error: unknown) => {
        if (!cancelled) setLoadError(errorMessage(error));
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  async function finishRecoveryCodes() {
    setRecoveryCodes(null);
    if (setupRequired) {
      // Server đã gỡ hạn chế cho phiên hiện tại; tải lại phiên rồi vào trang chính.
      await refresh();
      router.replace("/admin");
      return;
    }
    await Promise.all([refresh(), load()]);
  }

  if (recoveryCodes) {
    return (
      <RecoveryCodesPanel
        codes={recoveryCodes}
        onDone={finishRecoveryCodes}
        username={user.username}
      />
    );
  }

  return (
    <section className="admin-card admin-editor admin-two-factor">
      {setupRequired && (
        <div className="admin-feedback admin-feedback-warning" role="status">
          <strong>Bạn cần bật xác thực hai lớp để tiếp tục.</strong> Vai trò của bạn
          bắt buộc dùng 2FA. Các trang quản trị khác sẽ mở sau khi bạn hoàn tất.
          <button className="admin-link-button" onClick={() => void logout()} type="button">
            Đăng xuất
          </button>
        </div>
      )}
      {recovered !== null && /^\d+$/.test(recovered) && (
        <div
          className={`admin-feedback ${Number(recovered) <= lowRecoveryCodes ? "admin-feedback-warning" : ""}`}
          role="status"
        >
          Bạn vừa đăng nhập bằng mã khôi phục, còn lại <strong>{recovered}</strong> mã.
          Nếu đã mất điện thoại, hãy tạo bộ mã khôi phục mới ngay khi có thể, hoặc
          nhờ quản trị viên đặt lại 2FA để đăng ký thiết bị mới.
        </div>
      )}
      {loadError && <FormError message={loadError} />}
      {!status && !loadError && <p>Đang tải trạng thái xác thực hai lớp...</p>}
      {status && !status.enabled && (
        <Enrollment onEnrolled={setRecoveryCodes} />
      )}
      {status?.enabled && (
        <EnabledPanel
          onChanged={load}
          onRecoveryCodes={setRecoveryCodes}
          status={status}
        />
      )}
    </section>
  );
}

function Enrollment({ onEnrolled }: { onEnrolled: (codes: string[]) => void }) {
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [qr, setQr] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function start() {
    setSaving(true);
    setError("");
    try {
      const result = await adminFetch<TwoFactorSetup>("/account/2fa/setup", {
        method: "POST",
      });
      // QR vẽ ngay trên trình duyệt; khóa bí mật không đi qua dịch vụ bên ngoài.
      const svg = await QRCode.toString(result.otpauthUri, {
        type: "svg",
        margin: 1,
        errorCorrectionLevel: "M",
      });
      setQr(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
      setSetup(result);
    } catch (startError) {
      setError(errorMessage(startError));
    } finally {
      setSaving(false);
    }
  }

  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const result = await adminFetch<{ recoveryCodes: string[] }>(
        "/account/2fa/confirm",
        { method: "POST", body: jsonBody({ code }) },
      );
      onEnrolled(result.recoveryCodes);
    } catch (confirmError) {
      setError(errorMessage(confirmError));
      setCode("");
      setSaving(false);
    }
  }

  if (!setup) {
    return (
      <div>
        <h2>Bật xác thực hai lớp</h2>
        <p className="admin-form-note">
          Ngoài mật khẩu, mỗi lần đăng nhập bạn sẽ nhập thêm mã 6 số đổi mỗi 30 giây
          từ ứng dụng xác thực trên điện thoại (Google Authenticator, Microsoft
          Authenticator, 1Password...). Kẻ gian biết mật khẩu cũng không vào được
          nếu không có điện thoại của bạn.
        </p>
        <FormError message={error} />
        <div className="admin-form-actions">
          <button
            className="admin-primary-button"
            disabled={saving}
            onClick={() => void start()}
            type="button"
          >
            {saving ? "Đang chuẩn bị..." : "Bắt đầu thiết lập"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={confirm}>
      <h2>Bật xác thực hai lớp</h2>
      <ol className="admin-two-factor-steps">
        <li>
          <p>
            <strong>Quét mã QR</strong> bằng ứng dụng xác thực trên điện thoại.
          </p>
          <div className="admin-two-factor-qr">
            {/* eslint-disable-next-line @next/next/no-img-element -- ảnh SVG tạo tại chỗ, không cần tối ưu */}
            <img alt="Mã QR để thêm tài khoản vào ứng dụng xác thực" height={200} src={qr} width={200} />
          </div>
          <details>
            <summary>Không quét được? Nhập khóa thủ công</summary>
            <p>
              Chọn &quot;Nhập khóa thiết lập&quot; trong ứng dụng, loại khóa{" "}
              <strong>theo thời gian</strong>, rồi nhập:
            </p>
            <code aria-label="Khóa thiết lập" className="admin-two-factor-secret">
              {setup.secret.match(/.{1,4}/g)?.join(" ")}
            </code>
          </details>
        </li>
        <li>
          <p>
            <strong>Nhập mã 6 số</strong> ứng dụng hiển thị để xác nhận.
          </p>
          <label>
            Mã xác thực
            <input
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
              pattern="\d{6}"
              placeholder="123456"
              required
              value={code}
            />
          </label>
        </li>
      </ol>
      <p className="admin-form-note">
        Mã thiết lập có hiệu lực {Math.round(setup.expiresIn / 60)} phút. Sau khi xác
        nhận, các thiết bị khác đang đăng nhập tài khoản này sẽ bị đăng xuất.
      </p>
      <FormError message={error} />
      <div className="admin-form-actions">
        <button className="admin-primary-button" disabled={saving} type="submit">
          {saving ? "Đang xác nhận..." : "Xác nhận và bật 2FA"}
        </button>
      </div>
    </form>
  );
}

function EnabledPanel({
  status,
  onChanged,
  onRecoveryCodes,
}: {
  status: TwoFactorStatus;
  onChanged: () => Promise<void>;
  onRecoveryCodes: (codes: string[]) => void;
}) {
  const { toast } = useUiFeedback();
  const [regenCode, setRegenCode] = useState("");
  const [disableForm, setDisableForm] = useState({ password: "", code: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const low = status.recoveryCodesRemaining <= lowRecoveryCodes;

  async function regenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const result = await adminFetch<{ recoveryCodes: string[] }>(
        "/account/2fa/recovery-codes",
        { method: "POST", body: jsonBody({ code: regenCode }) },
      );
      setRegenCode("");
      onRecoveryCodes(result.recoveryCodes);
    } catch (regenError) {
      setError(errorMessage(regenError));
      setRegenCode("");
    } finally {
      setSaving(false);
    }
  }

  async function disable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await adminFetch("/account/2fa/disable", {
        method: "POST",
        body: jsonBody(disableForm),
      });
      setDisableForm({ password: "", code: "" });
      toast("Đã tắt xác thực hai lớp.");
      await onChanged();
    } catch (disableError) {
      setError(errorMessage(disableError));
      setDisableForm((form) => ({ ...form, code: "" }));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h2>Xác thực hai lớp đang bật</h2>
      <dl className="admin-two-factor-summary">
        <div>
          <dt>Bật từ</dt>
          <dd>{formatDate(status.enabledAt)}</dd>
        </div>
        <div>
          <dt>Mã khôi phục còn lại</dt>
          <dd className={low ? "admin-two-factor-low" : undefined}>
            {status.recoveryCodesRemaining} / 10
          </dd>
        </div>
      </dl>
      {low && (
        <p className="admin-feedback admin-feedback-warning" role="status">
          Bạn sắp hết mã khôi phục. Hãy tạo bộ mã mới để không bị khóa ngoài khi mất
          điện thoại.
        </p>
      )}
      <FormError message={error} />

      <form className="admin-two-factor-action" onSubmit={regenerate}>
        <h3>Tạo bộ mã khôi phục mới</h3>
        <p className="admin-form-note">
          Bộ mã cũ mất hiệu lực ngay. Nhập mã 6 số hiện tại từ ứng dụng xác thực.
        </p>
        <div className="admin-two-factor-inline">
          <label>
            Mã xác thực
            <input
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              onChange={(event) => setRegenCode(event.target.value.replace(/\D/g, ""))}
              pattern="\d{6}"
              required
              value={regenCode}
            />
          </label>
          <button className="admin-secondary-button" disabled={saving} type="submit">
            Tạo mã mới
          </button>
        </div>
      </form>

      {status.required ? (
        <p className="admin-form-note">
          Vai trò của bạn bắt buộc dùng xác thực hai lớp nên không thể tắt. Nếu mất
          điện thoại và hết mã khôi phục, hãy nhờ một quản trị viên khác đặt lại 2FA.
        </p>
      ) : (
        <form className="admin-two-factor-action" onSubmit={disable}>
          <h3>Tắt xác thực hai lớp</h3>
          <div className="admin-two-factor-inline">
            <label>
              Mật khẩu hiện tại
              <input
                autoComplete="current-password"
                onChange={(event) =>
                  setDisableForm((form) => ({ ...form, password: event.target.value }))
                }
                required
                type="password"
                value={disableForm.password}
              />
            </label>
            <label>
              Mã xác thực
              <input
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                onChange={(event) =>
                  setDisableForm((form) => ({
                    ...form,
                    code: event.target.value.replace(/\D/g, ""),
                  }))
                }
                pattern="\d{6}"
                required
                value={disableForm.code}
              />
            </label>
            <button className="admin-danger-button" disabled={saving} type="submit">
              Tắt 2FA
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/** Hiển thị mã khôi phục đúng một lần; người dùng phải xác nhận đã lưu. */
function RecoveryCodesPanel({
  codes,
  username,
  onDone,
}: {
  codes: string[];
  username: string;
  onDone: () => Promise<void>;
}) {
  const { toast } = useUiFeedback();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const text = [
    `Mã khôi phục xác thực hai lớp - tài khoản ${username}`,
    "Mỗi mã chỉ dùng được một lần. Cất ở nơi an toàn, không chia sẻ.",
    "",
    ...codes,
    "",
  ].join("\n");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      toast("Đã sao chép mã khôi phục.");
    } catch {
      toast("Trình duyệt không cho sao chép. Hãy tải file hoặc chép tay.", "error");
    }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `ma-khoi-phuc-2fa-${username}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="admin-card admin-editor admin-two-factor">
      <h2>Lưu mã khôi phục</h2>
      <p className="admin-form-note">
        Dùng một trong các mã này để đăng nhập khi mất điện thoại. Mỗi mã chỉ dùng
        được một lần. <strong>Đây là lần duy nhất các mã được hiển thị.</strong>
      </p>
      <ol aria-label="Mã khôi phục" className="admin-recovery-codes">
        {codes.map((code) => (
          <li key={code}>
            <code>{code}</code>
          </li>
        ))}
      </ol>
      <div className="admin-form-actions admin-two-factor-inline">
        <button className="admin-secondary-button" onClick={() => void copy()} type="button">
          Sao chép
        </button>
        <button className="admin-secondary-button" onClick={download} type="button">
          Tải file .txt
        </button>
      </div>
      <label className="admin-checkbox">
        <input
          checked={saved}
          onChange={(event) => setSaved(event.target.checked)}
          type="checkbox"
        />
        Tôi đã lưu các mã khôi phục ở nơi an toàn
      </label>
      <div className="admin-form-actions">
        <button
          className="admin-primary-button"
          disabled={!saved || busy}
          onClick={() => {
            setBusy(true);
            void onDone().finally(() => setBusy(false));
          }}
          type="button"
        >
          Tiếp tục
        </button>
      </div>
    </section>
  );
}
