import type { Metadata } from "next";
import { LegalResourcesSection } from "../../_components/sections/legal-resources-section";

export const metadata: Metadata = { title: "Tìm hiểu pháp lý · Quản trị" };

export default function Page() {
  return <LegalResourcesSection resourceType="legal_guide" />;
}
