/**
 * Tạo slug từ tiêu đề tiếng Việt: bỏ dấu, đổi "đ" thành "d", chỉ giữ chữ
 * thường, số và dấu gạch ngang; tối đa 120 ký tự như server cho phép.
 */
export function slugify(value: string, maxLength = 120) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/, "");
}

/**
 * Slug mới khi tên thay đổi: chỉ tự cập nhật lúc tạo mới và khi slug vẫn đang
 * trống hoặc trùng slug sinh từ tên cũ (người dùng chưa tự sửa).
 */
export function autoSlug(
  currentSlug: string,
  previousSource: string,
  nextSource: string,
  enabled: boolean,
) {
  if (!enabled) return currentSlug;
  if (currentSlug !== "" && currentSlug !== slugify(previousSource)) return currentSlug;
  return slugify(nextSource);
}
