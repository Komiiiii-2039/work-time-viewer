/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CalendarEvent, Workplace } from '@/types';

const MAX_RECUR_EXPAND = 5000;

// ical.js を動的 require（ESM/CJS 互換）
function getICAL(): any {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('ical.js');
}

function icalTimeToDate(dt: any): Date {
  return dt.toJSDate() as Date;
}

export function parseICS(
  icsText: string,
  workplace: Workplace,
  rangeStart?: Date,
  rangeEnd?: Date
): CalendarEvent[] {
  const ICAL = getICAL();
  const events: CalendarEvent[] = [];

  let jcal: any;
  try {
    jcal = ICAL.parse(icsText);
  } catch (e) {
    console.error('[icsParser] parse error:', e);
    return [];
  }

  const comp = new ICAL.Component(jcal);
  const vevents: any[] = comp.getAllSubcomponents('vevent');

  for (const vevent of vevents) {
    try {
      // Skip cancelled
      const status = vevent.getFirstPropertyValue('status');
      if (status === 'CANCELLED') continue;

      const icalEvent = new ICAL.Event(vevent);

      if (icalEvent.isRecurring()) {
        // Expand recurring events
        const expand = new ICAL.RecurExpansion({
          component: vevent,
          dtstart: icalEvent.startDate,
        });

        let count = 0;
        let next: any;
        while ((next = expand.next()) && count < MAX_RECUR_EXPAND) {
          count++;
          try {
            const occ = icalEvent.getOccurrenceDetails(next);
            const start = icalTimeToDate(occ.startDate);
            const end = occ.endDate ? icalTimeToDate(occ.endDate) : new Date(start.getTime() + 3600 * 1000);

            if (rangeEnd && start > rangeEnd) break;
            if (rangeStart && end < rangeStart) continue;

            pushEvent(events, icalEvent, occ.startDate, start, end, workplace, `${icalEvent.uid}-${start.getTime()}`);
          } catch (e) {
            console.warn('[icsParser] skipped occurrence due to error:', e);
          }
        }
      } else {
        const start = icalTimeToDate(icalEvent.startDate);
        const end = icalEvent.endDate ? icalTimeToDate(icalEvent.endDate) : new Date(start.getTime() + 3600 * 1000);

        if (rangeEnd && start > rangeEnd) continue;
        if (rangeStart && end < rangeStart) continue;

        pushEvent(events, icalEvent, icalEvent.startDate, start, end, workplace, icalEvent.uid);
      }
    } catch (e) {
      console.warn('[icsParser] skipped event due to error:', e);
    }
  }

  return events.sort((a, b) => a.start.getTime() - b.start.getTime());
}

function pushEvent(
  events: CalendarEvent[],
  icalEvent: any,
  dtstart: any,
  start: Date,
  end: Date,
  workplace: Workplace,
  uid: string
) {
  const isAllDay: boolean = dtstart.isDate ?? false;
  const title: string = icalEvent.summary || '(タイトルなし)';
  const rawDesc: string = icalEvent.description || '';
  const description = rawDesc.trim() || undefined;
  const durationMs = end.getTime() - start.getTime();
  // 全日イベントは稼働時間として計上しない（祝日・休暇マーカーなど）
  const durationHours = isAllDay ? 0 : Math.max(0, Math.round((durationMs / 3600000) * 10) / 10);

  events.push({
    id: `${workplace.id}-${uid}`,
    workplaceId: workplace.id,
    workplaceName: workplace.name,
    workplaceColor: workplace.color,
    title,
    description,
    start,
    end,
    durationHours,
    isAllDay,
  });
}
