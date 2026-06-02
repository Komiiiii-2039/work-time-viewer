'use client';

import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { DailyData, CalendarEvent, TitleEntry } from '@/types';
import { OTHER_COLOR } from '@/lib/constants';
import { fmtJST } from '@/lib/timezone';
import NoteEditor from '@/components/NoteEditor';
import { X } from 'lucide-react';

interface Props {
  data: DailyData[];
  topTitles: TitleEntry[];
  notes: Record<string, string>;
  onSaveNote: (eventId: string, text: string) => void;
}

interface PopoverProps {
  day: DailyData;
  notes: Record<string, string>;
  onSaveNote: (eventId: string, text: string) => void;
  onClose: () => void;
}

function DayPopover({ day, notes, onSaveNote, onClose }: PopoverProps) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-md3 w-full max-w-lg max-h-[85vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-black">{fmtJST(day.dateObj, 'M月d日')} のイベント</h3>
            <button onClick={onClose} className="btn-text p-1 text-[#999]">
              <X size={18} />
            </button>
          </div>

          {day.events.length === 0 ? (
            <p className="text-[#999] text-sm">イベントなし</p>
          ) : (
            <div className="space-y-2">
              {day.events.map((e: CalendarEvent) => (
                <div key={e.id} className="card-filled p-3">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-1 h-10 rounded-full flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: e.workplaceColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-black">{e.title}</p>
                      <p className="text-xs text-[#999] mt-0.5 font-mono">
                        {fmtJST(e.start, 'HH:mm')}–{fmtJST(e.end, 'HH:mm')} · {e.workplaceName}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-black flex-shrink-0">{e.durationHours}h</span>
                  </div>
                  <NoteEditor event={e} notes={notes} onSaveNote={onSaveNote} className="mt-2 pl-4" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function round1(n: number) { return Math.round(n * 10) / 10; }

export default function DailyChart({ data, topTitles, notes, onSaveNote }: Props) {
  const [selected, setSelected] = useState<DailyData | null>(null);

  const topSet = useMemo(() => new Set(topTitles.map((t) => t.title)), [topTitles]);

  const chartData = useMemo(() =>
    data.map((d) => {
      const point: Record<string, unknown> = { date: d.date };
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
    topTitles.some((t) => (d[t.title] as number) > 0) || ((d['その他'] as number) ?? 0) > 0
  );

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-48 text-[#999] text-sm">
        データがありません
      </div>
    );
  }

  const display = chartData.length > 31 ? chartData.slice(-31) : chartData;
  const displayData = data.length > 31 ? data.slice(-31) : data;

  const showOther = display.some((d) => ((d['その他'] as number) ?? 0) > 0);
  const bars = showOther
    ? [...topTitles.map((t) => ({ key: t.title, fill: t.color })), { key: 'その他', fill: OTHER_COLOR }]
    : topTitles.map((t) => ({ key: t.title, fill: t.color }));

  return (
    <>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={display}
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          onClick={(payload) => {
            if (payload?.activePayload?.length) {
              const idx = payload.activeTooltipIndex ?? -1;
              if (idx >= 0) setSelected(displayData[idx]);
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#999' }} interval={data.length > 20 ? 2 : 0} />
          <YAxis unit="h" tick={{ fontSize: 11, fill: '#999' }} />
          <Tooltip
            formatter={(v: number, name: string) => [`${v.toFixed(1)}h`, name]}
            contentStyle={{ border: '1px solid #eaeaea', borderRadius: 12, fontSize: 12 }}
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

      <p className="text-xs text-[#999] mt-1 text-center">
        バーをクリックするとその日のイベントを確認・メモ編集できます
      </p>

      {selected && (
        <DayPopover
          day={selected}
          notes={notes}
          onSaveNote={onSaveNote}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
