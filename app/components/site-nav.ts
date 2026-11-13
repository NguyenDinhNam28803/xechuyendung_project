/*
 * Nội dung điều hướng và chân trang dùng chung cho:
 *  - header/footer React của các trang con (site-header.tsx, site-footer.tsx);
 *  - trang chủ HTML tĩnh (app/_home/document.ts).
 * Sửa ở đây để mọi trang luôn có cùng mục menu, cùng số điện thoại và cùng cột chân trang.
 */
export type NavLink = { href: string; label: string; line?: string };

/** Nhóm xe trong menu "Dòng xe" và cột "Danh mục" ở chân trang (lọc sẵn danh mục). */
export const navGroups: NavLink[] = [
  { href: "/xe?loai=xe-tai", label: "Xe tải", line: "Chở hàng, gắn cẩu, đông lạnh" },
  { href: "/xe?loai=xe-chua-chay", label: "Xe chữa cháy", line: "Bồn nước và foam" },
  { href: "/xe?loai=xe-cuu-ho", label: "Xe cứu hộ", line: "Sàn trượt, càng kéo" },
  { href: "/xe?loai=xe-bon-moi-truong", label: "Xe môi trường", line: "Bồn nước, hút, ép, quét" },
];

/** Mẫu xe nổi bật trong menu "Dòng xe". */
export const navModels: NavLink[] = [
  { href: "/xe/xe-tai-gan-cau", label: "FAW JH6 gắn cẩu", line: "Cẩu Soosan 15 tấn, 8×4" },
  { href: "/xe/xe-chua-chay-isuzu-4-khoi", label: "Isuzu 4 khối", line: "Nước 3,5 m³, foam 0,5 m³" },
  { href: "/xe/xe-cuu-ho-san-truot", label: "Cứu hộ sàn trượt", line: "Cẩu, tời và càng kéo" },
];

/** Các mục menu chính sau "Dòng xe". */
export const navLinks: NavLink[] = [
  { href: "/dich-vu", label: "Dịch vụ" },
  { href: "/tu-van-mua-xe", label: "Tư vấn mua xe" },
  { href: "/tin-tuc", label: "Kiến thức" },
  { href: "/gioi-thieu", label: "Giới thiệu" },
];

/** Cột "Thông tin" và "Pháp lý" ở chân trang. */
export const footerInfo: NavLink[] = [
  { href: "/gioi-thieu", label: "Giới thiệu" },
  { href: "/dich-vu", label: "Dịch vụ" },
  { href: "/tu-van-mua-xe", label: "Tư vấn mua xe" },
  { href: "/tin-tuc", label: "Kiến thức" },
];
export const footerLegal: NavLink[] = [
  { href: "/chinh-sach", label: "Chính sách" },
  { href: "/phap-ly", label: "Quy định" },
];

export const FOOTER_LEDE = "Tư vấn xe tải và xe chuyên dụng theo công việc, hỗ trợ khách hàng toàn quốc.";
