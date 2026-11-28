"use client";

import { useCallback, useState } from "react";
import { adminFetch } from "../../_lib/admin-api";
import { formatDate, resourceTypeLabels } from "../../_lib/format";
import { autoSlug } from "../../_lib/slug";
import type {
  AdminLegalResource,
  LegalResourceInput,
  LegalResourceType,
  PageResponse,
} from "../../_lib/types";
import { useContentActions } from "../../_lib/use-content-actions";
import { useEntityEditor } from "../../_lib/use-entity-editor";
import { useSelection } from "../../_lib/use-selection";
import { apiQuery, usePagedList } from "../../_lib/use-paged-list";
import { DetailDialog, DetailItem, SourceLink } from "../detail-dialog";
import { Drawer } from "../drawer";
import { SlugField } from "../form-editors";
import {
  ContentBulkButtons,
  DataTable,
  PublishSwitch,
  type Column,
} from "../data-table";
import {
  Feedback,
  Field,
  FilterTabs,
  FormActions,
  FormError,
  ListControls,
  Pagination,
  PublishToggle,
  publishFilterOptions,
  RowActions,
  SearchBox,
  Toolbar,
} from "../ui";

type ResourceForm = {
  slug: string;
  title: string;
  summary: string;
  content: string;
  sourceUrl: string;
  isPublished: boolean;
};

const emptyForm = (): ResourceForm => ({
  slug: "",
  title: "",
  summary: "",
  content: "",
  sourceUrl: "",
  isPublished: false,
});

const filterKeys = ["published", "sort", "limit"] as const;

function toForm(resource: AdminLegalResource): ResourceForm {
  return {
    slug: resource.slug,
    title: resource.title,
    summary: resource.summary,
    content: resource.content,
    sourceUrl: resource.sourceUrl ?? "",
    isPublished: resource.isPublished,
  };
}

/** Một component cho cả ba loại tài liệu: chính sách, quy định, hướng dẫn pháp lý. */
export function LegalResourcesSection({ resourceType }: { resourceType: LegalResourceType }) {
  const typeLabel = resourceTypeLabels[resourceType];
  const showSource = resourceType !== "policy";
  const loader = useCallback(
    (page: number, search: string, filters: Record<string, string>) =>
      adminFetch<PageResponse<AdminLegalResource>>(
        `/legal-resources?${apiQuery({
          page,
          limit: Number(filters.limit) || 25,
          q: search,
          type: resourceType,
          published: filters.published,
          sort: filters.sort,
        })}`,
      ),
    [resourceType],
  );
  const list = usePagedList(loader, { filterKeys });
  const toPayload = useCallback(
    (form: ResourceForm): LegalResourceInput => ({
      ...form,
      slug: form.slug.trim(),
      resourceType,
      sourceUrl: form.sourceUrl.trim() || null,
    }),
    [resourceType],
  );
  const editor = useEntityEditor<AdminLegalResource, ResourceForm>({
    basePath: "/legal-resources",
    emptyForm,
    toForm,
    toPayload,
    onSaved: list.reload,
    savedMessage: "Đã lưu tài liệu.",
    deletedMessage: "Đã xóa tài liệu.",
  });
  const selection = useSelection(list.items.map((item) => item.id));
  const actions = useContentActions<AdminLegalResource>({
    basePath: "/legal-resources",
    noun: "tài liệu",
    updateItem: list.updateItem,
    reload: list.reload,
    onBulkDone: selection.clear,
  });
  const pageSize = Number(list.filters.limit) || 25;
  const [detail, setDetail] = useState<AdminLegalResource | null>(null);
  const form = editor.form;
  const columns: Column<AdminLegalResource>[] = [
    {
      key: "title",
      header: "Tên tài liệu",
      sortKey: "title",
      cell: (resource) => (
        <>
          <strong>{resource.title}</strong>
          <small>{resource.slug}</small>
        </>
      ),
    },
    {
      key: "summary",
      header: "Tóm tắt",
      className: "admin-table-summary",
      cell: (resource) => resource.summary || "—",
    },
    {
      key: "status",
      header: "Trạng thái",
      sortKey: "isPublished",
      cell: (resource) => (
        <PublishSwitch
          isPublished={resource.isPublished}
          label={resource.title}
          onToggle={() => void actions.togglePublished(resource)}
          pending={actions.isPending(resource.id)}
        />
      ),
    },
    {
      key: "updatedAt",
      header: "Cập nhật",
      sortKey: "updatedAt",
      className: "admin-nowrap",
      cell: (resource) => formatDate(resource.updatedAt),
    },
    {
      key: "actions",
      header: "Hành động",
      cell: (resource) => (
        <RowActions
          onDetail={() => setDetail(resource)}
          onEdit={() => editor.openEdit(resource)}
          onDelete={() => void editor.remove(resource, resource.title)}
        />
      ),
    },
  ];

  return (
    <>
      <Toolbar total={list.pageInfo.total} caption={`${typeLabel} trong hệ thống`}>
        <button className="admin-primary-button" onClick={editor.openCreate} type="button">
          + Tạo mới
        </button>
      </Toolbar>
      <Feedback message={list.error} isError />
      <ListControls>
        <SearchBox
          label={`Tìm trong ${typeLabel.toLowerCase()}`}
          value={list.search}
          onChange={list.setSearch}
        />
        <FilterTabs
          label="Lọc theo trạng thái"
          onChange={(value) => list.setFilter("published", value)}
          options={publishFilterOptions}
          value={list.filters.published ?? ""}
        />
      </ListControls>
      <DataTable
        bulkActions={
          <ContentBulkButtons
            disabled={actions.bulkRunning}
            onAction={(action) => void actions.runBulk(action, selection.ids)}
          />
        }
        columns={columns}
        loading={list.loading}
        minWidth={980}
        onPageSizeChange={(size) => list.setFilter("limit", size === 25 ? "" : String(size))}
        onSortChange={(sort) => list.setFilter("sort", sort)}
        pageSize={pageSize}
        rowLabel={(row) => row.title}
        rows={list.items}
        selection={selection}
        sort={list.filters.sort}
        title={typeLabel}
        total={list.pageInfo.total}
      />
      <Pagination pageInfo={list.pageInfo} onPageChange={(page) => void list.goToPage(page)} />

      {form && (
        <Drawer
          eyebrow={typeLabel.toUpperCase()}
          footer={
            <FormActions
              dirty={editor.dirty}
              onCancel={() => void editor.requestClose()}
              saveLabel="Lưu tài liệu"
              saving={editor.saving}
            />
          }
          onRequestClose={() => void editor.requestClose()}
          onSubmit={(event) => void editor.submit(event)}
          title={editor.isEditing ? "Chỉnh sửa tài liệu" : `Thêm ${typeLabel.toLowerCase()}`}
          wide
        >
          <p className="admin-form-note">
            Chỉ công bố thông tin đã được đơn vị có trách nhiệm xác minh. Nội dung pháp lý trên
            website không thay thế tư vấn pháp luật.
          </p>
          <FormError message={editor.error} />
          <div className="admin-form-grid">
            <label className="admin-full-width">
              Tiêu đề
              <input
                maxLength={250}
                onChange={(event) =>
                  editor.setForm({
                    ...form,
                    title: event.target.value,
                    slug: autoSlug(form.slug, form.title, event.target.value, !editor.isEditing),
                  })
                }
                required
                value={form.title}
              />
            </label>
            <SlugField
              onChange={(slug) => editor.setForm({ ...form, slug })}
              source={form.title}
              value={form.slug}
            />
            <Field
              form={form}
              name="summary"
              label="Tóm tắt"
              onChange={editor.setForm}
              required
              multiline
              rows={2}
              fullWidth
              maxLength={2000}
            />
            <Field
              form={form}
              name="content"
              label="Nội dung"
              onChange={editor.setForm}
              required
              multiline
              rows={12}
              fullWidth
              maxLength={20000}
            />
            {showSource && (
              <Field
                form={form}
                name="sourceUrl"
                label="Nguồn tham khảo chính thức"
                onChange={editor.setForm}
                fullWidth
                type="url"
                placeholder="https://"
              />
            )}
          </div>
          <PublishToggle
            checked={form.isPublished}
            onChange={(isPublished) => editor.setForm({ ...form, isPublished })}
          />
        </Drawer>
      )}

      {detail && (
        <DetailDialog
          title={detail.title}
          slug={detail.slug}
          isPublished={detail.isPublished}
          badge={typeLabel}
          onClose={() => setDetail(null)}
          onEdit={() => {
            setDetail(null);
            editor.openEdit(detail);
          }}
        >
          <DetailItem label="Tiêu đề">{detail.title}</DetailItem>
          <DetailItem label="Slug">{detail.slug}</DetailItem>
          <DetailItem label="Tóm tắt" full>
            {detail.summary || "Chưa có tóm tắt."}
          </DetailItem>
          <DetailItem label="Nội dung chi tiết" full prose>
            {detail.content}
          </DetailItem>
          <SourceLink url={detail.sourceUrl} />
        </DetailDialog>
      )}
    </>
  );
}
