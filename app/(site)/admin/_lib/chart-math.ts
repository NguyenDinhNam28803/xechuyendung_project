/** Vạch chia "đẹp" (bước 1/2/5 × 10^k), khoảng 4 vạch, luôn có 0. */
export function niceTicks(max: number, target = 4) {
  if (max <= 0) return [0, 1];
  const rough = max / target;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map((m) => m * power).find((s) => s >= rough) ?? power * 10;
  const ticks: number[] = [];
  for (let value = 0; value <= max + step * 0.001; value += step) ticks.push(value);
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step);
  return ticks.map((tick) => Math.round(tick * 1e6) / 1e6);
}
