import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../components/site-footer";
import SiteHeader from "../components/site-header";
import { articles } from "../data/articles";

export const metadata: Metadata = {
  title: "Kiến thức và hướng dẫn",
  description: "Bài viết tham khảo về lựa chọn xe, chuẩn bị báo giá và xác nhận thông tin kỹ thuật.",
};

export default function NewsPage() {
  return (
    <>
      <SiteHeader />
      <main className="content-page">
        <div className="breadcrumbs"><Link href="/">Trang chủ</Link><span>/</span><span>Kiến thức</span></div>
        <section className="page-intro">
          <span className="section-kicker">GÓC KIẾN THỨC</span>
          <h1>Tìm hiểu trước<br /><span>khi chọn xe.</span></h1>
          <p>Nội dung định hướng giúp chuẩn bị câu hỏi và thông tin cần kiểm tra. Bài viết không thay thế tư vấn kỹ thuật hay hồ sơ chính thức.</p>
        </section>
        <section className="article-list" aria-label="Danh sách bài viết">
          {articles.map((article, index) => (
            <article className="article-card" key={article.slug}>
              <span className="article-index">0{index + 1}</span>
              <div>
                <span className="article-category">{article.category}</span>
                <h2><Link href={`/tin-tuc/${article.slug}`}>{article.title}</Link></h2>
                <p>{article.summary}</p>
              </div>
              <Link className="article-open" href={`/tin-tuc/${article.slug}`} aria-label={`Đọc bài: ${article.title}`}>↗</Link>
            </article>
          ))}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
