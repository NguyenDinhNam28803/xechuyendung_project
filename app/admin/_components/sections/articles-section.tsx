"use client";

import { useCallback, useState, type FormEvent } from "react";
import { adminFetch, errorMessage, jsonBody } from "../../_lib/admin-api";
import type { AdminArticle, ArticleInput, PageResponse } from "../../_lib/types";
import { useFeedback, usePagedList } from "../../_lib/use-paged-list";
import { DetailDialog, DetailItem } from "../detail-dialog";
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

type ArticleForm = {
  slug: string;
  category: string;
  title: string;
  summary: string;
  sections: string;
  isPublished: boolean;
};

const emptyForm: ArticleForm = {
  slug: "",
  category: "",
  title: "",
  summary: "",
  sections: '[\n  {\n    "heading": "",\n    "paragraphs": [""]\n  }\n]',
  isPublished: false,
};

function toPayload(form: ArticleForm): ArticleInput {
  let sections: ArticleInput["sections"];
  try {
    sections = JSON.parse(form.sections) as ArticleInput["sections"];
  } catch {
    throw new Error("Nội dung bài viết phải là JSON hợp lệ.");
  }
  return { ...form, sections };
}

export function ArticlesSection() {
  const loader = useCallback(
    (page: number, search: string) =>
      adminFetch<PageResponse<AdminArticle>>(
        `/articles?${new URLSearchParams({ page: String(page), limit: "25", q: search })}`,
      ),
    [],
  );
  const list = usePagedList(loader);
  const feedback = useFeedback();
  const [form, setForm] = useState<ArticleForm | null>(null);
  const [editingId, setEditingId] = useState("");
  const [detail, setDetail] = useState<AdminArticle | null>(null);
  const [saving, setSaving] = useState(false);

  function startEdit(article: AdminArticle) {
    setDetail(null);
    setEditingId(article.id);
    setForm({
      slug: article.slug,
      category: article.category,
      title: article.title,
      summary: article.summary,
      sections: JSON.stringify(article.sections, null, 2),
      isPublished: article.isPublished,
    });
    feedback.show("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      await adminFetch(editingId ? `/articles/${editingId}` : "/articles", {
        method: editingId ? "PATCH" : "POST",
        body: jsonBody(toPayload(form)),
      });
      setForm(null);
      await list.reload();
      feedback.show("Đã lưu bài viết.");
    } catch (error) {
      feedback.show(errorMessage(error), true);
    } finally {
      setSaving(false);
    }
  }

  async function remove(article: AdminArticle) {
    if (!window.confirm(`Xóa "${article.title}"? Thao tác này không thể hoàn tác.`)) return;
    try {
      await adminFetch(`/articles/${article.id}`, { method: "DELETE" });
      if (editingId === article.id) setForm(null);
      await list.reload();
      feedback.show("Đã xóa bài viết.");
    } catch (error) {
      feedback.show(errorMessage(error), true);
    }
  }

  return (
    <>
      <Toolbar total={list.pageInfo.total} caption="Bài viết trong hệ thống">
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
      <SearchBox label="Tìm trong bài viết" value={list.search} onChange={list.setSearch} />
      <Pagination pageInfo={list.pageInfo} onPageChange={(page) => void list.goToPage(page)} />
      <div className="admin-workspace">
        {form && (
          <section className="admin-card admin-editor">
            <form onSubmit={save}>
              <h2>{editingId ? "Chỉnh sửa bài viết" : "Thêm bài viết"}</h2>
              <div className="admin-form-grid">
                <Field form={form} name="slug" label="Slug" onChange={setForm} required maxLength={120} />
                <Field form={form} name="category" label="Chuyên mục" onChange={setForm} required maxLength={100} />
                <Field form={form} name="title" label="Tiêu đề" onChange={setForm} required fullWidth maxLength={250} />
                <Field form={form} name="summary" label="Mô tả ngắn" onChange={setForm} required multiline fullWidth maxLength={2000} />
                <Field
                  form={form}
                  name="sections"
                  label="Nội dung (JSON: mảng các mục heading và paragraphs)"
                  onChange={setForm}
                  required
                  multiline
                  rows={12}
                  fullWidth
                  className="admin-code-input"
                />
              </div>
              <PublishToggle
                checked={form.isPublished}
                onChange={(isPublished) => setForm({ ...form, isPublished })}
              />
              <FormActions saving={saving} saveLabel="Lưu bài viết" onCancel={() => setForm(null)} />
            </form>
          </section>
        )}
        <section className="admin-card admin-list">
          <div className="admin-list-heading">
            <h2>Bài viết</h2>
            <span>{list.loading ? "Đang tải..." : `${list.pageInfo.total} mục`}</span>
          </div>
          <div className="admin-data-table-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Tiêu đề bài viết</th>
                  <th>Chuyên mục</th>
                  <th>Slug</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {list.items.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <strong>{article.title}</strong>
                    </td>
                    <td>{article.category}</td>
                    <td>
                      <code>{article.slug}</code>
                    </td>
                    <td>
                      <PublishStatus isPublished={article.isPublished} />
                    </td>
                    <td>
                      <RowActions
                        onDetail={() => setDetail(article)}
                        onEdit={() => startEdit(article)}
                        onDelete={() => void remove(article)}
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
          onClose={() => setDetail(null)}
          onEdit={() => startEdit(detail)}
        >
          <DetailItem label="Chuyên mục">{detail.category}</DetailItem>
          <DetailItem label="Slug">{detail.slug}</DetailItem>
          <DetailItem label="Tóm tắt" full>
            {detail.summary || "Chưa có tóm tắt."}
          </DetailItem>
          <DetailItem label="Nội dung bài viết" full>
            <div className="admin-detail-sections">
              {detail.sections.map((section, index) => (
                <section key={`${section.heading}-${index}`}>
                  <h3>{section.heading || `Phần ${index + 1}`}</h3>
                  {section.paragraphs.map((paragraph, paragraphIndex) => (
                    <p key={`${paragraphIndex}-${paragraph.slice(0, 20)}`}>{paragraph}</p>
                  ))}
                </section>
              ))}
            </div>
          </DetailItem>
        </DetailDialog>
      )}
    </>
  );
}
