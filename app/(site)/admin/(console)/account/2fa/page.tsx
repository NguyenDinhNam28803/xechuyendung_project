import type { Metadata } from "next";
import { Suspense } from "react";
import { TwoFactorSection } from "../../../_components/sections/two-factor-section";

export const metadata: Metadata = { title: "Xác thực hai lớp · Quản trị" };

export default function Page() {
  // TwoFactorSection đọc ?recovered= bằng useSearchParams nên cần Suspense.
  return (
    <Suspense fallback={<p>Đang tải...</p>}>
      <TwoFactorSection />
    </Suspense>
  );
}
