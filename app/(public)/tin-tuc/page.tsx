import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import PageHead from "../../components/page-head";
import SiteFooter from "../../components/site-footer";
import SiteHeader from "../../components/site-header";
import { getPublicArticles } from "../../lib/content";

export const metadata: Metadata = {
  title: "Kiến thức chọn xe",
  description: "Bài viết tham khảo về lựa chọn xe, chuẩn bị báo giá và xác nhận thông tin kỹ thuật.",
};

export default function NewsPage() {
  return (
    <>
      <SiteHeader current="/tin-tuc" />
      <main id="noi-dung">
        <PageHead
          crumbs={[{ label: "Kiến thức" }]}
          title="Kiến thức chọn xe chuyên dụng"
          lead="Bài viết giúp chuẩn bị câu hỏi và thông tin cần kiểm tra. Nội dung không thay thế tư vấn kỹ thuật hay hồ sơ chính thức."
        />
        <section className="section pg-after-head" aria-label="Danh sách bài viết">
          <div className="wrap pg-narrow">
            <Suspense fallback={<p className="muted">Đang tải bài viết…</p>}>
              <Articles />
            </Suspense>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

async function Articles() {
  const articles = await getPublicArticles();
  if (articles.length === 0) {
    return (
      <div className="card pg-empty">
        <h3>Chưa có bài viết</h3>
        <p>Bài viết mới được đăng sau khi duyệt nội dung.</p>
      </div>
    );
  }
  return (
    <ol className="pg-articles">
      {articles.map((article, index) => (
        <li key={article.slug}>
          <Link href={`/tin-tuc/${article.slug}`}>
            <span className="pg-resources__num t-small muted">{String(index + 1).padStart(2, "0")}</span>
            <div className="stack-2">
              <p className="t-label muted">{article.category}</p>
              <h2 className="pg-articles__title">{article.title}</h2>
              <p className="pg-articles__summary">{article.summary}</p>
            </div>
            <span className="link pg-articles__more">Đọc bài</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
