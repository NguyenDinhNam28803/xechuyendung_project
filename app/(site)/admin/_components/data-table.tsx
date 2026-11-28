"use client";

import type { ReactNode } from "react";
import { nextSortParam, parseSortParam } from "../_lib/sort-param";
import type { Selection } from "../_lib/use-selection";

export type Column<T> = {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  /** Tên trường sắp xếp phía server (`sort=field:asc|desc`). */
  sortKey?: string;
  className?: string;
};


export const pageSizeOptions = [25, 50, 100] as const;

/**
 * Bảng dữ liệu dùng chung cho mọi phân hệ quản trị: tiêu đề + số mục, chọn số
 * dòng mỗi trang, header bấm để sắp xếp (aria-sort), checkbox chọn nhiều dòng
 * kèm thanh thao tác hàng loạt, skeleton khi tải lần đầu và dòng trống.
 */
export function DataTable<T extends { id: string }>({
  title,
  rows,
  columns,
  loading,
  total,
  sort,
  onSortChange,
  pageSize,
  onPageSizeChange,
  selection,
  bulkActions,
  emptyMessage = "Không có mục phù hợp. Hãy tạo nội dung mới hoặc điều chỉnh từ khóa/bộ lọc.",
  rowLabel,
  minWidth,
}: {
  title: ReactNode;
  rows: T[];
  columns: Column<T>[];
  loading: boolean;
  total: number;
  sort?: string;
  onSortChange?: (value: string) => void;
  pageSize?: number;
  onPageSizeChange?: (value: number) => void;
  selection?: Selection;
  /** Nút hiển thị khi có dòng được chọn. */
  bulkActions?: ReactNode;
  emptyMessage?: ReactNode;
  /** Nhãn đọc màn hình cho checkbox của dòng. */
  rowLabel?: (row: T) => string;
  minWidth?: number;
}) {
  const sortState = parseSortParam(sort);
  const columnCount = columns.length + (selection ? 1 : 0);
  const showSkeleton = loading && rows.length === 0;

  return (
    <section className="admin-card admin-list" aria-busy={loading}>
      <div className="admin-list-heading">
        <h2>{title}</h2>
        <div className="admin-table-meta">
          <span>{loading ? "Đang tải..." : `${total} mục`}</span>
          {onPageSizeChange && (
            <label className="admin-page-size">
              <span>Hiển thị</span>
              <select
                onChange={(event) => onPageSizeChange(Number(event.target.value))}
                value={pageSize ?? pageSizeOptions[0]}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size} / trang
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>

      {selection && selection.count > 0 && (
        <div className="admin-bulk-bar" role="region" aria-label="Thao tác hàng loạt">
          <strong>Đã chọn {selection.count}</strong>
          <div className="admin-bulk-actions">{bulkActions}</div>
          <button className="admin-link-button" onClick={selection.clear} type="button">
            Bỏ chọn
          </button>
        </div>
      )}

      <div className="admin-data-table-wrap">
        <table className="admin-data-table" style={minWidth ? { minWidth } : undefined}>
          <thead>
            <tr>
              {selection && (
                <th className="admin-select-cell">
                  <input
                    aria-label="Chọn tất cả dòng trên trang"
                    checked={selection.allSelected}
                    disabled={rows.length === 0}
                    onChange={selection.toggleAll}
                    ref={(input) => {
                      if (input) input.indeterminate = selection.someSelected;
                    }}
                    type="checkbox"
                  />
                </th>
              )}
              {columns.map((column) => {
                const active = column.sortKey && sortState?.key === column.sortKey;
                const ariaSort = active
                  ? sortState.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : undefined;
                return (
                  <th aria-sort={ariaSort} className={column.className} key={column.key}>
                    {column.sortKey && onSortChange ? (
                      <button
                        className={`admin-sort-button${active ? " is-active" : ""}`}
                        onClick={() => onSortChange(nextSortParam(sortState, column.sortKey!))}
                        type="button"
                      >
                        {column.header}
                        <span aria-hidden="true" className="admin-sort-indicator">
                          {active ? (sortState.direction === "asc" ? "▲" : "▼") : "↕"}
                        </span>
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {showSkeleton &&
              Array.from({ length: 5 }, (_, index) => (
                <tr aria-hidden="true" className="admin-skeleton-row" key={`skeleton-${index}`}>
                  {Array.from({ length: columnCount }, (_, cell) => (
                    <td key={cell}>
                      <span className="admin-skeleton" />
                    </td>
                  ))}
                </tr>
              ))}
            {rows.map((row) => {
              const checked = selection?.selected.has(row.id) ?? false;
              return (
                <tr className={checked ? "is-selected" : undefined} key={row.id}>
                  {selection && (
                    <td className="admin-select-cell">
                      <input
                        aria-label={`Chọn ${rowLabel ? rowLabel(row) : "dòng"}`}
                        checked={checked}
                        onChange={() => selection.toggle(row.id)}
                        type="checkbox"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td className={column.className} key={column.key}>
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
            {!loading && rows.length === 0 && (
              <tr>
                <td className="admin-table-empty" colSpan={columnCount}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Header sắp xếp cho các bảng tự dựng (ví dụ hộp thư liên hệ). */
export function SortableHeader({
  label,
  sortKey,
  sort,
  onSortChange,
}: {
  label: ReactNode;
  sortKey: string;
  sort: string | undefined;
  onSortChange: (value: string) => void;
}) {
  const state = parseSortParam(sort);
  const active = state?.key === sortKey;
  return (
    <th
      aria-sort={active ? (state.direction === "asc" ? "ascending" : "descending") : undefined}
    >
      <button
        className={`admin-sort-button${active ? " is-active" : ""}`}
        onClick={() => onSortChange(nextSortParam(state, sortKey))}
        type="button"
      >
        {label}
        <span aria-hidden="true" className="admin-sort-indicator">
          {active ? (state.direction === "asc" ? "▲" : "▼") : "↕"}
        </span>
      </button>
    </th>
  );
}

/** Nút công khai/nháp bấm được ngay trên dòng. */
export function PublishSwitch({
  isPublished,
  pending,
  onToggle,
  label,
}: {
  isPublished: boolean;
  pending?: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      aria-label={`${isPublished ? "Chuyển về nháp" : "Xuất bản"}: ${label}`}
      aria-pressed={isPublished}
      className={`admin-publish-switch${isPublished ? " is-published" : ""}`}
      disabled={pending}
      onClick={onToggle}
      title={isPublished ? "Bấm để chuyển về nháp" : "Bấm để xuất bản"}
      type="button"
    >
      <span aria-hidden="true" className="admin-publish-switch-track">
        <span className="admin-publish-switch-thumb" />
      </span>
      {isPublished ? "Đang công khai" : "Bản nháp"}
    </button>
  );
}

/** Ba nút thao tác hàng loạt cho nội dung có trạng thái xuất bản. */
export function ContentBulkButtons({
  disabled,
  onAction,
}: {
  disabled: boolean;
  onAction: (action: "publish" | "unpublish" | "delete") => void;
}) {
  return (
    <>
      <button
        className="admin-table-button"
        disabled={disabled}
        onClick={() => onAction("publish")}
        type="button"
      >
        Xuất bản
      </button>
      <button
        className="admin-table-button"
        disabled={disabled}
        onClick={() => onAction("unpublish")}
        type="button"
      >
        Chuyển về nháp
      </button>
      <button
        className="admin-table-button admin-table-danger"
        disabled={disabled}
        onClick={() => onAction("delete")}
        type="button"
      >
        Xóa
      </button>
    </>
  );
}
