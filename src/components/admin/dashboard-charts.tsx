'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

/** Controlled scientific blue palette (see design tokens --chart-*). */
const PALETTE = [
  '#315A78', '#7694B0', '#9DB8CC', '#183B56', '#B9D3E2',
  '#5F7F9D', '#0B2A43', '#D9E8F0', '#28506B', '#8CA9C0', '#3E6C8C',
];

const AXIS = 'rgb(var(--muted-foreground))';
const GRID = 'rgb(var(--border))';
const tooltipStyle = {
  background: 'rgb(var(--surface))',
  border: '1px solid rgb(var(--border))',
  borderRadius: 2,
  fontSize: 12,
  color: 'rgb(var(--foreground))',
} as const;

export function GrowthChart({
  data,
  color = '#315A78',
}: {
  data: { month: string; count: number }[];
  color?: string;
}) {
  if (!data.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No data yet</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke={AXIS} />
        <YAxis tick={{ fontSize: 11 }} stroke={AXIS} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey="count" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CategoryBarChart({
  data,
}: {
  data: { label: string; count: number }[];
}) {
  if (!data.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No data yet</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 30)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} stroke={AXIS} allowDecimals={false} />
        <YAxis type="category" dataKey="label" width={150} tick={{ fontSize: 11 }} stroke={AXIS} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="count" radius={[0, 2, 2, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
