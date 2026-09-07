'use client';

import * as React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface SeriesChartPoint {
  t: string;
  value: number;
}

/**
 * Accessible time-series chart. Renders a visual chart plus a visually-hidden
 * data table and a textual summary so the information is available to everyone.
 */
export function SeriesChart({
  points,
  unit,
  label,
  kind = 'area',
  height = 320,
}: {
  points: SeriesChartPoint[];
  unit: string;
  label: string;
  kind?: 'area' | 'line' | 'bar';
  height?: number;
}) {
  const summary = React.useMemo(() => {
    if (points.length === 0) return 'No data points available.';
    const values = points.map((p) => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const first = points[0]!;
    const last = points[points.length - 1]!;
    const delta = last.value - first.value;
    const dir = delta > 0 ? 'increased' : delta < 0 ? 'decreased' : 'was unchanged';
    return `${label}: ${points.length} points from ${first.t} to ${last.t}. Values range from ${min} to ${max} ${unit}. Over the period the value ${dir} by ${Math.abs(delta).toFixed(2)} ${unit} (from ${first.value} to ${last.value}).`;
  }, [points, unit, label]);

  const Chart = kind === 'line' ? LineChart : AreaChart;

  return (
    <figure className="w-full">
      <div className="w-full overflow-x-auto">
        <div style={{ minWidth: 480 }}>
          <ResponsiveContainer width="100%" height={height}>
            <Chart data={points} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <defs>
                <linearGradient id="seriesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--chart-1))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="rgb(var(--chart-1))" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
              <XAxis
                dataKey="t"
                tick={{ fontSize: 11 }}
                stroke="rgb(var(--muted-foreground))"
                minTickGap={24}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="rgb(var(--muted-foreground))"
                width={56}
                label={{
                  value: unit,
                  angle: -90,
                  position: 'insideLeft',
                  style: { fontSize: 11, fill: 'rgb(var(--muted-foreground))' },
                }}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgb(var(--surface))',
                  border: '1px solid rgb(var(--border))',
                  borderRadius: 2,
                  fontSize: 12,
                }}
                formatter={(v: number) => [`${v} ${unit}`, label]}
              />
              {kind === 'line' ? (
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="rgb(var(--chart-1))"
                  strokeWidth={2}
                  dot={false}
                />
              ) : (
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="rgb(var(--chart-1))"
                  strokeWidth={2}
                  fill="url(#seriesFill)"
                />
              )}
            </Chart>
          </ResponsiveContainer>
        </div>
      </div>
      <figcaption className="mt-2 text-sm text-muted-foreground">{summary}</figcaption>
      <details className="mt-2">
        <summary className="cursor-pointer text-xs text-accent">View data table</summary>
        <div className="mt-2 max-h-64 overflow-auto rounded border border-border">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-2 py-1 text-left">Period</th>
                <th className="px-2 py-1 text-right">Value ({unit})</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.t} className="border-t border-border">
                  <td className="px-2 py-1">{p.t}</td>
                  <td className="px-2 py-1 text-right">{p.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
