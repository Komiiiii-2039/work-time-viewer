import type { CalendarEvent, AggregationResult, WeeklyData, DailyData, TitleSummary, TitleEntry } from '@/types';
import { TITLE_COLORS } from './constants';
import {
  jstDateStr,
  fmtJST,
  endOfWeekJST,
  eachDayJST,
  eachWeekJST,
} from './timezone';

export function filterEvents(
  events: CalendarEvent[],
  workplaceIds: string[] | 'all',
  startDate: Date,
  endDate: Date
): CalendarEvent[] {
  return events.filter((e) => {
    const inRange = e.start >= startDate && e.start <= endDate;
    const matchWp = workplaceIds === 'all' || workplaceIds.includes(e.workplaceId);
    return inRange && matchWp;
  });
}

export function aggregate(events: CalendarEvent[]): AggregationResult {
  const totalHours  = round1(events.reduce((s, e) => s + e.durationHours, 0));
  const workingDays = new Set(events.filter((e) => !e.isAllDay).map((e) => jstDateStr(e.start))).size;
  return { totalHours, workingDays };
}

export function getTopTitles(events: CalendarEvent[], max = 8): TitleEntry[] {
  const totals = new Map<string, number>();
  for (const e of events) {
    if (e.isAllDay) continue;
    totals.set(e.title, (totals.get(e.title) ?? 0) + e.durationHours);
  }
  return Array.from(totals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([title, totalHours], i) => ({
      title,
      color: TITLE_COLORS[i % TITLE_COLORS.length],
      totalHours: round1(totalHours),
    }));
}

export function getWeeklyData(
  events: CalendarEvent[],
  startDate: Date,
  endDate: Date
): WeeklyData[] {
  return eachWeekJST(startDate, endDate).map((weekStart) => {
    const weekEnd = endOfWeekJST(weekStart);
    const we = events.filter((e) => e.start >= weekStart && e.start <= weekEnd && !e.isAllDay);
    const raw: Record<string, number> = {};
    for (const e of we) {
      raw[e.title] = (raw[e.title] ?? 0) + e.durationHours;
    }
    const byTitle = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, round1(v)]));
    return { weekLabel: fmtJST(weekStart, 'M/d') + '週', weekStart, byTitle };
  });
}

export function getDailyData(
  events: CalendarEvent[],
  startDate: Date,
  endDate: Date
): DailyData[] {
  return eachDayJST(startDate, endDate).map((day) => {
    const dayStr = jstDateStr(day);
    const de = events.filter((e) => jstDateStr(e.start) === dayStr);
    const raw: Record<string, number> = {};
    for (const e of de) {
      if (!e.isAllDay) raw[e.title] = (raw[e.title] ?? 0) + e.durationHours;
    }
    const byTitle = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, round1(v)]));
    return {
      date:    fmtJST(day, 'M/d'),
      dateObj: day,
      total:   round1(de.reduce((s, e) => s + e.durationHours, 0)),
      byTitle,
      events:  de,
    };
  });
}

export function getTitleSummary(events: CalendarEvent[]): TitleSummary[] {
  const map = new Map<string, TitleSummary>();

  for (const e of events) {
    const key = `${e.workplaceId}::${e.title}`;
    const existing = map.get(key);
    if (existing) {
      existing.totalHours += e.durationHours;
      existing.count++;
    } else {
      map.set(key, {
        title: e.title,
        workplaceName: e.workplaceName,
        workplaceColor: e.workplaceColor,
        totalHours: e.durationHours,
        count: 1,
      });
    }
  }

  return Array.from(map.values())
    .map((t) => ({ ...t, totalHours: round1(t.totalHours) }))
    .sort((a, b) => b.totalHours - a.totalHours);
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export interface WordEntry { text: string; count: number }

export function getDescriptionCloud(events: CalendarEvent[]): WordEntry[] {
  const freq = new Map<string, number>();

  for (const e of events) {
    if (e.isAllDay) continue;
    const raw = (e.description ?? '').trim();
    if (!raw) continue;

    const cleaned = raw
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\S+@\S+/g, '');

    const tokens = cleaned
      .split(/[\s\u3000\u3001\u3002\uff0c\uff0e\u30fb\uff1a\uff1b\uff01\uff1f\u300c\u300d\u300e\u300f\u3010\u3011\uff08\uff09\/|,\.!\?:;\-\+\*]+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2 && !/^\d+$/.test(t));

    for (const token of tokens) {
      freq.set(token, (freq.get(token) ?? 0) + 1);
    }
  }

  return Array.from(freq.entries())
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 60);
}

export function formatInvoiceSummary(events: CalendarEvent[], notes: Record<string, string>): string {
  const dayMap = new Map<string, CalendarEvent[]>();

  for (const e of events) {
    if (e.isAllDay) continue;
    const key = jstDateStr(e.start);
    const arr = dayMap.get(key);
    if (arr) arr.push(e);
    else dayMap.set(key, [e]);
  }

  const lines: string[] = [];

  for (const [, dayEvents] of Array.from(dayMap.entries()).sort(([a], [b]) => a.localeCompare(b))) {
    const totalHours = round1(dayEvents.reduce((s, e) => s + e.durationHours, 0));
    const dateLabel  = fmtJST(dayEvents[0].start, 'M/d');
    const noteTexts  = dayEvents
      .map((e) => (notes[e.id] ?? e.description ?? '').replace(/\n+/g, '、').trim())
      .filter(Boolean);
    const suffix = noteTexts.length > 0 ? `（${noteTexts.join('、')}）` : '';
    lines.push(`${dateLabel} (${totalHours.toFixed(1)}h)：${suffix}`);
  }

  return lines.join('\n');
}
