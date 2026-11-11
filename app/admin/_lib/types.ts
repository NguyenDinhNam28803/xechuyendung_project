/**
 * Kiểu dữ liệu của trang quản trị, lấy trực tiếp từ hợp đồng OpenAPI của
 * server (app/lib/generated/api-schema.ts, sinh bằng `npm run gen:api`).
 * Server đổi schema → chạy lại gen:api → TypeScript báo ngay chỗ lệch.
 */
import type { components } from "../../lib/generated/api-schema";

type Schemas = components["schemas"];

export type AdminVehicle = Schemas["Vehicle"];
export type AdminArticle = Schemas["Article"];
export type AdminLegalResource = Schemas["LegalResource"];
export type ContactSubmission = Schemas["ContactSubmission"];
export type ActivityEntry = Schemas["ActivityPage"]["items"][number];
export type AdminUser = Schemas["AdminUser"];
export type AdminIdentity = Schemas["AdminIdentity"];
export type AdminRole = Schemas["AdminRole"];
export type PageInfo = Schemas["PageInfo"];

export type VehicleInput = Schemas["VehicleInput"];
export type ArticleInput = Schemas["ArticleInput"];
export type LegalResourceInput = Schemas["LegalResourceInput"];
export type LegalResourceType = AdminLegalResource["resourceType"];
export type ContactStatus = ContactSubmission["status"];

export type PageResponse<T> = {
  items: T[];
  pagination: PageInfo;
};

export const emptyPageInfo: PageInfo = {
  page: 1,
  limit: 25,
  total: 0,
  totalPages: 0,
};
