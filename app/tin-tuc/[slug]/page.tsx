import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "../../components/site-footer";
import SiteHeader from "../../components/site-header";
import { articles } from "../../data/articles";

type ArticlePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);
  return article
    ? { title: article.title, description: article.summary }
    : { title: "Không tìm thấy bài viết" };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = articles.find((item) => item.slug === slug);
  if (!article) notFound();

  return (
    <>
      <SiteHeader />
      <main className="content-page article-page">
        <div className="breadcrumbs"><Link href="/">Trang chủ</Link><span>/</span><Link href="/tin-tuc">Kiến thức</Link><span>/</span><span>{article.title}</span></div>
        <article>
          <header className="article-header">
            <span className="section-kicker">{article.category} · THÔNG TIN THAM KHẢO</span>
            <h1>{article.title}</h1>
            <p>{article.summary}</p>
          </header>
          <div className="article-body">
            {article.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </section>
            ))}
            <aside className="article-disclaimer">
              Nội dung chỉ mang tính tham khảo. Thông số, hồ sơ, quy định và điều kiện giao dịch cần được xác minh theo xe và thời điểm thực tế.
            </aside>
          </div>
        </article>
        <div className="detail-back"><Link href="/tin-tuc">← Quay lại danh sách bài viết</Link></div>
      </main>
      <SiteFooter />
    </>
  );
}
