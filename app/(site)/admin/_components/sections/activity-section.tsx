"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "../../_lib/admin-api";
import { actionLabels, entityLabels, formatDate, readableActivityLabel } from "../../_lib/format";
import type {
  ActivityAction,
  ActivityEntityType,
  ActivityEntry,
  ActivityStats,
  PageResponse,
} from "../../_lib/types";
import { apiQuery, usePagedList } from "../../_lib/use-paged-list";
import { ChartCard, Legend, StackedColumnChart, type SeriesDef } from "../charts";
import { Feedback, ListControls, Pagination, SearchBox, Toolbar } from "../ui";

const filterKeys = ["action", "entityType", "from", "to"] as const;

const actionSeries: SeriesDef<"CREATE" | "UPDATE" | "DELETE" | "other">[] = [
  { key: "CREATE", label: actionLabels.CREATE, slot: 1 },
  { key: "UPDATE", label: actionLabels.UPDATE, slot: 2 },
  { key: "DELETE", label: actionLabels.DELETE, slot: 3 },
  { key: "other", label: "Khác (nhập, đăng nhập/xuất)", slot: 4 },
];

const actions = Object.keys(actionLabels) as ActivityAction[];
const entities = Object.keys(entityLabels) as ActivityEntityType[];
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

/** Biểu đồ 30 ngày ở đầu trang lịch sử; lỗi tải không chặn bảng bên dưới. */
function ActivityTrend() {
  const [stats, setStats] = useState<ActivityStats | null>(null);
  useEffect(() => {
    let cancelled = false;
    adminFetch<ActivityStats>("/stats/activity?days=30")
      .then((next) => {
        if (!cancelled) setStats(next);
      })
      .catch(() => {
        if (!cancelled) setStats(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  if (!stats) return null;
  const data = stats.series.map((point) => ({
    day: point.day,
    values: {
      CREATE: point.byAction.CREATE,
      UPDATE: point.byAction.UPDATE,
      DELETE: point.byAction.DELETE,
      other: point.byAction.IMPORT + point.byAction.LOGIN + point.byAction.LOGOUT,
    },
  }));
  return (
    <ChartCard subtitle={`${stats.total} sự kiện trong 30 ngày gần nhất.`} title="Nhịp độ hoạt động">
      <Legend
        series={actionSeries}
        totals={{
          CREATE: stats.byAction.CREATE,
          UPDATE: stats.byAction.UPDATE,
          DELETE: stats.byAction.DELETE,
          other: stats.byAction.IMPORT + stats.byAction.LOGIN + stats.byAction.LOGOUT,
        }}
      />
      <StackedColumnChart
        data={data}
        height={180}
        label={`Biểu đồ cột chồng: ${stats.total} sự kiện quản trị trong 30 ngày.`}
        series={actionSeries}
      />
    </ChartCard>
  );
}

export function ActivitySection() {
  const loader = useCallback(
    (page: number, search: string, filters: Record<string, string>) =>
      adminFetch<PageResponse<ActivityEntry>>(
        `/activity?${apiQuery({
          page,
          limit: 50,
          q: search,
          action: filters.action,
          entityType: filters.entityType,
          from: datePattern.test(filters.from ?? "") ? filters.from : undefined,
          to: datePattern.test(filters.to ?? "") ? filters.to : undefined,
        })}`,
      ),
    [],
  );
  const list = usePagedList(loader, { filterKeys });
  const hasFilters = filterKeys.some((key) => list.filters[key]);

  return (
    <div className="admin-dashboard">
      <ActivityTrend />
      <div>
        <Toolbar total={list.pageInfo.total} caption="Sự kiện phù hợp" />
        <Feedback message={list.error} isError />
        <ListControls>
          <SearchBox
            label="Tìm trong lịch sử"
            value={list.search}
            onChange={list.setSearch}
            placeholder="Người thực hiện, thao tác hoặc nội dung..."
          />
          <div className="admin-filter-row">
            <label>
              Thao tác
              <select
                onChange={(event) => list.setFilter("action", event.target.value)}
                value={list.filters.action ?? ""}
              >
                <option value="">Tất cả</option>
                {actions.map((action) => (
                  <option key={action} value={action}>
                    {actionLabels[action]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Đối tượng
              <select
                onChange={(event) => list.setFilter("entityType", event.target.value)}
                value={list.filters.entityType ?? ""}
              >
                <option value="">Tất cả</option>
                {entities.map((entity) => (
                  <option key={entity} value={entity}>
                    {entityLabels[entity]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Từ ngày
              <input
                max={list.filters.to || undefined}
                onChange={(event) => list.setFilter("from", event.target.value)}
                type="date"
                value={list.filters.from ?? ""}
              />
            </label>
            <label>
              Đến ngày
              <input
                min={list.filters.from || undefined}
                onChange={(event) => list.setFilter("to", event.target.value)}
                type="date"
                value={list.filters.to ?? ""}
              />
            </label>
            {hasFilters && (
              <button
                className="admin-link-button"
                onClick={() => filterKeys.forEach((key) => list.setFilter(key, ""))}
                type="button"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        </ListControls>
      </div>
      <section className="admin-card admin-activity">
        <div className="admin-list-heading">
          <div>
            <h2>Lịch sử hoạt động</h2>
            <p>
              Ghi nhận trong cùng giao dịch với thao tác dữ liệu, gắn với tài khoản thực
              hiện; bản ghi này chỉ xem, không thể sửa/xóa.
            </p>
          </div>
          <span>{list.loading ? "Đang tải..." : `${list.pageInfo.total} sự kiện`}</span>
        </div>
        {!list.loading && list.items.length === 0 ? (
          <p className="admin-empty">
            {hasFilters || list.search
              ? "Không có sự kiện nào khớp với bộ lọc."
              : "Chưa có hoạt động được ghi nhận."}
          </p>
        ) : (
          <div className="admin-activity-table-wrap">
            <table className="admin-data-table admin-activity-table">
              <thead>
                <tr>
                  <th>Thời điểm</th>
                  <th>Người thực hiện</th>
                  <th>Thao tác</th>
                  <th>Đối tượng</th>
                  <th>Nội dung</th>
                </tr>
              </thead>
              <tbody>
                {list.items.map((entry) => (
                  <tr key={entry.id}>
                    <td className="admin-nowrap">{formatDate(entry.createdAt)}</td>
                    <td>{entry.actor}</td>
                    <td>
                      <span
                        className={`admin-action-badge admin-action-${entry.action.toLowerCase()}`}
                      >
                        {actionLabels[entry.action]}
                      </span>
                    </td>
                    <td>{entityLabels[entry.entityType]}</td>
                    <td>{readableActivityLabel(entry.entityLabel)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <Pagination pageInfo={list.pageInfo} onPageChange={(page) => void list.goToPage(page)} />
    </div>
  );
}
