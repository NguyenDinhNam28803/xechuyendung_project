import type { Metadata } from "next";
import { VehicleCategoriesSection } from "../../_components/sections/vehicle-categories-section";

export const metadata: Metadata = { title: "Danh mục xe · Quản trị" };

export default function Page() {
  return <VehicleCategoriesSection />;
}
