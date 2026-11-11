import type { Metadata } from "next";
import { OverviewSection } from "../_components/sections/overview-section";

export const metadata: Metadata = { title: "Tổng quan · Quản trị" };

export default function Page() {
  return <OverviewSection />;
}
