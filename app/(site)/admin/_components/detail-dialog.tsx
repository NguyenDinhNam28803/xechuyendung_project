"use client";

import { useEffect, type ReactNode } from "react";

/** Hộp thoại xem chi tiết; đóng bằng Esc, nút × hoặc bấm ra ngoài. */
export function DetailDialog({
  title,
  slug,
  isPublished,
  badge,
  onClose,
  onEdit,
  children,
}: {
  title: string;
  slug: string;
  isPublished: boolean;
  badge?: string;
  onClose: () => void;
  onEdit: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    function dismissOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", dismissOnEscape);
    return () => document.removeEventListener("keydown", dismissOnEscape);
  }, [onClose]);

  return (
    <div
      className="admin-detail-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <section
        aria-labelledby="admin-detail-title"
        aria-modal="true"
        className="admin-detail-dialog"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="admin-detail-header">
          <div>
            <span className="admin-eyebrow">HỒ SƠ NỘI DUNG</span>
            <h2 id="admin-detail-title">{title}</h2>
            <span className="admin-detail-slug">/{slug}</span>
          </div>
          <button
            aria-label="Đóng chi tiết"
            className="admin-detail-close"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </header>
        <div className="admin-detail-body">
          <div className="admin-detail-status-row">
            <span
              className={`admin-detail-publish ${isPublished ? "is-published" : ""}`}
            >
              {isPublished ? "Đang công khai" : "Bản nháp"}
            </span>
            {badge && <span className="admin-detail-type">{badge}</span>}
          </div>
          <dl className="admin-detail-grid">{children}</dl>
        </div>
        <footer className="admin-detail-footer">
          <button
            className="admin-secondary-button"
            onClick={onClose}
            type="button"
          >
            Đóng
          </button>
          <button
            className="admin-primary-button"
            onClick={onEdit}
            type="button"
          >
            Sửa thông tin
          </button>
        </footer>
      </section>
    </div>
  );
}

export function DetailItem({
  label,
  full,
  prose,
  children,
}: {
  label: string;
  full?: boolean;
  prose?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={full ? "admin-detail-full" : undefined}>
      <dt>{label}</dt>
      <dd className={prose ? "admin-detail-prose" : undefined}>{children}</dd>
    </div>
  );
}

export function SourceLink({ url }: { url: string | null | undefined }) {
  if (!url) return null;
  return (
    <DetailItem full label="Nguồn tham khảo">
      <a href={url} rel="noreferrer" target="_blank">
        {url}
      </a>
    </DetailItem>
  );
}
