"use client";

import { useCallback, useState } from "react";
import { adminFetch } from "../../_lib/admin-api";
import { cleanSections, joinParagraphs, type ArticleSectionRow } from "../../_lib/content-fields";
import { autoSlug } from "../../_lib/slug";
import type { AdminArticle, ArticleInput, PageResponse } from "../../_lib/types";
import { useEntityEditor } from "../../_lib/use-entity-editor";
import { apiQuery, usePagedList } from "../../_lib/use-paged-list";
import { DetailDialog, DetailItem } from "../detail-dialog";
import { Drawer } from "../drawer";
import { SectionsEditor, SlugField } from "../form-editors";
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

type ArticleForm = {
  slug: string;
  category: string;
  title: string;
  summary: string;
  sections: ArticleSectionRow[];
  isPublished: boolean;
};

const emptyForm = (): ArticleForm => ({
  slug: "",
  category: "",
  title: "",
  summary: "",
  sections: [{ heading: "", paragraphs: "" }],
  isPublished: false,
});

const filterKeys = ["published"] as const;

function toForm(article: AdminArticle): ArticleForm {
  return {
    slug: article.slug,
    category: article.category,
    title: article.title,
    summary: article.summary,
    sections: article.sections.map((section) => ({
      heading: section.heading,
      paragraphs: joinParagraphs(section.paragraphs),
    })),
    isPublished: article.isPublished,
  };
}

function toPayload(form: ArticleForm): ArticleInput {
  const sections = cleanSections(form.sections);
  if (!sections.ok) throw new Error(sections.error);
  return {
    slug: form.slug.trim(),
    category: form.category,
    title: form.title,
    summary: form.summary,
    sections: sections.value,
    isPublished: form.isPublished,
  };
}

export function ArticlesSection() {
  const loader = useCallback(
    (page: number, search: string, filters: Record<string, string>) =>
      adminFetch<PageResponse<AdminArticle>>(
        `/articles?${apiQuery({ page, limit: 25, q: search, published: filters.published })}`,
      ),
    [],
  );
  const list = usePagedList(loader, { filterKeys });
  const editor = useEntityEditor<AdminArticle, ArticleForm>({
    basePath: "/articles",
    emptyForm,
    toForm,
    toPayload,
    onSaved: list.reload,
    savedMessage: "Đã lưu bài viết.",
    deletedMessage: "Đã xóa bài viết.",
  });
  const [detail, setDetail] = useState<AdminArticle | null>(null);
  const form = editor.form;

  return (
    <>
      <Toolbar total={list.pageInfo.total} caption="Bài viết trong hệ thống">
        <button className="admin-primary-button" onClick={editor.openCreate} type="button">
          + Tạo mới
        </button>
      </Toolbar>
      <Feedback message={list.error} isError />
      <ListControls>
        <SearchBox label="Tìm trong bài viết" value={list.search} onChange={list.setSearch} />
        <FilterTabs
          label="Lọc theo trạng thái"
          onChange={(value) => list.setFilter("published", value)}
          options={publishFilterOptions}
          value={list.filters.published ?? ""}
        />
      </ListControls>
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
                      onEdit={() => editor.openEdit(article)}
                      onDelete={() => void editor.remove(article, article.title)}
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
          eyebrow="BÀI VIẾT"
          footer={
            <FormActions
              dirty={editor.dirty}
              onCancel={() => void editor.requestClose()}
              saveLabel="Lưu bài viết"
              saving={editor.saving}
            />
          }
          onRequestClose={() => void editor.requestClose()}
          onSubmit={(event) => void editor.submit(event)}
          title={editor.isEditing ? "Chỉnh sửa bài viết" : "Thêm bài viết"}
          wide
        >
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
              hint={editor.isEditing ? "Đổi slug sẽ làm thay đổi đường dẫn công khai của bài viết." : undefined}
              onChange={(slug) => editor.setForm({ ...form, slug })}
              source={form.title}
              value={form.slug}
            />
            <Field form={form} name="category" label="Chuyên mục" onChange={editor.setForm} required maxLength={100} />
            <Field
              form={form}
              name="summary"
              label="Mô tả ngắn"
              onChange={editor.setForm}
              required
              multiline
              fullWidth
              maxLength={2000}
            />
            <SectionsEditor
              onChange={(sections) => editor.setForm({ ...form, sections })}
              value={form.sections}
            />
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
          onClose={() => setDetail(null)}
          onEdit={() => {
            setDetail(null);
            editor.openEdit(detail);
          }}
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
