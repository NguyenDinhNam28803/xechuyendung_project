import type { LegalResource } from "../data/legal-resources";

/* Danh sách chính sách / văn bản: mỗi mục một hàng, tiêu đề, tóm tắt, nội dung và nguồn. */
export default function ResourceList({
  resources,
  emptyTitle,
  emptyText,
  tag,
}: {
  resources: LegalResource[];
  emptyTitle: string;
  emptyText: string;
  tag: string;
}) {
  if (resources.length === 0) {
    return (
      <div className="card pg-empty">
        <h3>{emptyTitle}</h3>
        <p>{emptyText}</p>
      </div>
    );
  }
  return (
    <ol className="pg-resources">
      {resources.map((resource, index) => (
        <li key={resource.slug}>
          <span className="pg-resources__num t-small muted">{String(index + 1).padStart(2, "0")}</span>
          <div className="stack-2">
            <h3>{resource.title}</h3>
            <p className="t-lead">{resource.summary}</p>
            <p>{resource.content}</p>
            {resource.sourceUrl && (
              <p><a className="link" href={resource.sourceUrl} rel="noreferrer" target="_blank">Mở nguồn tham khảo</a></p>
            )}
          </div>
          <span className="badge">{tag}</span>
        </li>
      ))}
    </ol>
  );
}
