// Sinh kiểu dữ liệu TypeScript từ OpenAPI của server, chạy được trên mọi hệ
// điều hành (cú pháp ${VAR:-default} của shell không chạy trên Windows cmd).
//
// Thứ tự tìm spec: biến OPENAPI_SPEC (đường dẫn hoặc URL) → repo server đặt
// cạnh ../xechuyendung_project_server → ../server.
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const candidates = ["../xechuyendung_project_server/openapi.yaml", "../server/openapi.yaml"];
const spec = process.env.OPENAPI_SPEC || candidates.find((path) => existsSync(path));

if (!spec) {
  console.error(
    `Không tìm thấy openapi.yaml. Đặt OPENAPI_SPEC hoặc clone repo server vào một trong: ${candidates.join(", ")}`,
  );
  process.exit(1);
}

const result = spawnSync(
  "npx",
  ["--no-install", "openapi-typescript", spec, "-o", "app/lib/generated/api-schema.ts"],
  { stdio: "inherit", shell: process.platform === "win32" },
);
process.exit(result.status ?? 1);
