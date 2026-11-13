import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "../../../components/page-head";
import SiteFooter from "../../../components/site-footer";
import SiteHeader from "../../../components/site-header";
import { getPublicArticle } from "../../../lib/content";

type ArticlePageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getPublicArticle(slug);
  return article
    ? { title: article.title, description: article.summary, openGraph: { type: "article" } }
    : { title: "Không tìm thấy bài viết" };
}

export default function ArticlePage({ params }: ArticlePageProps) {
  return (
    <>
      <SiteHeader current="/tin-tuc" />
      <Suspense fallback={<main id="noi-dung" className="section pg-head"><div className="wrap muted">Đang tải bài viết…</div></main>}>
        <ArticleContent params={params} />
      </Suspense>
      <SiteFooter />
    </>
  );
}

async function ArticleContent({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getPublicArticle(slug);
  if (!article) notFound();

  return (
    <main id="noi-dung">
      <article className="section pg-head" aria-labelledby="page-h">
        <div className="wrap pg-prose">
          <Breadcrumbs items={[{ href: "/tin-tuc", label: "Kiến thức" }, { label: article.title }]} />
          <header className="section-head">
            <p className="t-label muted">{article.category} · Thông tin tham khảo</p>
            <h1 id="page-h">{article.title}</h1>
            <p>{article.summary}</p>
          </header>
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
          <aside className="card pg-callout">
            <p className="t-small">
              Nội dung chỉ mang tính tham khảo. Thông số, hồ sơ, quy định và điều kiện giao dịch cần được xác minh theo xe và thời điểm thực tế.
            </p>
          </aside>
          <p><Link className="link" href="/tin-tuc">Các bài viết khác</Link></p>
        </div>
      </article>
    </main>
  );
}
