"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminFetch, errorMessage } from "../../_lib/admin-api";
import { countNewContacts, searchContacts } from "../../_lib/contact-stats";
import { actionLabels, formatDate, readableActivityLabel } from "../../_lib/format";
import type {
  ActivityEntry,
  ContactSubmission,
  LegalResourceType,
  PageResponse,
} from "../../_lib/types";
import { Feedback } from "../ui";
import { ContactStatusBadge } from "./contact-submissions-section";

type Overview = {
  vehicles: number;
  articles: number;
  legal: Record<LegalResourceType, number>;
  drafts: { vehicles: number; articles: number; legal: number };
  newContacts: number;
  contacts: PageResponse<ContactSubmission>;
  activity: PageResponse<ActivityEntry>;
};

function total(path: string) {
  return adminFetch<PageResponse<unknown>>(path).then((page) => page.pagination.total);
}

/**
 * Chỉ số dùng limit=1 nên mỗi request chỉ trả một bản ghi kèm tổng số; hai
 * danh sách gần đây lấy 5 mục. Các request chạy song song.
 */
async function loadOverview(): Promise<Overview> {
  const [
    vehicles,
    articles,
    policy,
    regulation,
    legalGuide,
    draftVehicles,
    draftArticles,
    draftLegal,
    newContacts,
    contacts,
    activity,
  ] = await Promise.all([
    total("/vehicles?limit=1"),
    total("/articles?limit=1"),
    total("/legal-resources?limit=1&type=policy"),
    total("/legal-resources?limit=1&type=regulation"),
    total("/legal-resources?limit=1&type=legal_guide"),
    total("/vehicles?limit=1&published=false"),
    total("/articles?limit=1&published=false"),
    total("/legal-resources?limit=1&published=false"),
    countNewContacts(),
    searchContacts({ page: 1, limit: 5 }),
    adminFetch<PageResponse<ActivityEntry>>("/activity?limit=5"),
  ]);
  return {
    vehicles,
    articles,
    legal: { policy, regulation, legal_guide: legalGuide },
    drafts: { vehicles: draftVehicles, articles: draftArticles, legal: draftLegal },
    newContacts,
    contacts,
    activity,
  };
}

export function OverviewSection() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    loadOverview()
      .then((next) => {
        if (!cancelled) setOverview(next);
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(errorMessage(loadError));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <Feedback message={error} isError />;
  if (!overview) return <p>Đang tải số liệu...</p>;

  const legalTotal =
    overview.legal.policy + overview.legal.regulation + overview.legal.legal_guide;
  const metrics = [
    { href: "/admin/vehicles", icon: "▰", label: "Danh mục xe", count: overview.vehicles, detail: "Đang quản lý" },
    { href: "/admin/articles", icon: "▤", label: "Bài viết", count: overview.articles, detail: "Đang quản lý" },
    {
      href: "/admin/policies",
      icon: "§",
      label: "Tài liệu pháp lý",
      count: legalTotal,
      detail: `${overview.legal.regulation} quy định · ${overview.legal.legal_guide} hướng dẫn`,
    },
    {
      href: "/admin/contact-submissions",
      icon: "✉",
      label: "Yêu cầu liên hệ",
      count: overview.contacts.pagination.total,
      detail: "Tổng số yêu cầu",
    },
  ];
  const draftTotal =
    overview.drafts.vehicles + overview.drafts.articles + overview.drafts.legal;
  const firstDraftPage =
    overview.drafts.vehicles > 0
      ? "/admin/vehicles?published=false"
      : overview.drafts.articles > 0
        ? "/admin/articles?published=false"
        : "/admin/policies?published=false";

  return (
    <>
      <section className="admin-attention" aria-label="Việc cần xử lý">
        <Link
          className={`admin-attention-card${overview.newContacts > 0 ? " is-urgent" : ""}`}
          href="/admin/contact-submissions?status=new"
        >
          <strong>{overview.newContacts}</strong>
          <span>
            Yêu cầu liên hệ chờ xử lý
            <small>
              {overview.newContacts > 0
                ? "Khách hàng đang chờ phản hồi — mở hộp thư để xử lý."
                : "Không có yêu cầu mới."}
            </small>
          </span>
        </Link>
        <Link className="admin-attention-card" href={firstDraftPage}>
          <strong>{draftTotal}</strong>
          <span>
            Bản nháp chờ duyệt
            <small>
              {overview.drafts.vehicles} xe · {overview.drafts.articles} bài viết ·{" "}
              {overview.drafts.legal} tài liệu pháp lý
            </small>
          </span>
        </Link>
      </section>
      <section className="admin-overview" aria-label="Chỉ số nội dung">
        {metrics.map((metric) => (
          <Link className="admin-metric-card" href={metric.href} key={metric.href}>
            <span className="admin-metric-icon">{metric.icon}</span>
            <span>{metric.label}</span>
            <strong>{metric.count}</strong>
            <small>{metric.detail}</small>
            <span className="admin-metric-link">Mở danh sách →</span>
          </Link>
        ))}
      </section>
      <section className="admin-overview-panels">
        <div className="admin-card admin-overview-panel">
          <div className="admin-list-heading">
            <div>
              <h2>Yêu cầu liên hệ gần đây</h2>
              <p>Tối đa 5 yêu cầu mới nhất, sắp xếp theo thời gian gửi.</p>
            </div>
            <Link href="/admin/contact-submissions">Xem tất cả</Link>
          </div>
          {overview.contacts.items.length === 0 ? (
            <p className="admin-empty">Chưa có yêu cầu liên hệ nào.</p>
          ) : (
            <div className="admin-recent-list">
              {overview.contacts.items.map((submission) => (
                <article key={submission.id}>
                  <span className="admin-recent-icon">✉</span>
                  <div>
                    <strong>{submission.name}</strong>
                    <small>
                      {submission.category} · {formatDate(submission.createdAt)}
                    </small>
                  </div>
                  <ContactStatusBadge status={submission.status} />
                </article>
              ))}
            </div>
          )}
        </div>
        <div className="admin-card admin-overview-panel">
          <div className="admin-list-heading">
            <div>
              <h2>Hoạt động quản trị</h2>
              <p>Các thao tác được ghi nhận gần đây.</p>
            </div>
            <Link href="/admin/activity">Xem lịch sử</Link>
          </div>
          {overview.activity.items.length === 0 ? (
            <p className="admin-empty">Chưa có hoạt động được ghi nhận.</p>
          ) : (
            <div className="admin-recent-list">
              {overview.activity.items.map((entry) => (
                <article key={entry.id}>
                  <span className="admin-recent-icon">◷</span>
                  <div>
                    <strong>
                      {actionLabels[entry.action]} · {readableActivityLabel(entry.entityLabel)}
                    </strong>
                    <small>
                      {entry.actor} · {formatDate(entry.createdAt)}
                    </small>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
