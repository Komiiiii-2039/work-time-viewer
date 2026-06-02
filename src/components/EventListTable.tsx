'use client';

import { useState, useMemo, Fragment } from 'react';
import { FileText, Pencil, Download, ChevronUp, ChevronDown } from 'lucide-react';
import { fmtJST } from '@/lib/timezone';
import type { CalendarEvent, Workplace } from '@/types';
import NoteEditor from '@/components/NoteEditor';

interface Props {
  events: CalendarEvent[];
  workplaces: Workplace[];
  notes: Record<string, string>;
  onSaveNote: (eventId: string, text: string) => void;
}

export default function EventListTable({ events, workplaces, notes, onSaveNote }: Props) {
  const [wpFilter, setWpFilter] = useState<string>('all');
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...events];
    if (wpFilter !== 'all') list = list.filter((e) => e.workplaceId === wpFilter);
    list.sort((a, b) =>
      sortAsc ? a.start.getTime() - b.start.getTime() : b.start.getTime() - a.start.getTime()
    );
    return list;
  }, [events, wpFilter, sortAsc]);

  function exportCsv() {
    const headers = ['日付', '開始', '終了', '勤務先', 'タイトル', '時間(h)', 'メモ'];
    const rows = filtered.map((e) => [
      fmtJST(e.start, 'yyyy/MM/dd'),
      fmtJST(e.start, 'HH:mm'),
      fmtJST(e.end, 'HH:mm'),
      e.workplaceName,
      e.title,
      e.durationHours.toFixed(1),
      notes[e.id] ?? e.description ?? '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `work-time-${fmtJST(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5 items-center justify-between">
        <div className="flex gap-2 flex-wrap items-center">
          {workplaces.length > 1 && (
            <select
              value={wpFilter}
              onChange={(e) => setWpFilter(e.target.value)}
              className="input-field py-1.5 px-3 w-auto text-xs"
            >
              <option value="all">すべての勤務先</option>
              {workplaces.map((wp) => (
                <option key={wp.id} value={wp.id}>{wp.name}</option>
              ))}
            </select>
          )}
        </div>

        <button onClick={exportCsv} className="btn-tonal py-1.5 px-4 text-xs gap-1.5">
          <Download size={13} /> CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#eaeaea]">
              <th
                className="text-left py-2.5 px-3 text-[10px] font-semibold text-[#999] uppercase tracking-widest cursor-pointer select-none hover:text-black transition-colors"
                onClick={() => setSortAsc(!sortAsc)}
              >
                <span className="inline-flex items-center gap-1">
                  日付 {sortAsc ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                </span>
              </th>
              <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-[#999] uppercase tracking-widest">時刻</th>
              <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-[#999] uppercase tracking-widest">勤務先</th>
              <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-[#999] uppercase tracking-widest">タイトル</th>
              <th className="text-right py-2.5 px-3 text-[10px] font-semibold text-[#999] uppercase tracking-widest">時間</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map((e) => {
              const hasNote = !!(notes[e.id] ?? e.description);
              const isExpanded = expandedId === e.id;
              return (
                <Fragment key={e.id}>
                  <tr
                    className={`border-b transition-colors cursor-pointer ${
                      isExpanded ? 'bg-[#fafafa] border-[#eaeaea]' : 'border-[#fafafa] hover:bg-[#fafafa]'
                    }`}
                    onClick={() => setExpandedId(isExpanded ? null : e.id)}
                  >
                    <td className="py-2.5 px-3 text-[#444]">{fmtJST(e.start, 'M/d(EEE)')}</td>
                    <td className="py-2.5 px-3 text-[#999] font-mono text-xs">
                      {fmtJST(e.start, 'HH:mm')}–{fmtJST(e.end, 'HH:mm')}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: e.workplaceColor }} />
                        <span className="text-[#666]">{e.workplaceName}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-black">
                      <span className="inline-flex items-center gap-1.5">
                        {e.title}
                        {notes[e.id] && <Pencil className="text-[#999]" size={11} />}
                        {!notes[e.id] && hasNote && <FileText className="text-[#ccc]" size={11} />}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-black">{e.durationHours}h</td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-[#fafafa] border-b border-[#eaeaea]">
                      <td colSpan={5} className="px-3 py-3">
                        <NoteEditor event={e} notes={notes} onSaveNote={onSaveNote} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>

        {filtered.length > 100 && (
          <p className="text-xs text-[#999] text-center py-4">
            {filtered.length}件中 100件を表示
          </p>
        )}
        {filtered.length === 0 && (
          <p className="text-[#999] text-sm text-center py-10">該当するイベントがありません</p>
        )}
      </div>
    </div>
  );
}
