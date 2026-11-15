"use client";

import { useCallback, useState } from "react";
import { adminFetch, errorMessage } from "../../_lib/admin-api";
import { cleanImages, cleanSpecs, type SpecRow } from "../../_lib/content-fields";
import { formatDate, lines } from "../../_lib/format";
import { autoSlug } from "../../_lib/slug";
import type { AdminVehicle, PageResponse, VehicleInput } from "../../_lib/types";
import { useContentActions } from "../../_lib/use-content-actions";
import { useEntityEditor } from "../../_lib/use-entity-editor";
import { useVehicleCategoryNames } from "../../_lib/use-vehicle-categories";
import { useSelection } from "../../_lib/use-selection";
import { apiQuery, usePagedList } from "../../_lib/use-paged-list";
import { DetailDialog, DetailItem, SourceLink } from "../detail-dialog";
import { Drawer } from "../drawer";
import { ImageListEditor, SlugField, SpecsEditor } from "../form-editors";
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
import { useUiFeedback } from "../ui-feedback";

type VehicleForm = {
  slug: string;
  name: string;
  make: string;
  category: string;
  description: string;
  artwork: VehicleInput["artwork"];
  images: string[];
  badge: string;
  useCase: string;
  highlights: string;
  knownDetails: SpecRow[];
  sourceUrl: string;
  isPublished: boolean;
};

const emptyForm = (): VehicleForm => ({
  slug: "",
  name: "",
  make: "",
  category: "Xe tải",
  description: "",
  artwork: "cargo",
  images: [],
  badge: "Dữ liệu mẫu",
  useCase: "",
  highlights: "",
  knownDetails: [{ label: "", value: "" }],
  sourceUrl: "",
  isPublished: false,
});

const filterKeys = ["published", "sort", "limit"] as const;

function toForm(vehicle: AdminVehicle): VehicleForm {
  return {
    slug: vehicle.slug,
    name: vehicle.name,
    make: vehicle.make,
    category: vehicle.category,
    description: vehicle.description,
    artwork: vehicle.artwork,
    images: [...vehicle.images],
    badge: vehicle.badge,
    useCase: vehicle.useCase,
    highlights: vehicle.highlights.join("\n"),
    knownDetails: vehicle.knownDetails.map((spec) => ({ ...spec })),
    sourceUrl: vehicle.sourceUrl ?? "",
    isPublished: vehicle.isPublished,
  };
}

function toPayload(form: VehicleForm): VehicleInput {
  const images = cleanImages(form.images);
  if (!images.ok) throw new Error(images.error);
  const knownDetails = cleanSpecs(form.knownDetails);
  if (!knownDetails.ok) throw new Error(knownDetails.error);
  const highlights = lines(form.highlights);
  if (highlights.length === 0) throw new Error("Cần ít nhất một điểm nổi bật.");
  return {
    slug: form.slug.trim(),
    name: form.name,
    make: form.make,
    category: form.category,
    description: form.description,
    artwork: form.artwork,
    images: images.value,
    badge: form.badge,
    useCase: form.useCase,
    highlights,
    knownDetails: knownDetails.value,
    sourceUrl: form.sourceUrl.trim() || null,
    isPublished: form.isPublished,
  };
}

const columns = (
  actions: ReturnType<typeof useContentActions<AdminVehicle>>,
  open: { detail: (row: AdminVehicle) => void; edit: (row: AdminVehicle) => void; remove: (row: AdminVehicle) => void },
): Column<AdminVehicle>[] => [
  {
    key: "name",
    header: "Tên xe",
    sortKey: "name",
    cell: (vehicle) => (
      <>
        <strong>{vehicle.name}</strong>
        <small>{vehicle.slug}</small>
      </>
    ),
  },
  { key: "make", header: "Hãng xe", sortKey: "make", cell: (vehicle) => vehicle.make },
  { key: "category", header: "Danh mục", sortKey: "category", cell: (vehicle) => vehicle.category },
  {
    key: "status",
    header: "Trạng thái",
    sortKey: "isPublished",
    cell: (vehicle) => (
      <PublishSwitch
        isPublished={vehicle.isPublished}
        label={vehicle.name}
        onToggle={() => void actions.togglePublished(vehicle)}
        pending={actions.isPending(vehicle.id)}
      />
    ),
  },
  {
    key: "updatedAt",
    header: "Cập nhật",
    sortKey: "updatedAt",
    className: "admin-nowrap",
    cell: (vehicle) => formatDate(vehicle.updatedAt),
  },
  {
    key: "actions",
    header: "Hành động",
    cell: (vehicle) => (
      <RowActions
        onDetail={() => open.detail(vehicle)}
        onEdit={() => open.edit(vehicle)}
        onDelete={() => open.remove(vehicle)}
      />
    ),
  },
];

export function VehiclesSection() {
  const { toast, confirm } = useUiFeedback();
  const loader = useCallback(
    (page: number, search: string, filters: Record<string, string>) =>
      adminFetch<PageResponse<AdminVehicle>>(
        `/vehicles?${apiQuery({
          page,
          limit: Number(filters.limit) || 25,
          q: search,
          published: filters.published,
          sort: filters.sort,
        })}`,
      ),
    [],
  );
  const list = usePagedList(loader, { filterKeys });
  const editor = useEntityEditor<AdminVehicle, VehicleForm>({
    basePath: "/vehicles",
    emptyForm,
    toForm,
    toPayload,
    onSaved: list.reload,
    savedMessage: "Đã lưu thông tin xe.",
    deletedMessage: "Đã xóa xe.",
  });
  const selection = useSelection(list.items.map((item) => item.id));
  const actions = useContentActions<AdminVehicle>({
    basePath: "/vehicles",
    noun: "xe",
    updateItem: list.updateItem,
    reload: list.reload,
    onBulkDone: selection.clear,
  });
  const pageSize = Number(list.filters.limit) || 25;
  const [detail, setDetail] = useState<AdminVehicle | null>(null);
  const [importing, setImporting] = useState(false);
  const categories = useVehicleCategoryNames();
  const form = editor.form;

  async function importDefaults() {
    const accepted = await confirm({
      title: "Nhập nội dung mẫu?",
      message:
        "Chỉ thêm các xe và bài viết mẫu chưa có (theo slug). Nội dung được nhập ở trạng thái NHÁP để bạn duyệt trước khi công khai.",
      confirmLabel: "Nhập nội dung",
    });
    if (!accepted) return;
    setImporting(true);
    try {
      const result = await adminFetch<{ vehiclesImported: number; articlesImported: number }>(
        "/import-defaults",
        { method: "POST" },
      );
      await list.reload();
      toast(
        `Đã nhập ${result.vehiclesImported} xe và ${result.articlesImported} bài viết mới ở trạng thái nháp.`,
      );
    } catch (error) {
      toast(errorMessage(error), "error");
    } finally {
      setImporting(false);
    }
  }

  return (
    <>
      <Toolbar total={list.pageInfo.total} caption="Xe trong hệ thống">
        <button
          className="admin-secondary-button"
          disabled={importing}
          onClick={() => void importDefaults()}
          type="button"
        >
          {importing ? "Đang nhập..." : "Nhập nội dung mẫu"}
        </button>
        <button className="admin-primary-button" onClick={editor.openCreate} type="button">
          + Tạo mới
        </button>
      </Toolbar>
      <Feedback message={list.error} isError />
      <ListControls>
        <SearchBox label="Tìm trong xe" value={list.search} onChange={list.setSearch} />
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
        columns={columns(actions, {
          detail: setDetail,
          edit: editor.openEdit,
          remove: (vehicle) => void editor.remove(vehicle, vehicle.name),
        })}
        loading={list.loading}
        minWidth={980}
        onPageSizeChange={(size) => list.setFilter("limit", size === 25 ? "" : String(size))}
        onSortChange={(sort) => list.setFilter("sort", sort)}
        pageSize={pageSize}
        rowLabel={(vehicle) => vehicle.name}
        rows={list.items}
        selection={selection}
        sort={list.filters.sort}
        title="Xe"
        total={list.pageInfo.total}
      />
      <Pagination pageInfo={list.pageInfo} onPageChange={(page) => void list.goToPage(page)} />

      {form && (
        <Drawer
          eyebrow="DANH MỤC XE"
          footer={
            <FormActions
              dirty={editor.dirty}
              onCancel={() => void editor.requestClose()}
              saveLabel="Lưu xe"
              saving={editor.saving}
            />
          }
          onRequestClose={() => void editor.requestClose()}
          onSubmit={(event) => void editor.submit(event)}
          title={editor.isEditing ? `Sửa: ${form.name || "xe"}` : "Thêm xe"}
          wide
        >
          <FormError message={editor.error} />
          <div className="admin-form-grid">
            <label>
              Tên xe
              <input
                maxLength={200}
                onChange={(event) =>
                  editor.setForm({
                    ...form,
                    name: event.target.value,
                    slug: autoSlug(form.slug, form.name, event.target.value, !editor.isEditing),
                  })
                }
                required
                value={form.name}
              />
            </label>
            <SlugField
              hint={editor.isEditing ? "Đổi slug sẽ làm thay đổi đường dẫn công khai của xe." : undefined}
              onChange={(slug) => editor.setForm({ ...form, slug })}
              source={form.name}
              value={form.slug}
            />
            <Field form={form} name="make" label="Hãng xe" onChange={editor.setForm} required maxLength={120} />
            <label>
              Danh mục
              <select
                onChange={(event) => editor.setForm({ ...form, category: event.target.value })}
                value={form.category}
              >
                {[...new Set([...categories, form.category])].map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label>
              Kiểu minh họa
              <select
                onChange={(event) =>
                  editor.setForm({ ...form, artwork: event.target.value as VehicleForm["artwork"] })
                }
                value={form.artwork}
              >
                <option value="cargo">Xe tải</option>
                <option value="fire">Xe chữa cháy</option>
                <option value="rescue">Xe cứu hộ</option>
              </select>
            </label>
            <Field form={form} name="badge" label="Nhãn" onChange={editor.setForm} required maxLength={120} />
            <Field
              form={form}
              name="description"
              label="Mô tả"
              onChange={editor.setForm}
              multiline
              fullWidth
              required
              maxLength={5000}
            />
            <Field
              form={form}
              name="useCase"
              label="Mục đích sử dụng"
              onChange={editor.setForm}
              multiline
              rows={2}
              fullWidth
              required
              maxLength={1000}
            />
            <Field
              form={form}
              name="highlights"
              label="Điểm nổi bật (mỗi dòng một ý)"
              onChange={editor.setForm}
              multiline
              fullWidth
              required
            />
            <SpecsEditor
              onChange={(knownDetails) => editor.setForm({ ...form, knownDetails })}
              value={form.knownDetails}
            />
            <ImageListEditor onChange={(images) => editor.setForm({ ...form, images })} value={form.images} />
            <Field
              form={form}
              name="sourceUrl"
              label="URL nguồn tham khảo"
              onChange={editor.setForm}
              fullWidth
              type="url"
              placeholder="https://"
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
          title={detail.name}
          slug={detail.slug}
          isPublished={detail.isPublished}
          onClose={() => setDetail(null)}
          onEdit={() => {
            setDetail(null);
            editor.openEdit(detail);
          }}
        >
          <DetailItem label="Hãng xe">{detail.make}</DetailItem>
          <DetailItem label="Danh mục">{detail.category}</DetailItem>
          <DetailItem label="Nhãn">{detail.badge}</DetailItem>
          <DetailItem label="Kiểu minh họa">{detail.artwork}</DetailItem>
          <DetailItem label="Mô tả" full prose>
            {detail.description}
          </DetailItem>
          <DetailItem label="Mục đích sử dụng" full prose>
            {detail.useCase}
          </DetailItem>
          <DetailItem label="Điểm nổi bật">
            {detail.highlights.length > 0 ? (
              <ul>
                {detail.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            ) : (
              "Chưa có thông tin."
            )}
          </DetailItem>
          <DetailItem label="Thông số">
            {detail.knownDetails.length > 0 ? (
              <dl className="admin-detail-specs">
                {detail.knownDetails.map((spec) => (
                  <div key={spec.label}>
                    <dt>{spec.label}</dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              "Chưa có thông số."
            )}
          </DetailItem>
          <DetailItem label="Hình ảnh" full>
            {detail.images.length > 0 ? (
              <ul className="admin-detail-images">
                {detail.images.map((image) => (
                  <li key={image}>{image}</li>
                ))}
              </ul>
            ) : (
              "Chưa có hình ảnh."
            )}
          </DetailItem>
          <SourceLink url={detail.sourceUrl} />
        </DetailDialog>
      )}
    </>
  );
}
