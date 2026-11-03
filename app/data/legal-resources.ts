export type LegalResourceType = "policy" | "regulation" | "legal_guide";

export type LegalResource = {
  id?: string;
  slug: string;
  resourceType: LegalResourceType;
  title: string;
  summary: string;
  content: string;
  sourceUrl: string | null;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ActivityEntry = {
  id: string;
  actor: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "IMPORT";
  entityType:
    "vehicle" | "article" | "policy" | "regulation" | "legal_guide" | "system";
  entityId: string | null;
  entityLabel: string;
  createdAt: string;
};

export const pendingPolicies: LegalResource[] = [
  {
    slug: "du-lieu-lien-he-va-quyen-rieng-tu",
    resourceType: "policy",
    title: "Dữ liệu liên hệ và quyền riêng tư",
    summary:
      "Cần xác nhận thông tin đơn vị chịu trách nhiệm và thời hạn lưu dữ liệu.",
    content:
      "Khi gửi biểu mẫu, thông tin liên hệ và nội dung yêu cầu được dùng để phản hồi tư vấn. Trước khi công bố chính sách chính thức, đơn vị cần xác nhận pháp nhân chịu trách nhiệm, thời hạn lưu trữ, cách yêu cầu truy cập/chỉnh sửa/xóa dữ liệu và đầu mối liên hệ.",
    sourceUrl: null,
    isPublished: true,
  },
  {
    slug: "chinh-sach-ban-hang-va-thanh-toan",
    resourceType: "policy",
    title: "Chính sách bán hàng và thanh toán",
    summary: "Chờ doanh nghiệp xác nhận điều kiện áp dụng.",
    content: "Website chưa công bố điều khoản bán hàng hoặc cam kết dịch vụ.",
    sourceUrl: null,
    isPublished: true,
  },
  {
    slug: "giao-nhan-va-ban-giao-xe",
    resourceType: "policy",
    title: "Giao nhận và bàn giao xe",
    summary: "Chờ xác nhận phạm vi giao xe, thời gian và chi phí.",
    content: "Thông tin giao nhận cần được xác nhận trong báo giá chính thức.",
    sourceUrl: null,
    isPublished: true,
  },
  {
    slug: "bao-hanh-va-ho-tro-ky-thuat",
    resourceType: "policy",
    title: "Bảo hành và hỗ trợ kỹ thuật",
    summary: "Chờ xác nhận nhà cung cấp, thời hạn và điều kiện bảo hành.",
    content: "Điều kiện bảo hành cần được xác nhận theo từng cấu hình xe.",
    sourceUrl: null,
    isPublished: true,
  },
];
