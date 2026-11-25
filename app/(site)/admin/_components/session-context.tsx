"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  AdminApiError,
  adminFetch,
  errorMessage,
  sessionExpiredEvent,
  twoFactorSetupPath,
  twoFactorSetupRequiredEvent,
} from "../_lib/admin-api";
import type { AdminIdentity } from "../_lib/types";

type AdminSession = {
  user: AdminIdentity;
  isAdmin: boolean;
  /**
   * Vai trò bắt buộc 2FA nhưng tài khoản chưa đăng ký: server chỉ cho dùng
   * trang thiết lập 2FA và đăng xuất, mọi trang khác bị chuyển về đó.
   */
  setupRequired: boolean;
  logout: () => Promise<void>;
  /** Tải lại thông tin phiên (ví dụ sau khi vừa bật 2FA). */
  refresh: () => Promise<void>;
};

const SessionContext = createContext<AdminSession | null>(null);

export function useAdminSession() {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error("useAdminSession must be used inside AdminSessionProvider.");
  }
  return session;
}

export function loginPath(nextPath: string) {
  return `/admin/login?next=${encodeURIComponent(nextPath)}`;
}

/**
 * Xác định người dùng hiện tại qua /auth/me. Khi chưa đăng nhập hoặc phiên bị
 * thu hồi (kể cả giữa chừng, khi một request bất kỳ trả 401), chuyển về trang
 * đăng nhập kèm đường dẫn để quay lại. Khi phiên bị hạn chế vì chưa đăng ký
 * 2FA (từ /auth/me hoặc một request trả 403 TWO_FACTOR_SETUP_REQUIRED), chuyển
 * tới trang thiết lập 2FA.
 */
export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminIdentity | null>(null);
  const [error, setError] = useState("");
  const setupRequired = user?.twoFactorSetupRequired === true;
  const onSetupPage = pathname === twoFactorSetupPath;

  useEffect(() => {
    let cancelled = false;
    adminFetch<AdminIdentity>("/session/me")
      .then((identity) => {
        if (!cancelled) setUser(identity);
      })
      .catch((loadError: unknown) => {
        if (cancelled) return;
        if (loadError instanceof AdminApiError && loadError.status === 401) {
          router.replace(loginPath(pathname));
        } else {
          setError(errorMessage(loadError));
        }
      });
    return () => {
      cancelled = true;
    };
    // Chỉ kiểm tra phiên một lần khi console được mở.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onExpired = () => router.replace(loginPath(window.location.pathname));
    window.addEventListener(sessionExpiredEvent, onExpired);
    return () => window.removeEventListener(sessionExpiredEvent, onExpired);
  }, [router]);

  useEffect(() => {
    if (setupRequired && !onSetupPage) router.replace(twoFactorSetupPath);
  }, [setupRequired, onSetupPage, router]);

  useEffect(() => {
    const onSetupRequired = () => {
      setUser((current) =>
        current ? { ...current, twoFactorSetupRequired: true } : current,
      );
    };
    window.addEventListener(twoFactorSetupRequiredEvent, onSetupRequired);
    return () =>
      window.removeEventListener(twoFactorSetupRequiredEvent, onSetupRequired);
  }, []);

  const refresh = useCallback(async () => {
    setUser(await adminFetch<AdminIdentity>("/session/me"));
  }, []);

  const logout = useCallback(async () => {
    await adminFetch("/session/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/admin/login");
  }, [router]);

  if (error) {
    return (
      <main className="admin-shell admin-login-shell">
        <p className="admin-feedback admin-feedback-error" role="alert">
          {error}
        </p>
      </main>
    );
  }
  if (!user || (setupRequired && !onSetupPage)) {
    return (
      <main className="admin-shell">
        <p>
          {user
            ? "Đang chuyển tới trang thiết lập xác thực hai lớp..."
            : "Đang kiểm tra phiên quản trị..."}
        </p>
      </main>
    );
  }
  return (
    <SessionContext.Provider
      value={{
        user,
        isAdmin: user.role === "admin",
        setupRequired,
        logout,
        refresh,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
