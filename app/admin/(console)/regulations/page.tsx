import type { Metadata } from "next";
import { LegalResourcesSection } from "../../_components/sections/legal-resources-section";

export const metadata: Metadata = { title: "Quy định · Quản trị" };

export default function Page() {
  return <LegalResourcesSection resourceType="regulation" />;
}
