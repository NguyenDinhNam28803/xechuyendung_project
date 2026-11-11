"use client";

import { useCallback } from "react";
import { adminFetch, errorMessage, jsonBody } from "../../_lib/admin-api";
import { contactStatusLabels, formatDate } from "../../_lib/format";
import type {
  ContactStatus,
  ContactSubmission,
  PageResponse,
} from "../../_lib/types";
import { useFeedback, usePagedList } from "../../_lib/use-paged-list";
import { EmptyRow, Feedback, Pagination, SearchBox, Toolbar } from "../ui";

const statuses = Object.entries(contactStatusLabels) as [ContactStatus, string][];

export function ContactStatusBadge({ status }: { status: ContactStatus }) {
  return (
    <span className={`admin-contact-status status-${status}`}>
      {contactStatusLabels[status]}
    </span>
  );
}

export function ContactSubmissionsSection() {
  // Từ khóa đi trong body POST để tên/số điện thoại không nằm trên URL hay log.
  const loader = useCallback(
    (page: number, search: string) =>
      adminFetch<PageResponse<ContactSubmission>>("/contact-submissions/search", {
        method: "POST",
        body: jsonBody({ page, limit: 25, search }),
      }),
    [],
  );
  const list = usePagedList(loader);
  const feedback = useFeedback();

  async function updateStatus(submission: ContactSubmission, status: ContactStatus) {
    try {
      await adminFetch(`/contact-submissions/${submission.id}/status`, {
        method: "PATCH",
        body: jsonBody({ status }),
      });
      await list.reload();
      feedback.show("Đã cập nhật trạng thái yêu cầu liên hệ.");
    } catch (error) {
      feedback.show(errorMessage(error), true);
    }
  }

  async function remove(submission: ContactSubmission) {
    if (
      !window.confirm(
        `Xóa yêu cầu liên hệ của ${submission.name}? Thông tin liên hệ sẽ bị xóa khỏi hệ thống.`,
      )
    )
      return;
    try {
      await adminFetch(`/contact-submissions/${submission.id}`, { method: "DELETE" });
      await list.reload();
      feedback.show("Đã xóa yêu cầu liên hệ.");
    } catch (error) {
      feedback.show(errorMessage(error), true);
    }
  }

  return (
    <>
      <Toolbar total={list.pageInfo.total} caption="Yêu cầu liên hệ trong hệ thống" />
      <Feedback message={feedback.message} isError={feedback.isError} />
      <Feedback message={list.error} isError />
      <SearchBox
        label="Tìm trong yêu cầu liên hệ"
        value={list.search}
        onChange={list.setSearch}
        placeholder="Tên, số điện thoại, khu vực hoặc nội dung..."
      />
      <Pagination pageInfo={list.pageInfo} onPageChange={(page) => void list.goToPage(page)} />
      <section className="admin-card admin-contacts">
        <div className="admin-list-heading">
          <div>
            <h2>Yêu cầu tư vấn từ khách hàng</h2>
            <p>
              Chỉ dùng thông tin liên hệ để phản hồi yêu cầu. Lịch sử hoạt động không lưu
              tên, số điện thoại hay nội dung liên hệ. Hệ thống tự xóa yêu cầu sau 90 ngày.
            </p>
          </div>
          <span>{list.loading ? "Đang tải..." : `${list.pageInfo.total} yêu cầu phù hợp`}</span>
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
                <tr key={submission.id}>
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
                    {submission.message ? (
                      <details>
                        <summary>
                          {submission.message.slice(0, 80)}
                          {submission.message.length > 80 ? "…" : ""}
                        </summary>
                        <p>{submission.message}</p>
                        <hr />
                        <strong>Thông tin đồng ý</strong>
                        <p>{submission.consentText}</p>
                        <small>Đồng ý lúc {formatDate(submission.consentAt)}</small>
                      </details>
                    ) : (
                      <span>Không có nội dung</span>
                    )}
                  </td>
                  <td>{formatDate(submission.createdAt)}</td>
                  <td>
                    <div className="admin-table-actions admin-contact-table-actions">
                      <label>
                        <span className="sr-only">
                          Trạng thái yêu cầu của {submission.name}
                        </span>
                        <select
                          onChange={(event) =>
                            void updateStatus(submission, event.target.value as ContactStatus)
                          }
                          value={submission.status}
                        >
                          {statuses.map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
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
                  {list.search
                    ? "Không có yêu cầu nào khớp với từ khóa tìm kiếm."
                    : "Chưa có yêu cầu liên hệ nào."}
                </EmptyRow>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
