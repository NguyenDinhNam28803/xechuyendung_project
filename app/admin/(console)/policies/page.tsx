import type { Metadata } from "next";
import { LegalResourcesSection } from "../../_components/sections/legal-resources-section";

export const metadata: Metadata = { title: "Chính sách · Quản trị" };

export default function Page() {
  return <LegalResourcesSection resourceType="policy" />;
}
