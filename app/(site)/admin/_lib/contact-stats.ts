"use client";

import { adminFetch, jsonBody } from "./admin-api";
import type { ContactStatus, ContactSubmission, PageResponse, StatsOverview } from "./types";

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
  sort?: string;
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

/** Tổng số theo từng trạng thái và tổng chung — một request tới /stats/overview. */
export async function countContactsByStatus(): Promise<Record<ContactStatus | "all", number>> {
  const overview = await adminFetch<StatsOverview>("/stats/overview");
  return { all: overview.contacts.total, ...overview.contacts.byStatus };
}
