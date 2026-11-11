"use client";

import { adminFetch, jsonBody } from "./admin-api";
import type { ContactStatus, ContactSubmission, PageResponse } from "./types";

export const contactStatuses: ContactStatus[] = ["new", "in_progress", "contacted", "closed", "spam"];

/** Phát sau khi trạng thái/xóa yêu cầu liên hệ thay đổi để huy hiệu sidebar cập nhật. */
export const contactsChangedEvent = "admin-contacts-changed";

export function notifyContactsChanged() {
  window.dispatchEvent(new Event(contactsChangedEvent));
}

export function searchContacts(body: {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContactStatus;
}) {
  return adminFetch<PageResponse<ContactSubmission>>("/contact-submissions/search", {
    method: "POST",
    body: jsonBody(body),
  });
}

/** Số yêu cầu đang chờ (trạng thái "Mới"); limit=1 nên chỉ đọc tổng số. */
export async function countNewContacts() {
  const page = await searchContacts({ page: 1, limit: 1, status: "new" });
  return page.pagination.total;
}

/** Tổng số theo từng trạng thái và tổng chung (6 request song song, mỗi request 1 bản ghi). */
export async function countContactsByStatus(): Promise<Record<ContactStatus | "all", number>> {
  const [all, ...byStatus] = await Promise.all([
    searchContacts({ page: 1, limit: 1 }),
    ...contactStatuses.map((status) => searchContacts({ page: 1, limit: 1, status })),
  ]);
  const counts = { all: all.pagination.total } as Record<ContactStatus | "all", number>;
  contactStatuses.forEach((status, index) => {
    counts[status] = byStatus[index].pagination.total;
  });
  return counts;
}
