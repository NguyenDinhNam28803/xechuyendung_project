"use client";

import { useCallback } from "react";
import { adminFetch } from "../../_lib/admin-api";
import { actionLabels, entityLabels, formatDate } from "../../_lib/format";
import type { ActivityEntry, PageResponse } from "../../_lib/types";
import { apiQuery, usePagedList } from "../../_lib/use-paged-list";
import { Feedback, Pagination, SearchBox, Toolbar } from "../ui";

export function ActivitySection() {
  const loader = useCallback(
    (page: number, search: string) =>
      adminFetch<PageResponse<ActivityEntry>>(
        `/activity?${apiQuery({ page, limit: 50, q: search })}`,
      ),
    [],
  );
  const list = usePagedList(loader);

  return (
    <>
      <Toolbar total={list.pageInfo.total} caption="Sự kiện đã ghi nhận" />
      <Feedback message={list.error} isError />
      <SearchBox
        label="Tìm trong lịch sử"
        value={list.search}
        onChange={list.setSearch}
        placeholder="Người thực hiện, thao tác hoặc nội dung..."
      />
      <Pagination pageInfo={list.pageInfo} onPageChange={(page) => void list.goToPage(page)} />
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
          <p className="admin-empty">Chưa có hoạt động được ghi nhận.</p>
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
                    <td>{formatDate(entry.createdAt)}</td>
                    <td>{entry.actor}</td>
                    <td>
                      <span
                        className={`admin-action-badge admin-action-${entry.action.toLowerCase()}`}
                      >
                        {actionLabels[entry.action]}
                      </span>
                    </td>
                    <td>{entityLabels[entry.entityType]}</td>
                    <td>{entry.entityLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
