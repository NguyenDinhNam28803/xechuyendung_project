/**
 * Kiểm thử các hàm thuần của trang quản trị: slug, kiểm tra trường nội dung,
 * trạng thái danh sách trên URL và rút gọn phân trang.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  cleanImages,
  cleanSections,
  cleanSpecs,
  isAllowedImageUrl,
  joinParagraphs,
  moveItem,
  splitParagraphs,
} from "../app/(site)/admin/_lib/content-fields.ts";
import { listQueryString, pageWindow, readListQuery } from "../app/(site)/admin/_lib/list-query.ts";
import { autoSlug, slugify } from "../app/(site)/admin/_lib/slug.ts";
import { readableActivityLabel } from "../app/(site)/admin/_lib/format.ts";

describe("slugify", () => {
  it("bỏ dấu tiếng Việt, đổi đ thành d và nối bằng gạch ngang", () => {
    assert.equal(slugify("Xe chữa cháy Đô thị 5 tấn"), "xe-chua-chay-do-thi-5-tan");
    assert.equal(slugify("  --Hino FC9JLSW (2024)!  "), "hino-fc9jlsw-2024");
    assert.equal(slugify("Ồ ạt ỨNG CỨU"), "o-at-ung-cuu");
  });

  it("autoSlug chỉ theo tên khi tạo mới và người dùng chưa tự sửa slug", () => {
    assert.equal(autoSlug("", "", "Xe tải", true), "xe-tai");
    assert.equal(autoSlug("xe-tai", "Xe tải", "Xe tải lớn", true), "xe-tai-lon");
    assert.equal(autoSlug("slug-rieng", "Xe tải", "Xe tải lớn", true), "slug-rieng");
    assert.equal(autoSlug("xe-tai", "Xe tải", "Xe tải lớn", false), "xe-tai");
  });

  it("giới hạn độ dài và không kết thúc bằng gạch ngang", () => {
    const slug = slugify(`${"a".repeat(10)} ${"b".repeat(10)}`, 11);
    assert.equal(slug, "aaaaaaaaaa");
  });
});

describe("isAllowedImageUrl / cleanImages", () => {
  it("chấp nhận https và đường dẫn nội bộ", () => {
    assert.equal(isAllowedImageUrl("https://cdn.example.com/a.jpg"), true);
    assert.equal(isAllowedImageUrl("/images/a.jpg"), true);
  });

  it("từ chối http, protocol-relative, javascript: và chuỗi rỗng", () => {
    for (const value of ["http://x.com/a.jpg", "//evil.com/a.jpg", "javascript:alert(1)", " ", "/\\evil"]) {
      assert.equal(isAllowedImageUrl(value), false, value);
    }
  });

  it("bỏ dòng trống, giới hạn 4 ảnh và báo ảnh sai", () => {
    assert.deepEqual(cleanImages([" /a.jpg ", "", "https://x.com/b.png"]), {
      ok: true,
      value: ["/a.jpg", "https://x.com/b.png"],
    });
    assert.equal(cleanImages(["/1", "/2", "/3", "/4", "/5"]).ok, false);
    assert.equal(cleanImages(["ftp://x"]).ok, false);
  });
});

describe("cleanSpecs", () => {
  it("bỏ dòng trống và cắt khoảng trắng", () => {
    assert.deepEqual(
      cleanSpecs([
        { label: " Tải trọng ", value: " 5 tấn " },
        { label: "", value: "" },
      ]),
      { ok: true, value: [{ label: "Tải trọng", value: "5 tấn" }] },
    );
  });

  it("báo lỗi dòng thiếu tên hoặc giá trị", () => {
    const result = cleanSpecs([{ label: "Động cơ", value: "" }]);
    assert.equal(result.ok, false);
    assert.match(!result.ok ? result.error : "", /thứ 1/);
  });
});

describe("cleanSections", () => {
  it("tách đoạn theo dòng trống", () => {
    assert.deepEqual(splitParagraphs("Đoạn 1\ndòng 2\n\n  \nĐoạn 2"), ["Đoạn 1\ndòng 2", "Đoạn 2"]);
    assert.equal(joinParagraphs(["a", "b"]), "a\n\nb");
  });

  it("yêu cầu ít nhất một mục và mỗi mục có tiêu đề", () => {
    assert.equal(cleanSections([{ heading: "", paragraphs: "" }]).ok, false);
    assert.equal(cleanSections([{ heading: "", paragraphs: "Nội dung" }]).ok, false);
    assert.deepEqual(cleanSections([{ heading: " Giới thiệu ", paragraphs: "A\n\nB" }]), {
      ok: true,
      value: [{ heading: "Giới thiệu", paragraphs: ["A", "B"] }],
    });
  });
});

describe("moveItem", () => {
  it("đổi vị trí và bỏ qua khi vượt biên", () => {
    assert.deepEqual(moveItem(["a", "b", "c"], 0, 1), ["b", "a", "c"]);
    assert.deepEqual(moveItem(["a", "b"], 0, -1), ["a", "b"]);
  });
});

describe("list query trên URL", () => {
  const keys = ["published"] as const;

  it("đọc trang, từ khóa, bộ lọc và bỏ giá trị sai", () => {
    const params = new URLSearchParams("page=3&q=hino&published=false&other=x");
    assert.deepEqual(readListQuery(params, keys), {
      page: 3,
      search: "hino",
      filters: { published: "false" },
    });
    assert.equal(readListQuery(new URLSearchParams("page=-2"), keys).page, 1);
    assert.equal(readListQuery(new URLSearchParams("page=abc"), keys).page, 1);
  });

  it("không đưa từ khóa lên URL khi includeSearch=false (dữ liệu cá nhân)", () => {
    const query = { page: 2, search: "0901234567", filters: { status: "new" } };
    assert.equal(listQueryString(query, ["status"], { includeSearch: false }), "?status=new&page=2");
    assert.equal(readListQuery(new URLSearchParams("q=abc"), [], { includeSearch: false }).search, "");
  });

  it("bỏ giá trị mặc định", () => {
    assert.equal(listQueryString({ page: 1, search: " ", filters: {} }, keys), "");
  });
});

describe("pageWindow", () => {
  it("hiển thị đủ khi ít trang", () => {
    assert.deepEqual(pageWindow(2, 5), [1, 2, 3, 4, 5]);
  });

  it("rút gọn bằng … quanh trang hiện tại", () => {
    assert.deepEqual(pageWindow(10, 20), [1, "…", 9, 10, 11, "…", 20]);
    assert.deepEqual(pageWindow(1, 20), [1, 2, "…", 20]);
    assert.deepEqual(pageWindow(3, 20), [1, 2, 3, 4, "…", 20]);
  });
});

describe("readableActivityLabel (nhật ký không lộ mã trạng thái tiếng Anh)", () => {
  it("đổi mã trạng thái ở cuối nhãn sang tiếng Việt", () => {
    assert.equal(
      readableActivityLabel("Cập nhật trạng thái yêu cầu liên hệ thành in_progress"),
      "Cập nhật trạng thái yêu cầu liên hệ thành “Đang xử lý”",
    );
    assert.equal(
      readableActivityLabel("Cập nhật trạng thái yêu cầu liên hệ thành spam"),
      "Cập nhật trạng thái yêu cầu liên hệ thành “Spam”",
    );
  });
  it("giữ nguyên nhãn khác", () => {
    assert.equal(readableActivityLabel("Đăng nhập: admin"), "Đăng nhập: admin");
  });
});
