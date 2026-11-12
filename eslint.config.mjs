import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "server/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Bộ kit của skill design-taste-frontend, chép nguyên bản (skill cấm sửa file kit).
    "public/assets/**",
  ]),
]);

export default eslintConfig;
