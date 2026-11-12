"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminFetch, errorMessage, jsonBody } from "../../_lib/admin-api";
import {
  contactStatuses,
  countContactsByStatus,
  notifyContactsChanged,
  searchContacts,
} from "../../_lib/contact-stats";
import { contactStatusLabels, formatDate } from "../../_lib/format";
import type { ContactStatus, ContactSubmission } from "../../_lib/types";
import { usePagedList } from "../../_lib/use-paged-list";
import { DetailItem } from "../detail-dialog";
import { Drawer } from "../drawer";
import {
  EmptyRow,
  Feedback,
  FilterTabs,
  ListControls,
  Pagination,
  SearchBox,
  Toolbar,
  type FilterOption,
} from "../ui";
import { useUiFeedback } from "../ui-feedback";

const filterKeys = ["status"] as const;

function isContactStatus(value: string | undefined): value is ContactStatus {
  return contactStatuses.includes(value as ContactStatus);
}

export function ContactStatusBadge({ status }: { status: ContactStatus }) {
  return (
    <span className={`admin-contact-status status-${status}`}>{contactStatusLabels[status]}</span>
  );
}

export function ContactSubmissionsSection() {
  const { toast, confirm } = useUiFeedback();
  // Từ khóa đi trong body POST và không được ghi lên URL, để tên/số điện thoại
  // không nằm trong lịch sử trình duyệt hay log truy cập.
  const loader = useCallback(
    (page: number, search: string, filters: Record<string, string>) =>
      searchContacts({
        page,
        limit: 25,
        search,
        status: isContactStatus(filters.status) ? filters.status : undefined,
      }),
    [],
  );
  const list = usePagedList(loader, { filterKeys, persistSearch: false });
  const [counts, setCounts] = useState<Record<ContactStatus | "all", number> | null>(null);
  const [selected, setSelected] = useState<ContactSubmission | null>(null);
  const [nextStatus, setNextStatus] = useState<ContactStatus>("new");
  const [saving, setSaving] = useState(false);

  const refreshCounts = useCallback(() => {
    countContactsByStatus()
      .then(setCounts)
      .catch(() => setCounts(null));
  }, []);

  useEffect(() => {
    refreshCounts();
  }, [refreshCounts]);

  async function afterChange(message: string) {
    await list.reload();
    refreshCounts();
    notifyContactsChanged();
    toast(message);
  }

  function open(submission: ContactSubmission) {
    setSelected(submission);
    setNextStatus(submission.status);
  }

  async function updateStatus(submission: ContactSubmission, status: ContactStatus) {
    setSaving(true);
    try {
      await adminFetch(`/contact-submissions/${submission.id}/status`, {
        method: "PATCH",
        body: jsonBody({ status }),
      });
      setSelected(null);
      await afterChange(`Đã chuyển yêu cầu của ${submission.name} sang "${contactStatusLabels[status]}".`);
    } catch (error) {
      toast(errorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(submission: ContactSubmission) {
    const accepted = await confirm({
      title: `Xóa yêu cầu của ${submission.name}?`,
      message: "Thông tin liên hệ sẽ bị xóa vĩnh viễn khỏi hệ thống.",
      confirmLabel: "Xóa yêu cầu",
      danger: true,
    });
    if (!accepted) return;
    try {
      await adminFetch(`/contact-submissions/${submission.id}`, { method: "DELETE" });
      setSelected(null);
      await afterChange("Đã xóa yêu cầu liên hệ.");
    } catch (error) {
      toast(errorMessage(error), "error");
    }
  }

  const statusOptions: FilterOption[] = [
    { value: "", label: "Tất cả", count: counts?.all },
    ...contactStatuses.map((status) => ({
      value: status,
      label: contactStatusLabels[status],
      count: counts?.[status],
    })),
  ];

  return (
    <>
      <Toolbar total={list.pageInfo.total} caption="Yêu cầu liên hệ phù hợp" />
      <Feedback message={list.error} isError />
      <FilterTabs
        label="Lọc theo trạng thái xử lý"
        onChange={(value) => list.setFilter("status", value)}
        options={statusOptions}
        value={list.filters.status ?? ""}
      />
      <ListControls>
        <SearchBox
          label="Tìm trong yêu cầu liên hệ"
          value={list.search}
          onChange={list.setSearch}
          placeholder="Tên, số điện thoại, khu vực hoặc nội dung..."
        />
      </ListControls>
      <section className="admin-card admin-contacts">
        <div className="admin-list-heading">
          <div>
            <h2>Yêu cầu tư vấn từ khách hàng</h2>
            <p>
              Chỉ dùng thông tin liên hệ để phản hồi yêu cầu. Lịch sử hoạt động không lưu tên, số
              điện thoại hay nội dung liên hệ. Hệ thống tự xóa yêu cầu sau 90 ngày.
            </p>
          </div>
          <span>{list.loading ? "Đang tải..." : `${list.pageInfo.total} yêu cầu`}</span>
        </div>
        <div className="admin-data-table-wrap">
          <table className="admin-data-table admin-contact-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Liên hệ</th>
                <th>Nhu cầu</th>
                <th>Khu vực / xe</th>
                <th>Nội dung</th>
                <th>Ngày gửi</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {list.items.map((submission) => (
                <tr className={submission.status === "new" ? "is-unread" : undefined} key={submission.id}>
                  <td>
                    <strong>{submission.name}</strong>
                    <ContactStatusBadge status={submission.status} />
                  </td>
                  <td>
                    <a href={`tel:${submission.phone}`}>{submission.phone}</a>
                  </td>
                  <td>{submission.category}</td>
                  <td>
                    {submission.location || "—"}
                    {submission.vehicleSlug && <small>{submission.vehicleSlug}</small>}
                  </td>
                  <td className="admin-contact-message-cell">
                    {submission.message
                      ? `${submission.message.slice(0, 80)}${submission.message.length > 80 ? "…" : ""}`
                      : "—"}
                  </td>
                  <td>{formatDate(submission.createdAt)}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="admin-table-button" onClick={() => open(submission)} type="button">
                        Xử lý
                      </button>
                      <button
                        className="admin-table-button admin-table-danger"
                        onClick={() => void remove(submission)}
                        type="button"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!list.loading && list.items.length === 0 && (
                <EmptyRow colSpan={7}>
                  {list.search || list.filters.status
                    ? "Không có yêu cầu nào khớp với bộ lọc hoặc từ khóa."
                    : "Chưa có yêu cầu liên hệ nào."}
                </EmptyRow>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <Pagination pageInfo={list.pageInfo} onPageChange={(page) => void list.goToPage(page)} />

      {selected && (
        <Drawer
          eyebrow="YÊU CẦU TƯ VẤN"
          footer={
            <>
              <button
                className="admin-danger-button admin-footer-start"
                onClick={() => void remove(selected)}
                type="button"
              >
                Xóa
              </button>
              <button className="admin-secondary-button" onClick={() => setSelected(null)} type="button">
                Đóng
              </button>
              <button
                className="admin-primary-button"
                disabled={saving || nextStatus === selected.status}
                onClick={() => void updateStatus(selected, nextStatus)}
                type="button"
              >
                {saving ? "Đang lưu..." : "Lưu trạng thái"}
              </button>
            </>
          }
          onRequestClose={() => setSelected(null)}
          title={selected.name}
        >
          <div className="admin-contact-quick">
            <a className="admin-primary-button" href={`tel:${selected.phone}`}>
              ☎ Gọi {selected.phone}
            </a>
            <ContactStatusBadge status={selected.status} />
          </div>
          <dl className="admin-detail-grid">
            <DetailItem label="Nhu cầu">{selected.category}</DetailItem>
            <DetailItem label="Khu vực">{selected.location || "—"}</DetailItem>
            <DetailItem label="Xe quan tâm">
              {selected.vehicleSlug ? (
                <Link href={`/xe/${selected.vehicleSlug}`} rel="noreferrer" target="_blank">
                  {selected.vehicleSlug}
                </Link>
              ) : (
                "—"
              )}
            </DetailItem>
            <DetailItem label="Ngày gửi">{formatDate(selected.createdAt)}</DetailItem>
            <DetailItem label="Nội dung" full prose>
              {selected.message || "Khách hàng không để lại nội dung."}
            </DetailItem>
            <DetailItem label="Thông tin đồng ý xử lý dữ liệu" full prose>
              {selected.consentText}
              <small className="admin-field-hint">Đồng ý lúc {formatDate(selected.consentAt)}</small>
            </DetailItem>
          </dl>
          <fieldset className="admin-fieldset">
            <legend>Trạng thái xử lý</legend>
            <div className="admin-status-choices">
              {contactStatuses.map((status) => (
                <label className="admin-status-choice" key={status}>
                  <input
                    checked={nextStatus === status}
                    name="contact-status"
                    onChange={() => setNextStatus(status)}
                    type="radio"
                  />
                  <ContactStatusBadge status={status} />
                </label>
              ))}
            </div>
          </fieldset>
        </Drawer>
      )}
    </>
  );
}
