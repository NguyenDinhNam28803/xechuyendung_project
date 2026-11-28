/**
 * Gọi API quản trị từ trình duyệt. Mọi request đi qua route handler cùng
 * origin của Next.js; token nằm trong cookie HttpOnly nên JavaScript phía
 * trình duyệt không bao giờ đọc được.
 */
export class AdminApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    /** Mã lỗi máy đọc được (ví dụ TWO_FACTOR_SETUP_REQUIRED), nếu server gửi. */
    readonly code?: string,
  ) {
    super(message);
  }
}

/** Phát khi phiên hết hạn/bị thu hồi để AdminSessionProvider chuyển về trang đăng nhập. */
export const sessionExpiredEvent = "admin-session-expired";

/**
 * Phát khi server từ chối vì vai trò bắt buộc 2FA mà tài khoản chưa đăng ký
 * (403 TWO_FACTOR_SETUP_REQUIRED), để chuyển người dùng tới trang thiết lập.
 */
export const twoFactorSetupRequiredEvent = "admin-2fa-setup-required";
export const twoFactorSetupRequiredCode = "TWO_FACTOR_SETUP_REQUIRED";
export const twoFactorSetupPath = "/admin/account/2fa";

export async function adminFetch<T = void>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = path.startsWith("/session/")
    ? `/api/admin${path}`
    : `/api/admin/content${path}`;
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    cache: "no-store",
  });
  const result: unknown =
    response.status === 204 ? undefined : await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && !path.startsWith("/session/login")) {
      window.dispatchEvent(new Event(sessionExpiredEvent));
    }
    const code =
      isRecord(result) && typeof result.code === "string" ? result.code : undefined;
    if (response.status === 403 && code === twoFactorSetupRequiredCode) {
      window.dispatchEvent(new Event(twoFactorSetupRequiredEvent));
    }
    const message =
      isRecord(result) && typeof result.message === "string"
        ? result.message
        : `Yêu cầu thất bại (${response.status}).`;
    throw new AdminApiError(message, response.status, code);
  }
  return result as T;
}

export function jsonBody(value: unknown): RequestInit["body"] {
  return JSON.stringify(value);
}

export function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Đã xảy ra lỗi khi xử lý yêu cầu.";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
