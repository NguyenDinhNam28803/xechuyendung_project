"use client";

import type { ReactNode } from "react";
import type { PageInfo } from "../_lib/types";

export function Feedback({
  message,
  isError,
}: {
  message: string;
  isError?: boolean;
}) {
  if (!message) return null;
  return (
    <p
      className={`admin-feedback${isError ? " admin-feedback-error" : ""}`}
      role="status"
    >
      {message}
    </p>
  );
}

export function Toolbar({
  total,
  caption,
  children,
}: {
  total: number;
  caption: string;
  children?: ReactNode;
}) {
  return (
    <div className="admin-toolbar">
      <div>
        <strong>{total} mục</strong>
        <span className="admin-toolbar-caption">{caption}</span>
      </div>
      <div className="admin-toolbar-actions">{children}</div>
    </div>
  );
}

export function SearchBox({
  label,
  value,
  onChange,
  placeholder = "Nhập tên, slug hoặc chuyên mục...",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="admin-search">
      {label}
      <input
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

export function Pagination({
  pageInfo,
  onPageChange,
}: {
  pageInfo: PageInfo;
  onPageChange: (page: number) => void;
}) {
  if (pageInfo.totalPages <= 1) return null;
  return (
    <nav className="admin-pagination" aria-label="Phân trang danh sách">
      <span>
        Trang {pageInfo.page}/{pageInfo.totalPages} · {pageInfo.total} mục
      </span>
      <div>
        <button
          disabled={pageInfo.page <= 1}
          onClick={() => onPageChange(pageInfo.page - 1)}
          type="button"
        >
          Trước
        </button>
        <button
          disabled={pageInfo.page >= pageInfo.totalPages}
          onClick={() => onPageChange(pageInfo.page + 1)}
          type="button"
        >
          Tiếp
        </button>
      </div>
    </nav>
  );
}

export function PublishStatus({ isPublished }: { isPublished: boolean }) {
  return (
    <span className={`admin-table-status ${isPublished ? "is-published" : ""}`}>
      {isPublished ? "Đang công khai" : "Bản nháp"}
    </span>
  );
}

export function EmptyRow({
  colSpan,
  children,
}: {
  colSpan: number;
  children: ReactNode;
}) {
  return (
    <tr>
      <td className="admin-table-empty" colSpan={colSpan}>
        {children}
      </td>
    </tr>
  );
}

export function RowActions({
  onDetail,
  onEdit,
  onDelete,
}: {
  onDetail?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="admin-table-actions">
      {onDetail && (
        <button className="admin-table-button" onClick={onDetail} type="button">
          Chi tiết
        </button>
      )}
      {onEdit && (
        <button className="admin-table-button" onClick={onEdit} type="button">
          Sửa
        </button>
      )}
      {onDelete && (
        <button
          className="admin-table-button admin-table-danger"
          onClick={onDelete}
          type="button"
        >
          Xóa
        </button>
      )}
    </div>
  );
}

/** Ô nhập điều khiển bởi một trường của object form. */
export function Field<Form extends Record<string, unknown>>({
  form,
  name,
  label,
  onChange,
  multiline,
  rows = 3,
  fullWidth,
  className,
  ...inputProps
}: {
  form: Form;
  name: keyof Form & string;
  label: ReactNode;
  onChange: (next: Form) => void;
  multiline?: boolean;
  rows?: number;
  fullWidth?: boolean;
  className?: string;
  required?: boolean;
  maxLength?: number;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
}) {
  const value = String(form[name] ?? "");
  const update = (next: string) => onChange({ ...form, [name]: next });
  return (
    <label className={fullWidth ? "admin-full-width" : undefined}>
      {label}
      {multiline ? (
        <textarea
          className={className}
          onChange={(event) => update(event.target.value)}
          rows={rows}
          value={value}
          {...inputProps}
        />
      ) : (
        <input
          className={className}
          onChange={(event) => update(event.target.value)}
          value={value}
          {...inputProps}
        />
      )}
    </label>
  );
}

export function PublishToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="admin-publish-toggle">
      <input
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />{" "}
      Hiển thị công khai
    </label>
  );
}

export function FormActions({
  saving,
  saveLabel,
  onCancel,
}: {
  saving: boolean;
  saveLabel: string;
  onCancel: () => void;
}) {
  return (
    <div className="admin-form-actions">
      <button className="admin-primary-button" disabled={saving} type="submit">
        {saving ? "Đang lưu..." : saveLabel}
      </button>
      <button className="admin-secondary-button" onClick={onCancel} type="button">
        Hủy
      </button>
    </div>
  );
}
