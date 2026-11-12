import type { Metadata } from "next";
import { ContactSubmissionsSection } from "../../_components/sections/contact-submissions-section";

export const metadata: Metadata = { title: "Yêu cầu liên hệ · Quản trị" };

export default function Page() {
  return <ContactSubmissionsSection />;
}
