import type { Metadata } from "next";
import { VehiclesSection } from "../../_components/sections/vehicles-section";

export const metadata: Metadata = { title: "Xe · Quản trị" };

export default function Page() {
  return <VehiclesSection />;
}
