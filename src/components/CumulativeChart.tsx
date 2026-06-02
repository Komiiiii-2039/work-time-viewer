'use client';

import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { DailyData } from '@/types';

interface Props {
  data: DailyData[];
}

function round1(n: number) { return Math.round(n * 10) / 10; }

export default function CumulativeChart({ data }: Props) {
  const hasData = data.some((d) => d.total > 0);
  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-48 text-[#999] text-sm">
        データがありません
      </div>
    );
  }

  // 累積合計に変換
  const cumulativeData = useMemo(() => {
    let sum = 0;
    return data.map((d) => {
      sum += d.total;
      return { date: d.date, total: round1(sum) };
    });
  }, [data]);

  const tickInterval = Math.max(1, Math.floor(data.length / 10));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={cumulativeData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#999' }}
          axisLine={false}
          tickLine={false}
          interval={tickInterval}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#999' }}
          axisLine={false}
          tickLine={false}
          unit="h"
          width={36}
        />
        <Tooltip
          formatter={(v: number) => [`${v.toFixed(1)}h`, '累積稼働']}
          contentStyle={{ border: '1px solid #eaeaea', borderRadius: 12, fontSize: 12 }}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#0070f3"
          fill="#0070f3"
          fillOpacity={0.1}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
