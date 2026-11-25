import { cookies } from "next/headers";
import {
  challengeCookie,
  challengeCookieOptions,
  isRecord,
  sessionCookie,
  sessionCookieOptions,
} from "./admin-backend";

/**
 * Kết quả đăng nhập NestJS trả về (bước 1 hoặc bước 2), dùng chung cho route
 * /session/login và /session/login/verify.
 */
type LoginSession = {
  accessToken: string;
  expiresIn: number;
  twoFactorSetupRequired?: boolean;
  recoveryCodesRemaining?: number;
  user?: unknown;
};

type LoginChallenge = {
  mfaRequired: true;
  challengeToken: string;
  expiresIn: number;
};

export function isLoginSession(value: unknown): value is LoginSession {
  return (
    isRecord(value) &&
    typeof value.accessToken === "string" &&
    typeof value.expiresIn === "number"
  );
}

export function isLoginChallenge(value: unknown): value is LoginChallenge {
  return (
    isRecord(value) &&
    value.mfaRequired === true &&
    typeof value.challengeToken === "string" &&
    typeof value.expiresIn === "number"
  );
}

/**
 * Lưu token phiên vào cookie HttpOnly, xóa mã thử thách (nếu có) và chỉ trả
 * về trình duyệt những gì giao diện cần hiển thị, không bao giờ trả token.
 */
export async function completeSession(result: LoginSession) {
  const cookieStore = await cookies();
  cookieStore.set(
    sessionCookie,
    result.accessToken,
    sessionCookieOptions(result.expiresIn),
  );
  cookieStore.set(challengeCookie, "", challengeCookieOptions(0));
  return Response.json({
    ok: true,
    user: result.user,
    twoFactorSetupRequired: result.twoFactorSetupRequired === true,
    ...(typeof result.recoveryCodesRemaining === "number"
      ? { recoveryCodesRemaining: result.recoveryCodesRemaining }
      : {}),
  });
}

/** Bước 1 xong, cần mã 2FA: giữ mã thử thách trong cookie HttpOnly. */
export async function startChallenge(result: LoginChallenge) {
  const cookieStore = await cookies();
  cookieStore.set(
    challengeCookie,
    result.challengeToken,
    challengeCookieOptions(result.expiresIn),
  );
  // Một phiên cũ (nếu còn) không còn ý nghĩa khi người dùng đang đăng nhập lại.
  cookieStore.set(sessionCookie, "", sessionCookieOptions(0));
  return Response.json({ mfaRequired: true, expiresIn: result.expiresIn });
}
