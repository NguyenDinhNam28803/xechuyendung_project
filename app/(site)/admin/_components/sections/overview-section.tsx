"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminFetch, errorMessage } from "../../_lib/admin-api";
import { searchContacts } from "../../_lib/contact-stats";
import {
  actionLabels,
  contactStatusLabels,
  entityLabels,
  formatCount,
  formatDate,
  formatHours,
  formatLongDay,
  readableActivityLabel,
} from "../../_lib/format";
import type {
  ActivityEntry,
  ActivityStats,
  ContactStats,
  ContactStatus,
  ContactSubmission,
  PageResponse,
  StatsOverview,
} from "../../_lib/types";
import {
  BarList,
  ChartCard,
  Legend,
  RangePicker,
  SegmentBar,
  StackedColumnChart,
  StatTile,
  type SeriesDef,
} from "../charts";
import { Feedback } from "../ui";
import { ContactStatusBadge } from "./contact-submissions-section";

/** Màu cố định theo trạng thái (không đổi khi lọc khoảng thời gian). */
const statusSeries: SeriesDef<ContactStatus>[] = [
  { key: "new", label: contactStatusLabels.new, slot: 1 },
  { key: "in_progress", label: contactStatusLabels.in_progress, slot: 2 },
  { key: "contacted", label: contactStatusLabels.contacted, slot: 3 },
  { key: "closed", label: contactStatusLabels.closed, slot: 4 },
  { key: "spam", label: contactStatusLabels.spam, slot: 5 },
];

type ActivityGroup = "create" | "update" | "delete" | "import" | "session";
const activitySeries: SeriesDef<ActivityGroup>[] = [
  { key: "create", label: "Tạo mới", slot: 1 },
  { key: "update", label: "Cập nhật", slot: 2 },
  { key: "delete", label: "Xóa", slot: 3 },
  { key: "import", label: "Nhập dữ liệu", slot: 4 },
  { key: "session", label: "Đăng nhập/xuất", slot: 5 },
];

type PublishKey = "published" | "draft";
const publishSeries: SeriesDef<PublishKey>[] = [
  { key: "published", label: "Công khai", slot: 1 },
  { key: "draft", label: "Nháp", slot: 2 },
];

const rangeOptions = [
  { days: 7, label: "7 ngày" },
  { days: 30, label: "30 ngày" },
  { days: 90, label: "90 ngày" },
  { days: 365, label: "12 tháng" },
];

function groupActions(byAction: ActivityStats["byAction"]): Record<ActivityGroup, number> {
  return {
    create: byAction.CREATE,
    update: byAction.UPDATE,
    delete: byAction.DELETE,
    import: byAction.IMPORT,
    session: byAction.LOGIN + byAction.LOGOUT,
  };
}

type Recent = {
  contacts: PageResponse<ContactSubmission>;
  activity: PageResponse<ActivityEntry>;
};

/** Tải một lần: chỉ số tổng hợp + hai danh sách gần đây (3 request song song). */
function useOverview() {
  const [state, setState] = useState<{
    overview: StatsOverview;
    recent: Recent;
  } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      adminFetch<StatsOverview>("/stats/overview"),
      searchContacts({ page: 1, limit: 5 }),
      adminFetch<PageResponse<ActivityEntry>>("/activity?limit=5"),
    ])
      .then(([overview, contacts, activity]) => {
        if (!cancelled) setState({ overview, recent: { contacts, activity } });
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(errorMessage(loadError));
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return { state, error };
}

/** Xu hướng theo khoảng thời gian; tải lại khi đổi khoảng. */
function useTrends(days: number) {
  const [trends, setTrends] = useState<{
    days: number;
    contacts: ContactStats;
    activity: ActivityStats;
  } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      adminFetch<ContactStats>(`/stats/contacts?days=${days}`),
      adminFetch<ActivityStats>(`/stats/activity?days=${days}`),
    ])
      .then(([contacts, activity]) => {
        if (!cancelled) {
          setTrends({ days, contacts, activity });
          setError("");
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(errorMessage(loadError));
      });
    return () => {
      cancelled = true;
    };
  }, [days]);
  return { trends, error, loading: trends?.days !== days };
}

export function OverviewSection() {
  const [days, setDays] = useState(30);
  const { state, error } = useOverview();
  const trends = useTrends(days);

  if (error) return <Feedback message={error} isError />;
  if (!state) return <OverviewSkeleton />;

  const { overview, recent } = state;
  const content = overview.content;
  const draftTotal =
    content.vehicles.draft +
    content.articles.draft +
    content.legal.policy.draft +
    content.legal.regulation.draft +
    content.legal.legal_guide.draft;
  const firstDraftPage =
    content.vehicles.draft > 0
      ? "/admin/vehicles?published=false"
      : content.articles.draft > 0
        ? "/admin/articles?published=false"
        : "/admin/policies?published=false";
  const contactStats = trends.trends?.contacts;
  const activityStats = trends.trends?.activity;
  const rangeLabel = rangeOptions.find((option) => option.days === days)?.label ?? `${days} ngày`;

  return (
    <div className="admin-dashboard">
      <section className="admin-attention" aria-label="Việc cần xử lý">
        <Link
          className={`admin-attention-card${overview.contacts.byStatus.new > 0 ? " is-urgent" : ""}`}
          href="/admin/contact-submissions?status=new"
        >
          <strong>{overview.contacts.byStatus.new}</strong>
          <span>
            Yêu cầu liên hệ chờ xử lý
            <small>
              {overview.contacts.byStatus.new > 0
                ? "Khách hàng đang chờ phản hồi — mở hộp thư để xử lý."
                : "Không có yêu cầu mới."}
            </small>
          </span>
        </Link>
        <Link
          className={`admin-attention-card${overview.contacts.overdueNew > 0 ? " is-urgent" : ""}`}
          href="/admin/contact-submissions?status=new&sort=createdAt%3Aasc"
        >
          <strong>{overview.contacts.overdueNew}</strong>
          <span>
            Quá {overview.contacts.overdueHours} giờ chưa phản hồi
            <small>
              {overview.contacts.overdueNew > 0
                ? "Ưu tiên xử lý các yêu cầu cũ nhất trước."
                : "Không có yêu cầu nào bị trễ."}
            </small>
          </span>
        </Link>
        <Link className="admin-attention-card" href={firstDraftPage}>
          <strong>{draftTotal}</strong>
          <span>
            Bản nháp chờ duyệt
            <small>
              {content.vehicles.draft} xe · {content.articles.draft} bài viết ·{" "}
              {draftTotal - content.vehicles.draft - content.articles.draft} tài liệu pháp lý
            </small>
          </span>
        </Link>
      </section>

      <div className="admin-dashboard-filters">
        <div>
          <h2>Hiệu quả tiếp nhận khách hàng</h2>
          <p>
            {contactStats
              ? `Từ ${formatLongDay(contactStats.from)} đến hôm nay (giờ Việt Nam).`
              : "Đang tải số liệu..."}
          </p>
        </div>
        <RangePicker onChange={setDays} options={rangeOptions} value={days} />
      </div>
      <Feedback message={trends.error} isError />

      <section
        aria-busy={trends.loading}
        aria-label="Chỉ số chính"
        className={`admin-stat-grid${trends.loading ? " is-loading" : ""}`}
      >
        <StatTile
          delta={contactStats?.changePercent}
          deltaLabel="so với kỳ trước"
          href="/admin/contact-submissions"
          hint={contactStats ? `Kỳ trước: ${formatCount(contactStats.previousTotal)} yêu cầu` : undefined}
          label={`Yêu cầu liên hệ · ${rangeLabel}`}
          trend={contactStats?.series.map((point) => point.total)}
          value={contactStats ? formatCount(contactStats.total) : "—"}
        />
        <StatTile
          hint="Đã liên hệ hoặc hoàn tất, không tính spam."
          label="Tỷ lệ đã phản hồi"
          value={
            contactStats?.handledRate === null || contactStats === undefined
              ? "—"
              : `${contactStats.handledRate.toLocaleString("vi-VN")}%`
          }
        />
        <StatTile
          hint="Từ lúc khách gửi tới lần xử lý đầu tiên."
          label="Thời gian phản hồi TB"
          value={formatHours(contactStats?.avgResponseHours)}
        />
        <StatTile
          hint={`${overview.users.activeUsers}/${overview.users.totalUsers} tài khoản hoạt động · ${overview.users.activeSessions} phiên đang mở`}
          label={`Thao tác quản trị · ${rangeLabel}`}
          trend={activityStats?.series.map((point) => point.total - point.byAction.LOGIN - point.byAction.LOGOUT)}
          value={
            activityStats
              ? formatCount(
                  activityStats.total - activityStats.byAction.LOGIN - activityStats.byAction.LOGOUT,
                )
              : "—"
          }
        />
      </section>

      <div className="admin-chart-grid admin-chart-grid-wide">
        <ChartCard
          subtitle="Số yêu cầu mới mỗi ngày, chia theo trạng thái hiện tại."
          table={
            contactStats && (
              <DayTable
                rows={contactStats.series.map((point) => ({ day: point.day, values: point.byStatus }))}
                series={statusSeries}
              />
            )
          }
          title="Yêu cầu liên hệ theo ngày"
        >
          {contactStats ? (
            <>
              <Legend series={statusSeries} totals={contactStats.byStatus} />
              <StackedColumnChart
                data={contactStats.series.map((point) => ({ day: point.day, values: point.byStatus }))}
                label={`Biểu đồ cột chồng: ${contactStats.total} yêu cầu liên hệ trong ${rangeLabel}, chia theo trạng thái.`}
                series={statusSeries}
              />
            </>
          ) : (
            <div className="admin-chart-placeholder" />
          )}
        </ChartCard>
        <ChartCard subtitle="Khách hàng quan tâm loại xe nào." title="Theo loại xe">
          {contactStats ? (
            <BarList
              items={contactStats.byCategory.map((item) => ({
                key: item.category,
                label: item.category,
                value: item.total,
              }))}
            />
          ) : (
            <div className="admin-chart-placeholder is-short" />
          )}
        </ChartCard>
      </div>

      <div className="admin-chart-grid">
        <ChartCard
          subtitle={
            contactStats && days > contactStats.detailRetentionDays
              ? `Chỉ tính ${contactStats.detailRetentionDays} ngày gần nhất (thời hạn lưu yêu cầu chi tiết).`
              : "Xe được nhắc tới trong yêu cầu tư vấn."
          }
          title="Xe được hỏi nhiều nhất"
        >
          {contactStats ? (
            <BarList
              emptyMessage="Chưa có yêu cầu nào gắn với một xe cụ thể."
              items={contactStats.topVehicles.map((item) => ({
                key: item.slug,
                label: item.name ?? item.slug,
                value: item.total,
                hint: item.name ? item.slug : "Xe đã bị xóa hoặc đổi slug",
              }))}
              slot={3}
            />
          ) : (
            <div className="admin-chart-placeholder is-short" />
          )}
        </ChartCard>
        <ChartCard subtitle="Bấm vào từng dòng để mở danh sách." title="Trạng thái nội dung">
          <div className="admin-segment-list">
            <SegmentBar href="/admin/vehicles" label="Xe" series={publishSeries} values={content.vehicles} />
            <SegmentBar href="/admin/articles" label="Bài viết" series={publishSeries} values={content.articles} />
            <SegmentBar href="/admin/policies" label="Chính sách" series={publishSeries} values={content.legal.policy} />
            <SegmentBar
              href="/admin/regulations"
              label="Quy định"
              series={publishSeries}
              values={content.legal.regulation}
            />
            <SegmentBar
              href="/admin/legal-guides"
              label="Tìm hiểu pháp lý"
              series={publishSeries}
              values={content.legal.legal_guide}
            />
          </div>
        </ChartCard>
      </div>

      <div className="admin-chart-grid admin-chart-grid-wide">
        <ChartCard
          subtitle="Mọi thao tác được ghi trong nhật ký, theo ngày."
          table={
            activityStats && (
              <DayTable
                rows={activityStats.series.map((point) => ({
                  day: point.day,
                  values: groupActions(point.byAction),
                }))}
                series={activitySeries}
              />
            )
          }
          title="Hoạt động quản trị"
        >
          {activityStats ? (
            <>
              <Legend series={activitySeries} totals={groupActions(activityStats.byAction)} />
              <StackedColumnChart
                data={activityStats.series.map((point) => ({
                  day: point.day,
                  values: groupActions(point.byAction),
                }))}
                label={`Biểu đồ cột chồng: ${activityStats.total} thao tác quản trị trong ${rangeLabel}.`}
                series={activitySeries}
              />
            </>
          ) : (
            <div className="admin-chart-placeholder" />
          )}
        </ChartCard>
        <ChartCard subtitle="Không tính đăng nhập/đăng xuất." title="Theo người thực hiện">
          {activityStats ? (
            <>
              <BarList
                emptyMessage="Chưa có thao tác trong khoảng thời gian này."
                items={activityStats.topActors.map((item) => ({
                  key: item.actor,
                  label: item.actor,
                  value: item.total,
                }))}
              />
              {activityStats.byEntity.length > 0 && (
                <p className="admin-chart-footnote">
                  Nhiều nhất:{" "}
                  {activityStats.byEntity
                    .slice(0, 3)
                    .map((item) => `${entityLabels[item.entityType]} (${formatCount(item.total)})`)
                    .join(" · ")}
                </p>
              )}
            </>
          ) : (
            <div className="admin-chart-placeholder is-short" />
          )}
        </ChartCard>
      </div>

      <section className="admin-overview-panels">
        <div className="admin-card admin-overview-panel">
          <div className="admin-list-heading">
            <div>
              <h2>Yêu cầu liên hệ gần đây</h2>
              <p>Tối đa 5 yêu cầu mới nhất, sắp xếp theo thời gian gửi.</p>
            </div>
            <Link href="/admin/contact-submissions">Xem tất cả</Link>
          </div>
          {recent.contacts.items.length === 0 ? (
            <p className="admin-empty">Chưa có yêu cầu liên hệ nào.</p>
          ) : (
            <div className="admin-recent-list">
              {recent.contacts.items.map((submission) => (
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
          {recent.activity.items.length === 0 ? (
            <p className="admin-empty">Chưa có hoạt động được ghi nhận.</p>
          ) : (
            <div className="admin-recent-list">
              {recent.activity.items.map((entry) => (
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
    </div>
  );
}

/** Bảng thay thế cho biểu đồ theo ngày (đọc màn hình, in, tra số chính xác). */
function DayTable<Key extends string>({
  rows,
  series,
}: {
  rows: { day: string; values: Record<Key, number> }[];
  series: SeriesDef<Key>[];
}) {
  const nonEmpty = rows.filter((row) => series.some((item) => row.values[item.key] > 0));
  if (nonEmpty.length === 0) return <p className="admin-empty">Không có dữ liệu.</p>;
  return (
    <div className="admin-data-table-wrap">
      <table className="admin-data-table admin-compact-table">
        <thead>
          <tr>
            <th>Ngày</th>
            {series.map((item) => (
              <th key={item.key}>{item.label}</th>
            ))}
            <th>Tổng</th>
          </tr>
        </thead>
        <tbody>
          {[...nonEmpty].reverse().map((row) => (
            <tr key={row.day}>
              <td>{formatLongDay(row.day)}</td>
              {series.map((item) => (
                <td className="admin-numeric" key={item.key}>
                  {formatCount(row.values[item.key])}
                </td>
              ))}
              <td className="admin-numeric">
                <strong>{formatCount(series.reduce((sum, item) => sum + row.values[item.key], 0))}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div aria-busy="true" aria-label="Đang tải số liệu" className="admin-dashboard">
      <div className="admin-stat-grid">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="admin-stat-tile" key={index}>
            <span className="admin-skeleton" />
            <span className="admin-skeleton is-large" />
          </div>
        ))}
      </div>
      <div className="admin-chart-grid admin-chart-grid-wide">
        <div className="admin-card admin-chart-card">
          <div className="admin-chart-placeholder" />
        </div>
        <div className="admin-card admin-chart-card">
          <div className="admin-chart-placeholder is-short" />
        </div>
      </div>
    </div>
  );
}
