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
import { niceTicks } from "../_lib/chart-math";
import { formatCount, formatLongDay, formatShortDay } from "../_lib/format";

/**
 * Bộ biểu đồ SVG nhẹ cho trang tổng quan (không thêm thư viện).
 *
 * Quy ước (theo hướng dẫn trực quan hóa dữ liệu của dự án):
 *  - màu series lấy từ biến CSS --series-N theo THỨ TỰ CỐ ĐỊNH, gắn với thực
 *    thể (trạng thái/hành động) chứ không theo thứ hạng;
 *  - cột ≤ 24px, đầu bo 4px ở phía dữ liệu, khe 2px màu nền giữa các đoạn;
 *  - lưới hairline 1px, chữ dùng màu chữ (không dùng màu series);
 *  - có tooltip khi rê chuột/phím mũi tên, chú giải luôn hiện khi ≥ 2 series,
 *    và nút "Xem dạng bảng" (vài màu có tương phản < 3:1 với nền trắng).
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


/** Path cột có góc bo `r` chỉ ở hai góc trên (đầu dữ liệu). */
function roundedTopRect(x: number, y: number, width: number, height: number, r: number) {
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

type StackedPoint<Key extends string> = { day: string; values: Record<Key, number> };

/**
 * Cột chồng theo ngày (một trục, mốc 0). Rê chuột hoặc dùng phím ←/→ khi
 * biểu đồ đang focus để xem chi tiết từng ngày.
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

  const margin = { top: 12, right: 8, bottom: 26, left: 36 };
  const innerWidth = Math.max(0, width - margin.left - margin.right);
  const innerHeight = height - margin.top - margin.bottom;
  const totals = data.map((point) =>
    series.reduce((sum, item) => sum + (point.values[item.key] ?? 0), 0),
  );
  const ticks = niceTicks(Math.max(...totals, 0));
  const maxTick = ticks[ticks.length - 1] || 1;
  const band = data.length > 0 ? innerWidth / data.length : 0;
  const barWidth = Math.max(2, Math.min(24, band * 0.68));
  const y = (value: number) => innerHeight - (value / maxTick) * innerHeight;
  // Nhãn trục X thưa: khoảng 6–8 nhãn bất kể số ngày.
  const labelEvery = Math.max(1, Math.ceil(data.length / 7));
  const gap = 2;

  function onKeyDown(event: KeyboardEvent<SVGSVGElement>) {
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
  const tooltipLeft =
    active !== null ? Math.min(Math.max(margin.left + band * (active + 0.5), 90), width - 90) : 0;

  return (
    <div className="admin-chart" ref={containerRef}>
      {width > 0 && (
        <svg
          aria-describedby={activePoint ? tooltipId : undefined}
          aria-label={label}
          height={height}
          onBlur={() => setActive(null)}
          onKeyDown={onKeyDown}
          onMouseLeave={() => setActive(null)}
          onMouseMove={(event) => {
            const box = event.currentTarget.getBoundingClientRect();
            const index = Math.floor((event.clientX - box.left - margin.left) / band);
            setActive(index >= 0 && index < data.length ? index : null);
          }}
          role="img"
          tabIndex={0}
          width={width}
        >
          <g transform={`translate(${margin.left},${margin.top})`}>
            {ticks.map((tick) => (
              <g key={tick} transform={`translate(0,${y(tick)})`}>
                <line className={tick === 0 ? "admin-chart-baseline" : "admin-chart-gridline"} x2={innerWidth} />
                <text className="admin-chart-tick" dy="0.32em" textAnchor="end" x={-8}>
                  {formatCount(tick)}
                </text>
              </g>
            ))}
            {active !== null && (
              <rect
                className="admin-chart-hover-band"
                height={innerHeight}
                width={band}
                x={band * active}
              />
            )}
            {data.map((point, index) => {
              const x = band * index + (band - barWidth) / 2;
              let base = 0;
              const visible = series.filter((item) => (point.values[item.key] ?? 0) > 0);
              return (
                <g key={point.day}>
                  {visible.map((item, segmentIndex) => {
                    const value = point.values[item.key];
                    const top = y(base + value);
                    const bottom = y(base);
                    base += value;
                    const isTop = segmentIndex === visible.length - 1;
                    // Khe 2px màu nền giữa các đoạn (trừ đoạn sát trục).
                    const segmentHeight = Math.max(0, bottom - top - (segmentIndex > 0 ? gap : 0));
                    return (
                      <path
                        d={roundedTopRect(x, top, barWidth, segmentHeight, isTop && barWidth >= 8 ? 4 : 0)}
                        fill={`var(--series-${item.slot})`}
                        key={item.key}
                      />
                    );
                  })}
                  {index % labelEvery === 0 && (
                    <text
                      className="admin-chart-tick"
                      textAnchor="middle"
                      x={band * index + band / 2}
                      y={innerHeight + 18}
                    >
                      {formatShortDay(point.day)}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
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

/** Đường xu hướng nhỏ (không trục) cho thẻ chỉ số. */
export function Sparkline({ values, label }: { values: number[]; label: string }) {
  const width = 120;
  const height = 32;
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const step = width / (values.length - 1);
  const points = values
    .map((value, index) => `${(index * step).toFixed(1)},${(height - 3 - (value / max) * (height - 6)).toFixed(1)}`)
    .join(" ");
  const last = values[values.length - 1];
  return (
    <svg
      aria-label={label}
      className="admin-sparkline"
      height={height}
      role="img"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
    >
      <polyline points={points} />
      <circle cx={width - 1} cy={height - 3 - (last / max) * (height - 6)} r={3} />
    </svg>
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
