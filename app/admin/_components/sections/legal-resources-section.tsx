"use client";

import { useCallback, useState, type FormEvent } from "react";
import { adminFetch, errorMessage, jsonBody } from "../../_lib/admin-api";
import { resourceTypeLabels } from "../../_lib/format";
import type {
  AdminLegalResource,
  LegalResourceInput,
  LegalResourceType,
  PageResponse,
} from "../../_lib/types";
import { useFeedback, usePagedList } from "../../_lib/use-paged-list";
import { DetailDialog, DetailItem, SourceLink } from "../detail-dialog";
import {
  EmptyRow,
  Feedback,
  Field,
  FormActions,
  Pagination,
  PublishStatus,
  PublishToggle,
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

const emptyForm: ResourceForm = {
  slug: "",
  title: "",
  summary: "",
  content: "",
  sourceUrl: "",
  isPublished: false,
};

/** Một component cho cả ba loại tài liệu: chính sách, quy định, hướng dẫn pháp lý. */
export function LegalResourcesSection({
  resourceType,
}: {
  resourceType: LegalResourceType;
}) {
  const typeLabel = resourceTypeLabels[resourceType];
  const loader = useCallback(
    (page: number, search: string) =>
      adminFetch<PageResponse<AdminLegalResource>>(
        `/legal-resources?${new URLSearchParams({
          page: String(page),
          limit: "25",
          q: search,
          type: resourceType,
        })}`,
      ),
    [resourceType],
  );
  const list = usePagedList(loader);
  const feedback = useFeedback();
  const [form, setForm] = useState<ResourceForm | null>(null);
  const [editingId, setEditingId] = useState("");
  const [detail, setDetail] = useState<AdminLegalResource | null>(null);
  const [saving, setSaving] = useState(false);
  const showSource = resourceType !== "policy";

  function startEdit(resource: AdminLegalResource) {
    setDetail(null);
    setEditingId(resource.id);
    setForm({
      slug: resource.slug,
      title: resource.title,
      summary: resource.summary,
      content: resource.content,
      sourceUrl: resource.sourceUrl ?? "",
      isPublished: resource.isPublished,
    });
    feedback.show("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    const payload: LegalResourceInput = {
      ...form,
      resourceType,
      sourceUrl: form.sourceUrl || null,
    };
    try {
      await adminFetch(
        editingId ? `/legal-resources/${editingId}` : "/legal-resources",
        { method: editingId ? "PATCH" : "POST", body: jsonBody(payload) },
      );
      setForm(null);
      await list.reload();
      feedback.show("Đã lưu tài liệu.");
    } catch (error) {
      feedback.show(errorMessage(error), true);
    } finally {
      setSaving(false);
    }
  }

  async function remove(resource: AdminLegalResource) {
    if (!window.confirm(`Xóa "${resource.title}"? Thao tác này không thể hoàn tác.`)) return;
    try {
      await adminFetch(`/legal-resources/${resource.id}`, { method: "DELETE" });
      if (editingId === resource.id) setForm(null);
      await list.reload();
      feedback.show("Đã xóa tài liệu.");
    } catch (error) {
      feedback.show(errorMessage(error), true);
    }
  }

  return (
    <>
      <Toolbar total={list.pageInfo.total} caption={`${typeLabel} trong hệ thống`}>
        <button
          className="admin-primary-button"
          onClick={() => {
            setEditingId("");
            setForm({ ...emptyForm });
          }}
          type="button"
        >
          + Tạo mới
        </button>
      </Toolbar>
      <Feedback message={feedback.message} isError={feedback.isError} />
      <Feedback message={list.error} isError />
      <SearchBox
        label={`Tìm trong ${typeLabel.toLowerCase()}`}
        value={list.search}
        onChange={list.setSearch}
      />
      <Pagination pageInfo={list.pageInfo} onPageChange={(page) => void list.goToPage(page)} />
      <div className="admin-workspace">
        {form && (
          <section className="admin-card admin-editor">
            <form onSubmit={save}>
              <h2>{editingId ? "Chỉnh sửa tài liệu" : `Thêm ${typeLabel.toLowerCase()}`}</h2>
              <p className="admin-form-note">
                Chỉ công bố thông tin đã được đơn vị có trách nhiệm xác minh. Nội dung
                pháp lý trên website không thay thế tư vấn pháp luật.
              </p>
              <div className="admin-form-grid">
                <Field form={form} name="slug" label="Slug" onChange={setForm} required maxLength={120} />
                <Field form={form} name="title" label="Tiêu đề" onChange={setForm} required maxLength={250} />
                <Field form={form} name="summary" label="Tóm tắt" onChange={setForm} required multiline rows={2} fullWidth maxLength={2000} />
                <Field form={form} name="content" label="Nội dung" onChange={setForm} required multiline rows={9} fullWidth maxLength={20000} />
                {showSource && (
                  <Field
                    form={form}
                    name="sourceUrl"
                    label="Nguồn tham khảo chính thức"
                    onChange={setForm}
                    fullWidth
                    type="url"
                    placeholder="https://"
                  />
                )}
              </div>
              <PublishToggle
                checked={form.isPublished}
                onChange={(isPublished) => setForm({ ...form, isPublished })}
              />
              <FormActions saving={saving} saveLabel="Lưu tài liệu" onCancel={() => setForm(null)} />
            </form>
          </section>
        )}
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
                        onEdit={() => startEdit(resource)}
                        onDelete={() => void remove(resource)}
                      />
                    </td>
                  </tr>
                ))}
                {!list.loading && list.items.length === 0 && (
                  <EmptyRow colSpan={5}>
                    Không có mục phù hợp. Hãy tạo nội dung mới hoặc điều chỉnh từ khóa tìm kiếm.
                  </EmptyRow>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      {detail && (
        <DetailDialog
          title={detail.title}
          slug={detail.slug}
          isPublished={detail.isPublished}
          badge={typeLabel}
          onClose={() => setDetail(null)}
          onEdit={() => startEdit(detail)}
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
