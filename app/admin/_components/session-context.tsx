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
} from "../_lib/admin-api";
import type { AdminIdentity } from "../_lib/types";

type AdminSession = {
  user: AdminIdentity;
  isAdmin: boolean;
  logout: () => Promise<void>;
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
 * đăng nhập kèm đường dẫn để quay lại.
 */
export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminIdentity | null>(null);
  const [error, setError] = useState("");

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
  if (!user) {
    return (
      <main className="admin-shell">
        <p>Đang kiểm tra phiên quản trị...</p>
      </main>
    );
  }
  return (
    <SessionContext.Provider
      value={{ user, isAdmin: user.role === "admin", logout }}
    >
      {children}
    </SessionContext.Provider>
  );
}
