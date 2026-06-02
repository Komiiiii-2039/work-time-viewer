'use client';

import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { WeeklyData, TitleEntry } from '@/types';
import { OTHER_COLOR } from '@/lib/constants';

interface Props {
  data: WeeklyData[];
  topTitles: TitleEntry[];
}

function round1(n: number) { return Math.round(n * 10) / 10; }

export default function WeeklyChart({ data, topTitles }: Props) {
  const topSet = useMemo(() => new Set(topTitles.map((t) => t.title)), [topTitles]);

  const chartData = useMemo(() =>
    data.map((d) => {
      const point: Record<string, unknown> = { weekLabel: d.weekLabel };
      let other = 0;
      for (const [title, hours] of Object.entries(d.byTitle)) {
        if (topSet.has(title)) point[title] = hours;
        else other += hours;
      }
      for (const t of topTitles) {
        if (!(t.title in point)) point[t.title] = 0;
      }
      if (other > 0.05) point['その他'] = round1(other);
      return point;
    }),
  [data, topTitles, topSet]);

  const hasData = chartData.some((d) =>
    topTitles.some((t) => (d[t.title] as number) > 0) || (d['その他'] as number) > 0
  );

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-48 text-[#999] text-sm">
        データがありません
      </div>
    );
  }

  const showOther = chartData.some((d) => ((d['その他'] as number) ?? 0) > 0);
  const bars = showOther
    ? [...topTitles.map((t) => ({ key: t.title, fill: t.color })), { key: 'その他', fill: OTHER_COLOR }]
    : topTitles.map((t) => ({ key: t.title, fill: t.color }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" />
        <XAxis dataKey="weekLabel" tick={{ fontSize: 11, fill: '#999' }} />
        <YAxis unit="h" tick={{ fontSize: 11, fill: '#999' }} />
        <Tooltip
          formatter={(v: number, name: string) => [`${v.toFixed(1)}h`, name]}
          contentStyle={{ border: '1px solid #eaeaea', borderRadius: 12, fontSize: 12 }}
        />
        <Legend
          iconType="square"
          iconSize={10}
          formatter={(value: string) => (
            <span style={{ fontSize: 11, color: '#666' }}>
              {value.length > 14 ? value.slice(0, 13) + '…' : value}
            </span>
          )}
        />
        {bars.map((b, i) => (
          <Bar
            key={b.key}
            dataKey={b.key}
            stackId="a"
            fill={b.fill}
            radius={i === bars.length - 1 ? [4, 4, 0, 0] : 0}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
