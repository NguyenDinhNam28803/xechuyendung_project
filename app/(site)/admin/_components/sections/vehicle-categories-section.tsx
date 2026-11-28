"use client";

import { useCallback } from "react";
import { adminFetch } from "../../_lib/admin-api";
import { formatDate } from "../../_lib/format";
import type { PageResponse, VehicleCategory, VehicleCategoryInput } from "../../_lib/types";
import { useEntityEditor } from "../../_lib/use-entity-editor";
import { apiQuery, usePagedList } from "../../_lib/use-paged-list";
import { DataTable, type Column } from "../data-table";
import { Drawer } from "../drawer";
import {
  Feedback,
  Field,
  FormActions,
  FormError,
  ListControls,
  Pagination,
  RowActions,
  SearchBox,
  Toolbar,
} from "../ui";

type CategoryForm = {
  name: string;
  description: string;
  sortOrder: string;
};

const emptyForm = (): CategoryForm => ({ name: "", description: "", sortOrder: "0" });

function toForm(category: VehicleCategory): CategoryForm {
  return {
    name: category.name,
    description: category.description,
    sortOrder: String(category.sortOrder),
  };
}

function toPayload(form: CategoryForm): VehicleCategoryInput {
  const sortOrder = Number(form.sortOrder);
  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 10_000) {
    throw new Error("Thứ tự hiển thị phải là số nguyên từ 0 đến 10.000.");
  }
  return { name: form.name.trim(), description: form.description.trim(), sortOrder };
}

/**
 * Danh mục xe dùng trong form xe. Đổi tên một danh mục sẽ đổi luôn danh mục
 * của các xe đang dùng tên cũ; chỉ xóa được danh mục không còn xe nào.
 */
export function VehicleCategoriesSection() {
  const loader = useCallback(
    (page: number, search: string) =>
      adminFetch<PageResponse<VehicleCategory>>(
        `/vehicle-categories?${apiQuery({ page, limit: 100, q: search })}`,
      ),
    [],
  );
  const list = usePagedList(loader);
  const editor = useEntityEditor<VehicleCategory, CategoryForm>({
    basePath: "/vehicle-categories",
    emptyForm,
    toForm,
    toPayload,
    onSaved: list.reload,
    savedMessage: "Đã lưu danh mục.",
    deletedMessage: "Đã xóa danh mục.",
  });
  const form = editor.form;
  const editing = list.items.find((item) => item.id === editor.editingId);

  const columns: Column<VehicleCategory>[] = [
    {
      key: "name",
      header: "Danh mục",
      cell: (category) => (
        <>
          <strong>{category.name}</strong>
          {category.description && <small>{category.description}</small>}
        </>
      ),
    },
    {
      key: "vehicleCount",
      header: "Số xe",
      className: "admin-numeric",
      cell: (category) => category.vehicleCount,
    },
    {
      key: "sortOrder",
      header: "Thứ tự",
      className: "admin-numeric",
      cell: (category) => category.sortOrder,
    },
    {
      key: "updatedAt",
      header: "Cập nhật",
      className: "admin-nowrap",
      cell: (category) => formatDate(category.updatedAt),
    },
    {
      key: "actions",
      header: "Hành động",
      cell: (category) => (
        <RowActions
          onEdit={() => editor.openEdit(category)}
          onDelete={
            category.vehicleCount === 0
              ? () => void editor.remove(category, category.name)
              : undefined
          }
        />
      ),
    },
  ];

  return (
    <>
      <Toolbar total={list.pageInfo.total} caption="Danh mục xe">
        <button className="admin-primary-button" onClick={editor.openCreate} type="button">
          + Thêm danh mục
        </button>
      </Toolbar>
      <Feedback message={list.error} isError />
      <ListControls>
        <SearchBox
          label="Tìm danh mục"
          onChange={list.setSearch}
          placeholder="Tên hoặc mô tả danh mục..."
          value={list.search}
        />
      </ListControls>
      <DataTable
        columns={columns}
        emptyMessage="Chưa có danh mục nào."
        loading={list.loading}
        minWidth={640}
        rows={list.items}
        title="Danh mục"
        total={list.pageInfo.total}
      />
      <p className="admin-chart-footnote">
        Danh mục đang có xe không xóa được — hãy chuyển các xe sang danh mục khác trước.
      </p>
      <Pagination pageInfo={list.pageInfo} onPageChange={(page) => void list.goToPage(page)} />

      {form && (
        <Drawer
          eyebrow="DANH MỤC XE"
          footer={
            <FormActions
              dirty={editor.dirty}
              onCancel={() => void editor.requestClose()}
              saveLabel="Lưu danh mục"
              saving={editor.saving}
            />
          }
          onRequestClose={() => void editor.requestClose()}
          onSubmit={(event) => void editor.submit(event)}
          title={editor.isEditing ? `Sửa: ${editing?.name ?? "danh mục"}` : "Thêm danh mục"}
        >
          {editor.isEditing && editing && editing.vehicleCount > 0 && (
            <p className="admin-form-note">
              Đổi tên sẽ cập nhật danh mục của {editing.vehicleCount} xe đang dùng “{editing.name}”.
            </p>
          )}
          <FormError message={editor.error} />
          <div className="admin-form-grid">
            <Field
              form={form}
              fullWidth
              label="Tên danh mục"
              maxLength={100}
              name="name"
              onChange={editor.setForm}
              required
            />
            <Field
              form={form}
              fullWidth
              label="Mô tả (tùy chọn)"
              maxLength={500}
              multiline
              name="description"
              onChange={editor.setForm}
              rows={2}
            />
            <Field
              form={form}
              label="Thứ tự hiển thị (nhỏ đứng trước)"
              name="sortOrder"
              onChange={editor.setForm}
              required
              type="number"
            />
          </div>
        </Drawer>
      )}
    </>
  );
}
