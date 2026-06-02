'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Workplace, CalendarEvent } from '@/types';
import { parseICS } from './icsParser';

const AUTO_REFRESH_MS = 10 * 60 * 1000; // 10 min

export type WpFetchStatus = 'idle' | 'loading' | 'ok' | 'error';

export interface WpStatus {
  id: string;
  name: string;
  status: WpFetchStatus;
  errorMsg?: string;
}

export function useCalendarData(workplaces: Workplace[]) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [wpStatuses, setWpStatuses] = useState<WpStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const workplacesRef = useRef(workplaces);
  workplacesRef.current = workplaces;

  const fetchAll = useCallback(async () => {
    const wps = workplacesRef.current;
    if (wps.length === 0) return;

    setLoading(true);
    setWpStatuses(wps.map((wp) => ({ id: wp.id, name: wp.name, status: 'loading' })));

    const allEvents: CalendarEvent[] = [];

    await Promise.all(
      wps.map(async (wp) => {
        try {
          const res = await fetch('/api/ical', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: wp.icalUrl }),
            cache: 'no-store',
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const icsText = await res.text();
          const parsed = parseICS(icsText, wp);
          allEvents.push(...parsed);

          setWpStatuses((prev) =>
            prev.map((s) => (s.id === wp.id ? { ...s, status: 'ok' } : s))
          );
        } catch (e) {
          setWpStatuses((prev) =>
            prev.map((s) =>
              s.id === wp.id ? { ...s, status: 'error', errorMsg: String(e) } : s
            )
          );
        }
      })
    );

    setEvents(allEvents.sort((a, b) => a.start.getTime() - b.start.getTime()));
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  const wpIdKey = workplaces.map((w) => w.id).join(',');

  // Initial fetch + 10min auto-refresh
  useEffect(() => {
    fetchAll();
    const timer = setInterval(fetchAll, AUTO_REFRESH_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAll, wpIdKey]);

  return {
    events,
    wpStatuses,
    loading,
    lastUpdated,
    refresh: fetchAll,
  };
}
