import type { Metadata } from "next";
import { UsersSection } from "../../_components/sections/users-section";

export const metadata: Metadata = { title: "Tài khoản quản trị · Quản trị" };

export default function Page() {
  return <UsersSection />;
}
