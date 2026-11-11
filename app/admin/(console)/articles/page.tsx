import type { Metadata } from "next";
import { ArticlesSection } from "../../_components/sections/articles-section";

export const metadata: Metadata = { title: "Bài viết · Quản trị" };

export default function Page() {
  return <ArticlesSection />;
}
