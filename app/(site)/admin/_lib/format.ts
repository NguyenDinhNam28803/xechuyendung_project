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

/** Số đếm theo kiểu Việt Nam: 1.284 — rút gọn 12,9 N khi từ 10.000. */
export function formatCount(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    notation: value >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

/** Ngày ngắn cho trục biểu đồ: "14/11". `day` dạng YYYY-MM-DD. */
export function formatShortDay(day: string) {
  const [, month, date] = day.split("-");
  return `${Number(date)}/${Number(month)}`;
}

/** Ngày đầy đủ cho tooltip: "Thứ Sáu, 14/11/2026". */
export function formatLongDay(day: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00Z`));
}

/** "3,5 giờ" / "45 phút" / "2,1 ngày" cho thời gian phản hồi. */
export function formatHours(hours: number | null | undefined) {
  if (hours === null || hours === undefined) return "—";
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} phút`;
  if (hours < 48) return `${hours.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} giờ`;
  return `${(hours / 24).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} ngày`;
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
  vehicle_category: "Danh mục xe",
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

/** Bản ghi nhật ký cũ lưu mã trạng thái thô ("… thành in_progress"): đổi sang nhãn tiếng Việt khi hiển thị. */
export function readableActivityLabel(label: string) {
  return label.replace(
    /thành (new|in_progress|contacted|closed|spam)$/,
    (_, status: ContactStatus) => `thành “${contactStatusLabels[status]}”`,
  );
}

export const resourceTypeLabels: Record<LegalResourceType, string> = {
  policy: "Chính sách",
  regulation: "Quy định",
  legal_guide: "Tìm hiểu pháp lý",
};

export const roleLabels: Record<AdminRole, string> = {
  admin: "Quản trị viên",
  editor: "Biên tập viên",
};
