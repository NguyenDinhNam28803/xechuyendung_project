"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch, errorMessage } from "../_lib/admin-api";
import { formatDate } from "../_lib/format";
import { describeUserAgent } from "../_lib/user-agent";
import type { AdminSession } from "../_lib/types";
import { Feedback } from "./ui";
import { useUiFeedback } from "./ui-feedback";


/**
 * Danh sách thiết bị đang đăng nhập.
 *  - mode "own": phiên của chính mình, đăng xuất từng thiết bị khác;
 *  - mode "user": phiên của tài khoản khác (quản trị viên), đăng xuất tất cả.
 */
export function SessionList({
  mode,
  userId,
  username,
}: {
  mode: "own" | "user";
  userId?: string;
  username?: string;
}) {
  const { toast, confirm } = useUiFeedback();
  const [sessions, setSessions] = useState<AdminSession[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const listPath = mode === "own" ? "/account/sessions" : `/users/${userId}/sessions`;

  /** Tăng lên để tải lại danh sách sau khi đăng xuất thiết bị. */
  const [version, setVersion] = useState(0);
  const load = useCallback(() => setVersion((current) => current + 1), []);

  useEffect(() => {
    let cancelled = false;
    adminFetch<AdminSession[]>(listPath)
      .then((next) => {
        if (cancelled) return;
        setSessions(next);
        setError("");
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(errorMessage(loadError));
      });
    return () => {
      cancelled = true;
    };
  }, [listPath, version]);

  async function revokeOne(session: AdminSession) {
    const accepted = await confirm({
      title: "Đăng xuất thiết bị này?",
      message: `${describeUserAgent(session.userAgent)} sẽ phải đăng nhập lại.`,
      confirmLabel: "Đăng xuất thiết bị",
      danger: true,
    });
    if (!accepted) return;
    setBusy(true);
    try {
      await adminFetch(`/account/sessions/${session.id}`, { method: "DELETE" });
      toast("Đã đăng xuất thiết bị.");
      load();
    } catch (revokeError) {
      toast(errorMessage(revokeError), "error");
    } finally {
      setBusy(false);
    }
  }

  async function revokeAll() {
    const accepted = await confirm({
      title: `Đăng xuất ${username ?? "tài khoản"} khỏi mọi thiết bị?`,
      message:
        "Dùng khi nghi ngờ lộ mật khẩu hoặc mất thiết bị. Tài khoản vẫn hoạt động và có thể đăng nhập lại.",
      confirmLabel: "Đăng xuất tất cả",
      danger: true,
    });
    if (!accepted) return;
    setBusy(true);
    try {
      const result = await adminFetch<{ revoked: number }>(`/users/${userId}/sessions/revoke`, {
        method: "POST",
      });
      toast(`Đã đăng xuất ${result.revoked} phiên.`);
      load();
    } catch (revokeError) {
      toast(errorMessage(revokeError), "error");
    } finally {
      setBusy(false);
    }
  }

  if (error) return <Feedback isError message={error} />;
  if (!sessions) return <p>Đang tải danh sách thiết bị...</p>;

  return (
    <div className="admin-session-panel">
      {sessions.length === 0 ? (
        <p className="admin-empty">Không có phiên đăng nhập nào đang hoạt động.</p>
      ) : (
        <ul className="admin-session-list">
          {sessions.map((session) => (
            <li className={session.current ? "is-current" : undefined} key={session.id}>
              <div>
                <strong>
                  {describeUserAgent(session.userAgent)}
                  {session.current ? " · thiết bị này" : ""}
                </strong>
                <small>
                  Đăng nhập {formatDate(session.createdAt)} · hoạt động gần nhất{" "}
                  {formatDate(session.lastSeenAt)} · hết hạn {formatDate(session.expiresAt)}
                </small>
              </div>
              {mode === "own" && !session.current && (
                <button
                  className="admin-table-button admin-table-danger"
                  disabled={busy}
                  onClick={() => void revokeOne(session)}
                  type="button"
                >
                  Đăng xuất
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {mode === "user" && sessions.length > 0 && (
        <button
          className="admin-danger-button"
          disabled={busy}
          onClick={() => void revokeAll()}
          type="button"
        >
          Đăng xuất khỏi mọi thiết bị
        </button>
      )}
    </div>
  );
}
