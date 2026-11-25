"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { formatCount, formatLongDay, formatShortDay } from "../_lib/format";

/**
 * Biểu đồ của trang tổng quan, vẽ bằng Recharts (trục, lưới, cột chồng,
 * sparkline). Phần không phải biểu đồ trục (thanh tỷ lệ, thanh ngang, thẻ chỉ
 * số) là HTML/CSS thuần vì không cần trục và nhẹ hơn.
 *
 * Quy ước (theo hướng dẫn trực quan hóa dữ liệu của dự án):
 *  - màu series lấy từ biến CSS --series-N theo THỨ TỰ CỐ ĐỊNH, gắn với thực
 *    thể (trạng thái/hành động) chứ không theo thứ hạng;
 *  - cột ≤ 24px, đầu bo 4px ở phía dữ liệu, khe màu nền giữa các đoạn;
 *  - lưới hairline 1px, chữ dùng màu chữ (không dùng màu series);
 *  - tooltip khi rê chuột HOẶC phím mũi tên (cùng một trạng thái), chú giải
 *    luôn hiện khi ≥ 2 series, và nút "Xem dạng bảng".
 */

export type SeriesDef<Key extends string> = {
  key: Key;
  label: string;
  /** Chỉ số slot màu 1..8 (cố định theo thực thể). */
  slot: number;
};

function useElementWidth<E extends HTMLElement>() {
  const ref = useRef<E>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.floor(entry.contentRect.width));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

export function Legend<Key extends string>({
  series,
  totals,
}: {
  series: SeriesDef<Key>[];
  totals?: Partial<Record<Key, number>>;
}) {
  return (
    <ul className="admin-chart-legend">
      {series.map((item) => (
        <li key={item.key}>
          <span
            aria-hidden="true"
            className="admin-chart-swatch"
            style={{ background: `var(--series-${item.slot})` }}
          />
          {item.label}
          {totals && <strong>{formatCount(totals[item.key] ?? 0)}</strong>}
        </li>
      ))}
    </ul>
  );
}

/** Khung chung: tiêu đề, phụ đề, nút chuyển biểu đồ ⇄ bảng. */
export function ChartCard({
  title,
  subtitle,
  actions,
  table,
  children,
  className,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  table?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const [showTable, setShowTable] = useState(false);
  return (
    <section className={`admin-card admin-chart-card${className ? ` ${className}` : ""}`}>
      <header className="admin-chart-header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <div className="admin-chart-actions">
          {actions}
          {table && (
            <button
              aria-pressed={showTable}
              className="admin-link-button"
              onClick={() => setShowTable((value) => !value)}
              type="button"
            >
              {showTable ? "Xem biểu đồ" : "Xem dạng bảng"}
            </button>
          )}
        </div>
      </header>
      {showTable && table ? <div className="admin-chart-table">{table}</div> : children}
    </section>
  );
}

/** Path cột có góc bo `r` chỉ ở hai góc trên (đầu dữ liệu). */
function roundedTopRect(x: number, y: number, width: number, height: number, r: number) {
  if (height <= 0 || width <= 0) return "";
  const radius = Math.min(r, width / 2, height);
  if (radius <= 0) return `M${x},${y}h${width}v${height}h${-width}Z`;
  return [
    `M${x},${y + height}`,
    `V${y + radius}`,
    `Q${x},${y} ${x + radius},${y}`,
    `H${x + width - radius}`,
    `Q${x + width},${y} ${x + width},${y + radius}`,
    `V${y + height}`,
    "Z",
  ].join(" ");
}

type StackedPoint<Key extends string> = { day: string; values: Record<Key, number> };

const chartMargin = { top: 12, right: 8, bottom: 0, left: 0 };
const yAxisWidth = 36;

/**
 * Cột chồng theo ngày (một trục, mốc 0). Rê chuột hoặc focus rồi dùng phím
 * ←/→ để xem chi tiết từng ngày; Esc để đóng.
 */
export function StackedColumnChart<Key extends string>({
  data,
  series,
  height = 220,
  label,
}: {
  data: StackedPoint<Key>[];
  series: SeriesDef<Key>[];
  height?: number;
  /** Mô tả ngắn cho trình đọc màn hình. */
  label: string;
}) {
  const [containerRef, width] = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const tooltipId = useId();

  const rows = data.map((point) => ({ day: point.day, ...point.values }));
  const totals = data.map((point) =>
    series.reduce((sum, item) => sum + (point.values[item.key] ?? 0), 0),
  );
  // Nhãn trục X thưa: khoảng 6–8 nhãn bất kể số ngày.
  const labelEvery = Math.max(1, Math.ceil(data.length / 7));
  // Đoạn trên cùng (khác 0) của mỗi cột được bo góc ở đầu dữ liệu.
  const topKey = data.map((point) =>
    [...series].reverse().find((item) => (point.values[item.key] ?? 0) > 0)?.key,
  );

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (data.length === 0) return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      // Lần nhấn đầu tiên chọn ngày gần nhất, sau đó di chuyển từng ngày.
      setActive((current) =>
        current === null
          ? data.length - 1
          : Math.min(data.length - 1, Math.max(0, current + delta)),
      );
    } else if (event.key === "Escape") {
      setActive(null);
    }
  }

  const activePoint = active !== null ? data[active] : null;
  const plotLeft = chartMargin.left + yAxisWidth;
  const band = data.length > 0 ? (width - plotLeft - chartMargin.right) / data.length : 0;
  const tooltipLeft =
    active !== null ? Math.min(Math.max(plotLeft + band * (active + 0.5), 90), width - 90) : 0;

  return (
    <div
      aria-describedby={activePoint ? tooltipId : undefined}
      aria-label={label}
      className="admin-chart"
      onBlur={() => setActive(null)}
      onKeyDown={onKeyDown}
      ref={containerRef}
      role="img"
      style={{ minHeight: height }}
      tabIndex={0}
    >
      {width > 0 && (
        <BarChart
          accessibilityLayer={false}
          barCategoryGap="32%"
          data={rows}
          height={height}
          margin={chartMargin}
          onMouseLeave={() => setActive(null)}
          onMouseMove={(state) => {
            const index = Number(state?.activeTooltipIndex);
            setActive(Number.isInteger(index) && index >= 0 ? index : null);
          }}
          width={width}
        >
          <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            axisLine={{ stroke: "var(--chart-axis)" }}
            dataKey="day"
            interval={labelEvery - 1}
            tick={{ fill: "var(--chart-ink-muted)", fontSize: 11 }}
            tickFormatter={(day: string) => formatShortDay(day)}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tick={{ fill: "var(--chart-ink-muted)", fontSize: 11 }}
            tickFormatter={(value: number) => formatCount(value)}
            tickLine={false}
            width={yAxisWidth}
          />
          {series.map((item) => (
            <Bar
              dataKey={item.key}
              fill={`var(--series-${item.slot})`}
              isAnimationActive={false}
              key={item.key}
              maxBarSize={24}
              name={item.label}
              stackId="total"
              // Mỗi đoạn tự vẽ: viền màu nền tạo khe giữa các đoạn, chỉ đoạn
              // trên cùng được bo góc, ngày không được chọn bị làm mờ.
              shape={(props: unknown) => {
                const { x = 0, y = 0, width: w = 0, height: h = 0, index = 0 } =
                  props as { x?: number; y?: number; width?: number; height?: number; index?: number };
                return (
                  <path
                    d={roundedTopRect(x, y, w, h, topKey[index] === item.key && w >= 8 ? 4 : 0)}
                    fill={`var(--series-${item.slot})`}
                    fillOpacity={active === null || active === index ? 1 : 0.45}
                    stroke="var(--chart-surface)"
                    strokeWidth={1}
                  />
                );
              }}
            />
          ))}
        </BarChart>
      )}
      {activePoint && active !== null && (
        <div className="admin-chart-tooltip" id={tooltipId} role="status" style={{ left: tooltipLeft }}>
          <strong>{formatLongDay(activePoint.day)}</strong>
          <span className="admin-chart-tooltip-total">Tổng: {formatCount(totals[active])}</span>
          {series.map((item) => (
            <span key={item.key}>
              <i aria-hidden="true" style={{ background: `var(--series-${item.slot})` }} />
              {item.label}
              <b>{formatCount(activePoint.values[item.key] ?? 0)}</b>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Thanh ngang một series: nhãn bên trái, giá trị ở đầu thanh. */
export function BarList({
  items,
  emptyMessage = "Chưa có dữ liệu trong khoảng thời gian này.",
  slot = 1,
}: {
  items: { key: string; label: ReactNode; value: number; hint?: string }[];
  emptyMessage?: string;
  slot?: number;
}) {
  const max = Math.max(...items.map((item) => item.value), 0);
  if (items.length === 0 || max === 0) return <p className="admin-empty">{emptyMessage}</p>;
  return (
    <ul className="admin-bar-list">
      {items.map((item) => (
        <li key={item.key} title={item.hint}>
          <span className="admin-bar-label">{item.label}</span>
          <span className="admin-bar-track">
            <span
              className="admin-bar-fill"
              style={{
                width: `${Math.max(2, (item.value / max) * 100)}%`,
                background: `var(--series-${slot})`,
              }}
            />
          </span>
          <strong className="admin-bar-value">{formatCount(item.value)}</strong>
        </li>
      ))}
    </ul>
  );
}

/**
 * Thanh tỷ lệ một tổng chia thành các phần (ví dụ công khai / nháp). Không có
 * trục; nhãn và số nằm dưới thanh nên không phụ thuộc màu.
 */
export function SegmentBar<Key extends string>({
  label,
  values,
  series,
  href,
}: {
  label: string;
  values: Record<Key, number>;
  series: SeriesDef<Key>[];
  href?: string;
}) {
  const total = series.reduce((sum, item) => sum + (values[item.key] ?? 0), 0);
  const content = (
    <>
      <span className="admin-segment-head">
        <span>{label}</span>
        <strong>{formatCount(total)}</strong>
      </span>
      <span
        aria-label={series.map((item) => `${item.label}: ${values[item.key] ?? 0}`).join(", ")}
        className="admin-segment-bar"
        role="img"
      >
        {total === 0 ? (
          <span className="admin-segment-empty" />
        ) : (
          series
            .filter((item) => (values[item.key] ?? 0) > 0)
            .map((item) => (
              <span
                key={item.key}
                style={{
                  flexGrow: values[item.key],
                  background: `var(--series-${item.slot})`,
                }}
              />
            ))
        )}
      </span>
      <span className="admin-segment-values">
        {series.map((item) => (
          <span key={item.key}>
            <i aria-hidden="true" style={{ background: `var(--series-${item.slot})` }} />
            {item.label} {formatCount(values[item.key] ?? 0)}
          </span>
        ))}
      </span>
    </>
  );
  return href ? (
    <Link className="admin-segment" href={href}>
      {content}
    </Link>
  ) : (
    <div className="admin-segment">{content}</div>
  );
}

/** Đường xu hướng nhỏ (không trục) cho thẻ chỉ số; chấm đánh dấu giá trị cuối. */
export function Sparkline({ values, label }: { values: number[]; label: string }) {
  if (values.length < 2) return null;
  const rows = values.map((value, index) => ({ index, value }));
  const last = values.length - 1;
  return (
    <div aria-label={label} className="admin-sparkline" role="img">
      <LineChart
        accessibilityLayer={false}
        data={rows}
        height={32}
        margin={{ top: 4, right: 4, bottom: 4, left: 4 }}
        width={120}
      >
        <YAxis domain={[0, "dataMax"]} hide />
        <Line
          dataKey="value"
          dot={(props: { cx?: number; cy?: number; index?: number }) =>
            props.index === last ? (
              <circle cx={props.cx} cy={props.cy} key="last" r={3} />
            ) : (
              <g key={props.index} />
            )
          }
          isAnimationActive={false}
          stroke="#9aa7ae"
          strokeLinecap="round"
          strokeWidth={2}
          type="linear"
        />
      </LineChart>
    </div>
  );
}

/**
 * Thẻ chỉ số: nhãn, giá trị, chênh lệch so với kỳ trước (mũi tên + chữ, không
 * chỉ dựa vào màu) và sparkline tùy chọn.
 */
export function StatTile({
  label,
  value,
  delta,
  deltaLabel,
  upIsGood = true,
  hint,
  trend,
  href,
}: {
  label: string;
  value: ReactNode;
  /** Phần trăm thay đổi; null = không so sánh được. */
  delta?: number | null;
  deltaLabel?: string;
  upIsGood?: boolean;
  hint?: ReactNode;
  trend?: number[];
  href?: string;
}) {
  let deltaNode: ReactNode = null;
  if (delta !== undefined) {
    if (delta === null) {
      deltaNode = <span className="admin-stat-delta is-neutral">Chưa có dữ liệu kỳ trước</span>;
    } else {
      const direction = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
      const good = direction === "flat" ? null : (direction === "up") === upIsGood;
      deltaNode = (
        <span
          className={`admin-stat-delta ${good === null ? "is-neutral" : good ? "is-good" : "is-bad"}`}
        >
          <span aria-hidden="true">{direction === "up" ? "▲" : direction === "down" ? "▼" : "■"}</span>
          {delta > 0 ? "+" : ""}
          {delta.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}% {deltaLabel}
        </span>
      );
    }
  }
  const body = (
    <>
      <span className="admin-stat-label">{label}</span>
      <strong className="admin-stat-value">{value}</strong>
      {deltaNode}
      {hint && <small className="admin-stat-hint">{hint}</small>}
      {trend && <Sparkline label={`Xu hướng ${label.toLowerCase()}`} values={trend} />}
    </>
  );
  return href ? (
    <Link className="admin-stat-tile" href={href}>
      {body}
    </Link>
  ) : (
    <div className="admin-stat-tile">{body}</div>
  );
}

/** Bộ chọn khoảng thời gian (một hàng nút, phía trên biểu đồ). */
export function RangePicker({
  value,
  options,
  onChange,
}: {
  value: number;
  options: { days: number; label: string }[];
  onChange: (days: number) => void;
}) {
  return (
    <div aria-label="Khoảng thời gian" className="admin-filter-tabs admin-range-picker" role="group">
      {options.map((option) => (
        <button
          aria-pressed={option.days === value}
          key={option.days}
          onClick={() => onChange(option.days)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
