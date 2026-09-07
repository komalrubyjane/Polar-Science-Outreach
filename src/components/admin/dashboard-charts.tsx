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

const PALETTE = [
  '#2d6d94', '#3fd0e0', '#4be0a0', '#8a7ff0', '#e0a13f',
  '#e0563f', '#59a4c7', '#285979', '#8ec4dd', '#233f55', '#e07fb0',
];

export function GrowthChart({
  data,
  color = '#2d6d94',
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
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
        <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 8,
            fontSize: 12,
          }}
        />
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
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="label"
          width={150}
          tick={{ fontSize: 11 }}
          stroke="hsl(var(--muted-foreground))"
        />
        <Tooltip
          contentStyle={{
            background: 'hsl(var(--popover))',
            border: '1px solid hsl(var(--border))',
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
