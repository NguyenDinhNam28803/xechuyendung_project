import type { Metadata } from "next";
import { ActivitySection } from "../../_components/sections/activity-section";

export const metadata: Metadata = { title: "Lịch sử hoạt động · Quản trị" };

export default function Page() {
  return <ActivitySection />;
}
