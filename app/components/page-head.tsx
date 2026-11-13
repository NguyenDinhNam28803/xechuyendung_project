import Link from "next/link";
import type { ReactNode } from "react";

/*
 * Đầu trang con: breadcrumb, h1 và một câu dẫn, đặt dưới thanh nav cố định của kit.
 * Không dùng .hero (cao đúng một màn hình) vì trang con cần vào nội dung ngay.
 */
type Crumb = { href?: string; label: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="pg-crumbs" aria-label="Đường dẫn">
      <ol>
        <li><Link href="/">Trang chủ</Link></li>
        {items.map((item) =>
          item.href ? (
            <li key={item.label}><Link href={item.href}>{item.label}</Link></li>
          ) : (
            <li key={item.label} aria-current="page">{item.label}</li>
          ),
        )}
      </ol>
    </nav>
  );
}

export default function PageHead({
  crumbs,
  title,
  lead,
  children,
}: {
  crumbs: Crumb[];
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="section pg-head" aria-labelledby="page-h">
      <div className="wrap">
        <Breadcrumbs items={crumbs} />
        <div className="section-head">
          <h1 id="page-h">{title}</h1>
          {lead && <p>{lead}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}
