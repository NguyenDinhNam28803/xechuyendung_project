"use client";

import { useCallback, useState, type FormEvent } from "react";
import { adminFetch, errorMessage, jsonBody } from "../../_lib/admin-api";
import { lines } from "../../_lib/format";
import type { AdminVehicle, PageResponse, VehicleInput } from "../../_lib/types";
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

type VehicleForm = {
  slug: string;
  name: string;
  make: string;
  category: string;
  description: string;
  artwork: VehicleInput["artwork"];
  images: string;
  badge: string;
  useCase: string;
  highlights: string;
  knownDetails: string;
  sourceUrl: string;
  isPublished: boolean;
};

const emptyForm: VehicleForm = {
  slug: "",
  name: "",
  make: "",
  category: "Xe tải",
  description: "",
  artwork: "cargo",
  images: "",
  badge: "Dữ liệu mẫu",
  useCase: "",
  highlights: "",
  knownDetails: "[]",
  sourceUrl: "",
  isPublished: false,
};

const categories = ["Xe tải", "Xe chữa cháy", "Xe cứu hộ", "Xe bồn / xe môi trường"];

function toForm(vehicle: AdminVehicle): VehicleForm {
  return {
    slug: vehicle.slug,
    name: vehicle.name,
    make: vehicle.make,
    category: vehicle.category,
    description: vehicle.description,
    artwork: vehicle.artwork,
    images: vehicle.images.join("\n"),
    badge: vehicle.badge,
    useCase: vehicle.useCase,
    highlights: vehicle.highlights.join("\n"),
    knownDetails: JSON.stringify(vehicle.knownDetails, null, 2),
    sourceUrl: vehicle.sourceUrl ?? "",
    isPublished: vehicle.isPublished,
  };
}

function toPayload(form: VehicleForm): VehicleInput {
  let knownDetails: VehicleInput["knownDetails"];
  try {
    knownDetails = JSON.parse(form.knownDetails) as VehicleInput["knownDetails"];
  } catch {
    throw new Error("Thông số phải là JSON hợp lệ, ví dụ [{\"label\":\"Tải trọng\",\"value\":\"5 tấn\"}].");
  }
  return {
    slug: form.slug,
    name: form.name,
    make: form.make,
    category: form.category,
    description: form.description,
    artwork: form.artwork,
    images: lines(form.images),
    badge: form.badge,
    useCase: form.useCase,
    highlights: lines(form.highlights),
    knownDetails,
    sourceUrl: form.sourceUrl || null,
    isPublished: form.isPublished,
  };
}

export function VehiclesSection() {
  const loader = useCallback(
    (page: number, search: string) =>
      adminFetch<PageResponse<AdminVehicle>>(
        `/vehicles?${new URLSearchParams({ page: String(page), limit: "25", q: search })}`,
      ),
    [],
  );
  const list = usePagedList(loader);
  const feedback = useFeedback();
  const [form, setForm] = useState<VehicleForm | null>(null);
  const [editingId, setEditingId] = useState("");
  const [detail, setDetail] = useState<AdminVehicle | null>(null);
  const [saving, setSaving] = useState(false);

  function startCreate() {
    setEditingId("");
    setForm({ ...emptyForm });
    feedback.show("");
  }

  function startEdit(vehicle: AdminVehicle) {
    setDetail(null);
    setEditingId(vehicle.id);
    setForm(toForm(vehicle));
    feedback.show("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    try {
      await adminFetch(editingId ? `/vehicles/${editingId}` : "/vehicles", {
        method: editingId ? "PATCH" : "POST",
        body: jsonBody(toPayload(form)),
      });
      setForm(null);
      await list.reload();
      feedback.show("Đã lưu thông tin xe.");
    } catch (error) {
      feedback.show(errorMessage(error), true);
    } finally {
      setSaving(false);
    }
  }

  async function remove(vehicle: AdminVehicle) {
    if (!window.confirm(`Xóa "${vehicle.name}"? Thao tác này không thể hoàn tác.`)) return;
    try {
      await adminFetch(`/vehicles/${vehicle.id}`, { method: "DELETE" });
      if (editingId === vehicle.id) setForm(null);
      await list.reload();
      feedback.show("Đã xóa xe.");
    } catch (error) {
      feedback.show(errorMessage(error), true);
    }
  }

  async function importDefaults() {
    if (
      !window.confirm(
        "Chỉ thêm các xe và bài viết mẫu chưa có (theo slug). Nội dung được nhập ở trạng thái NHÁP để bạn duyệt trước khi công khai. Tiếp tục?",
      )
    )
      return;
    setSaving(true);
    try {
      const result = await adminFetch<{
        vehiclesImported: number;
        articlesImported: number;
      }>("/import-defaults", { method: "POST" });
      await list.reload();
      feedback.show(
        `Đã nhập ${result.vehiclesImported} xe và ${result.articlesImported} bài viết mới ở trạng thái nháp. Nội dung trùng slug được giữ nguyên.`,
      );
    } catch (error) {
      feedback.show(errorMessage(error), true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Toolbar total={list.pageInfo.total} caption="Xe trong hệ thống">
        <button
          className="admin-secondary-button"
          disabled={saving}
          onClick={() => void importDefaults()}
          type="button"
        >
          Nhập nội dung mẫu
        </button>
        <button className="admin-primary-button" onClick={startCreate} type="button">
          + Tạo mới
        </button>
      </Toolbar>
      <Feedback message={feedback.message} isError={feedback.isError} />
      <Feedback message={list.error} isError />
      <SearchBox label="Tìm trong xe" value={list.search} onChange={list.setSearch} />
      <Pagination pageInfo={list.pageInfo} onPageChange={(page) => void list.goToPage(page)} />
      <div className="admin-workspace">
        {form && (
          <section className="admin-card admin-editor">
            <form onSubmit={save}>
              <h2>{editingId ? "Chỉnh sửa xe" : "Thêm xe"}</h2>
              <div className="admin-form-grid">
                <Field form={form} name="slug" label="Slug" onChange={setForm} required maxLength={120} />
                <Field form={form} name="name" label="Tên xe" onChange={setForm} required maxLength={200} />
                <Field form={form} name="make" label="Hãng xe" onChange={setForm} required maxLength={120} />
                <label>
                  Danh mục
                  <select
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                    value={form.category}
                  >
                    {categories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Kiểu minh họa
                  <select
                    onChange={(event) =>
                      setForm({ ...form, artwork: event.target.value as VehicleForm["artwork"] })
                    }
                    value={form.artwork}
                  >
                    <option value="cargo">Xe tải</option>
                    <option value="fire">Xe chữa cháy</option>
                    <option value="rescue">Xe cứu hộ</option>
                  </select>
                </label>
                <Field form={form} name="badge" label="Nhãn" onChange={setForm} required maxLength={120} />
                <Field form={form} name="description" label="Mô tả" onChange={setForm} multiline fullWidth required />
                <Field
                  form={form}
                  name="images"
                  label="Ảnh (mỗi dòng một URL HTTPS hoặc đường dẫn nội bộ)"
                  onChange={setForm}
                  multiline
                  fullWidth
                />
                <Field form={form} name="useCase" label="Mục đích sử dụng" onChange={setForm} multiline rows={2} fullWidth required />
                <Field
                  form={form}
                  name="highlights"
                  label="Điểm nổi bật (mỗi dòng một ý)"
                  onChange={setForm}
                  multiline
                  fullWidth
                  required
                />
                <Field
                  form={form}
                  name="knownDetails"
                  label={<>Thông số (JSON dạng [{`{"label":"Tên","value":"Giá trị"}`}])</>}
                  onChange={setForm}
                  multiline
                  rows={6}
                  fullWidth
                  required
                  className="admin-code-input"
                />
                <Field form={form} name="sourceUrl" label="URL nguồn tham khảo" onChange={setForm} fullWidth type="url" />
              </div>
              <PublishToggle
                checked={form.isPublished}
                onChange={(isPublished) => setForm({ ...form, isPublished })}
              />
              <FormActions saving={saving} saveLabel="Lưu xe" onCancel={() => setForm(null)} />
            </form>
          </section>
        )}
        <section className="admin-card admin-list">
          <div className="admin-list-heading">
            <h2>Xe</h2>
            <span>{list.loading ? "Đang tải..." : `${list.pageInfo.total} mục`}</span>
          </div>
          <div className="admin-data-table-wrap">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Tên xe</th>
                  <th>Hãng xe</th>
                  <th>Danh mục</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {list.items.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td>
                      <strong>{vehicle.name}</strong>
                      <small>{vehicle.slug}</small>
                    </td>
                    <td>{vehicle.make}</td>
                    <td>{vehicle.category}</td>
                    <td>
                      <PublishStatus isPublished={vehicle.isPublished} />
                    </td>
                    <td>
                      <RowActions
                        onDetail={() => setDetail(vehicle)}
                        onEdit={() => startEdit(vehicle)}
                        onDelete={() => void remove(vehicle)}
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
          title={detail.name}
          slug={detail.slug}
          isPublished={detail.isPublished}
          onClose={() => setDetail(null)}
          onEdit={() => startEdit(detail)}
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
