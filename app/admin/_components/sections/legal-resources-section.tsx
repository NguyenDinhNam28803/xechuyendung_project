"use client";

import { useCallback, useState } from "react";
import { adminFetch } from "../../_lib/admin-api";
import { resourceTypeLabels } from "../../_lib/format";
import { autoSlug } from "../../_lib/slug";
import type {
  AdminLegalResource,
  LegalResourceInput,
  LegalResourceType,
  PageResponse,
} from "../../_lib/types";
import { useEntityEditor } from "../../_lib/use-entity-editor";
import { apiQuery, usePagedList } from "../../_lib/use-paged-list";
import { DetailDialog, DetailItem, SourceLink } from "../detail-dialog";
import { Drawer } from "../drawer";
import { SlugField } from "../form-editors";
import {
  EmptyRow,
  Feedback,
  Field,
  FilterTabs,
  FormActions,
  FormError,
  ListControls,
  Pagination,
  PublishStatus,
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

const filterKeys = ["published"] as const;

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
          limit: 25,
          q: search,
          type: resourceType,
          published: filters.published,
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
  const [detail, setDetail] = useState<AdminLegalResource | null>(null);
  const form = editor.form;

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
      <section className="admin-card admin-list">
        <div className="admin-list-heading">
          <h2>{typeLabel}</h2>
          <span>{list.loading ? "Đang tải..." : `${list.pageInfo.total} mục`}</span>
        </div>
        <div className="admin-data-table-wrap">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Tên tài liệu</th>
                <th>Slug</th>
                <th>Tóm tắt</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {list.items.map((resource) => (
                <tr key={resource.id}>
                  <td>
                    <strong>{resource.title}</strong>
                    <small>{typeLabel}</small>
                  </td>
                  <td>
                    <code>{resource.slug}</code>
                  </td>
                  <td className="admin-table-summary">{resource.summary || "—"}</td>
                  <td>
                    <PublishStatus isPublished={resource.isPublished} />
                  </td>
                  <td>
                    <RowActions
                      onDetail={() => setDetail(resource)}
                      onEdit={() => editor.openEdit(resource)}
                      onDelete={() => void editor.remove(resource, resource.title)}
                    />
                  </td>
                </tr>
              ))}
              {!list.loading && list.items.length === 0 && (
                <EmptyRow colSpan={5}>
                  Không có mục phù hợp. Hãy tạo nội dung mới hoặc điều chỉnh từ khóa/bộ lọc.
                </EmptyRow>
              )}
            </tbody>
          </table>
        </div>
      </section>
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
