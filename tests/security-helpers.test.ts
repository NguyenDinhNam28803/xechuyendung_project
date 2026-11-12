/**
 * Kiểm thử các hàm bảo mật thuần của client (chạy bằng `npm test`,
 * dùng node:test và khả năng bỏ type TypeScript có sẵn của Node.js 22).
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { safeNextPath } from "../app/(site)/admin/_lib/safe-next-path.ts";
import { isSameOriginRequest } from "../app/lib/admin-backend.ts";
import { isAllowedPath } from "../app/lib/admin-paths.ts";

const id = "40f050b4-73d1-47f4-b832-c14246d039d4";

describe("safeNextPath (chống open redirect)", () => {
  it("giữ đường dẫn quản trị nội bộ", () => {
    assert.equal(safeNextPath("/admin/vehicles"), "/admin/vehicles");
    assert.equal(safeNextPath("/admin"), "/admin");
  });

  it("từ chối URL ngoài, protocol-relative và đường dẫn lạ", () => {
    for (const value of [
      "https://evil.example",
      "//evil.example",
      "/administrator",
      "/admin\\@evil.example",
      "/admin/login",
      null,
    ]) {
      assert.equal(safeNextPath(value), "/admin", String(value));
    }
  });
});

describe("isAllowedPath (whitelist proxy quản trị)", () => {
  it("cho phép các endpoint đã khai báo", () => {
    for (const path of [
      ["vehicles"],
      ["vehicles", id],
      ["users"],
      ["users", id],
      ["account", "password"],
      ["contact-submissions", "search"],
      ["contact-submissions", id, "status"],
      ["import-defaults"],
    ]) {
      assert.equal(isAllowedPath(path), true, path.join("/"));
    }
  });

  it("chặn đường dẫn ngoài whitelist hoặc id không phải UUID", () => {
    for (const path of [
      ["vehicles", "../auth"],
      ["vehicles", "not-a-uuid"],
      ["auth", "login"],
      ["users", id, "sessions"],
      ["account", "delete"],
      [],
    ]) {
      assert.equal(isAllowedPath(path), false, path.join("/"));
    }
  });
});

describe("isSameOriginRequest (chống CSRF)", () => {
  const request = (headers: Record<string, string>) =>
    new Request("http://localhost:3000/api/admin/content/vehicles", {
      method: "POST",
      headers,
    });

  it("chấp nhận Origin trùng host", () => {
    assert.equal(
      isSameOriginRequest(request({ host: "localhost:3000", origin: "http://localhost:3000" })),
      true,
    );
  });

  it("dùng X-Forwarded-Host khi chạy sau reverse proxy", () => {
    assert.equal(
      isSameOriginRequest(
        request({
          host: "app:3000",
          "x-forwarded-host": "xechuyendung.vn",
          origin: "https://xechuyendung.vn",
        }),
      ),
      true,
    );
  });

  it("từ chối Origin khác host hoặc Sec-Fetch-Site cross-site", () => {
    assert.equal(
      isSameOriginRequest(request({ host: "localhost:3000", origin: "https://evil.example" })),
      false,
    );
    assert.equal(
      isSameOriginRequest(request({ host: "localhost:3000", "sec-fetch-site": "cross-site" })),
      false,
    );
  });
});
