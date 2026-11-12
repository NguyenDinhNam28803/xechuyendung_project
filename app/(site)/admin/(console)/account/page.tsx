import type { Metadata } from "next";
import { AccountSection } from "../../_components/sections/account-section";

export const metadata: Metadata = { title: "Đổi mật khẩu · Quản trị" };

export default function Page() {
  return <AccountSection />;
}
