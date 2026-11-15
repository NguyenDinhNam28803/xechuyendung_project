/**
 * Hàm thuần của dashboard v2: vạch chia trục, tham số sắp xếp, định dạng số
 * liệu và nhận diện thiết bị đăng nhập.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { niceTicks } from "../app/(site)/admin/_lib/chart-math.ts";
import {
  formatCount,
  formatHours,
  formatShortDay,
} from "../app/(site)/admin/_lib/format.ts";
import { nextSortParam, parseSortParam } from "../app/(site)/admin/_lib/sort-param.ts";
import { describeUserAgent } from "../app/(site)/admin/_lib/user-agent.ts";

describe("niceTicks", () => {
  it("chia trục bằng bước 1/2/5 và luôn phủ giá trị lớn nhất", () => {
    assert.deepEqual(niceTicks(7), [0, 2, 4, 6, 8]);
    assert.deepEqual(niceTicks(100), [0, 50, 100]);
    const ticks = niceTicks(137);
    assert.equal(ticks[0], 0);
    assert.ok(ticks[ticks.length - 1] >= 137);
    const step = ticks[1] - ticks[0];
    assert.ok([1, 2, 5].some((base) => Number.isInteger(Math.log10(step / base))));
  });

  it("dữ liệu rỗng vẫn có trục 0..1", () => {
    assert.deepEqual(niceTicks(0), [0, 1]);
  });
});

describe("tham số sắp xếp", () => {
  it("đọc field:asc|desc và bỏ giá trị lạ", () => {
    assert.deepEqual(parseSortParam("name:desc"), { key: "name", direction: "desc" });
    assert.equal(parseSortParam("name"), null);
    assert.equal(parseSortParam("name:up"), null);
    assert.equal(parseSortParam(undefined), null);
  });

  it("bấm header: tăng dần → giảm dần → mặc định; cột khác bắt đầu lại", () => {
    assert.equal(nextSortParam(null, "name"), "name:asc");
    assert.equal(nextSortParam({ key: "name", direction: "asc" }, "name"), "name:desc");
    assert.equal(nextSortParam({ key: "name", direction: "desc" }, "name"), "");
    assert.equal(nextSortParam({ key: "name", direction: "desc" }, "make"), "make:asc");
  });
});

describe("định dạng số liệu", () => {
  it("định dạng ngày ngắn cho trục", () => {
    assert.equal(formatShortDay("2026-11-04"), "4/11");
  });

  it("thời gian phản hồi theo phút/giờ/ngày", () => {
    assert.equal(formatHours(null), "—");
    assert.equal(formatHours(0.25), "15 phút");
    assert.equal(formatHours(3.5), "3,5 giờ");
    assert.equal(formatHours(72), "3 ngày");
  });

  it("số đếm kiểu Việt Nam", () => {
    assert.equal(formatCount(1284), "1.284");
  });
});

describe("describeUserAgent", () => {
  it("nhận diện trình duyệt và hệ điều hành phổ biến", () => {
    assert.equal(
      describeUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
      ),
      "Chrome · Windows",
    );
    assert.equal(
      describeUserAgent(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
      ),
      "Safari · iOS",
    );
    assert.equal(describeUserAgent(null), "Thiết bị không xác định");
  });
});
