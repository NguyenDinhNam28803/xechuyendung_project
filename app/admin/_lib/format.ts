import type {
  ActivityEntry,
  AdminRole,
  ContactStatus,
  LegalResourceType,
} from "./types";

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

/** Tách textarea thành danh sách, bỏ dòng trống. */
export function lines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export const actionLabels: Record<ActivityEntry["action"], string> = {
  CREATE: "Tạo mới",
  UPDATE: "Cập nhật",
  DELETE: "Xóa",
  IMPORT: "Nhập dữ liệu",
  LOGIN: "Đăng nhập",
  LOGOUT: "Đăng xuất",
};

export const entityLabels: Record<ActivityEntry["entityType"], string> = {
  vehicle: "Xe",
  article: "Bài viết",
  policy: "Chính sách",
  regulation: "Quy định",
  legal_guide: "Tìm hiểu pháp lý",
  contact_submission: "Yêu cầu liên hệ",
  admin_user: "Tài khoản",
  system: "Hệ thống",
};

export const contactStatusLabels: Record<ContactStatus, string> = {
  new: "Mới",
  in_progress: "Đang xử lý",
  contacted: "Đã liên hệ",
  closed: "Hoàn tất",
  spam: "Spam",
};

export const resourceTypeLabels: Record<LegalResourceType, string> = {
  policy: "Chính sách",
  regulation: "Quy định",
  legal_guide: "Tìm hiểu pháp lý",
};

export const roleLabels: Record<AdminRole, string> = {
  admin: "Quản trị viên",
  editor: "Biên tập viên",
};
