import type { Workplace, CalendarEvent } from '@/types';

export const DUMMY_WORKPLACES: Workplace[] = [
  {
    id: 'wp1',
    name: '株式会社ABC',
    icalUrl: 'https://calendar.google.com/calendar/ical/example1%40gmail.com/private-abc123/basic.ics',
    color: '#3B82F6',
  },
  {
    id: 'wp2',
    name: '副業フリーランス',
    icalUrl: 'https://calendar.google.com/calendar/ical/example2%40gmail.com/private-def456/basic.ics',
    color: '#10B981',
  },
];

const WP1_TEMPLATES = [
  { title: '機能実装作業', startHour: 9, duration: 2.5 },
  { title: '週次定例MTG', startHour: 10, duration: 1 },
  { title: 'コードレビュー', startHour: 14, duration: 1 },
  { title: '技術調査', startHour: 15, duration: 1.5 },
  { title: 'バグ修正作業', startHour: 16, duration: 1.5 },
  { title: 'プロジェクト定例', startHour: 13, duration: 1 },
  { title: 'システム設計', startHour: 9, duration: 2 },
  { title: 'テスト実施', startHour: 11, duration: 2 },
  { title: 'クライアントとの打合', startHour: 15, duration: 1 },
  { title: '資料作成', startHour: 16, duration: 1.5 },
  { title: 'スプリント計画MTG', startHour: 9, duration: 1.5 },
  { title: 'フロントエンド実装', startHour: 10, duration: 3 },
  { title: '上長との面談', startHour: 14, duration: 0.5 },
];

const WP2_TEMPLATES = [
  { title: 'フリーランス開発作業', startHour: 19, duration: 2 },
  { title: 'クライアントMTG', startHour: 20, duration: 1 },
  { title: 'UI実装作業', startHour: 21, duration: 1.5 },
  { title: '要件定義打合', startHour: 19, duration: 1 },
  { title: 'API実装', startHour: 20, duration: 2 },
  { title: '設計レビュー', startHour: 19, duration: 1 },
];

// 固定の祝日セット（年をまたぐ場合は適宜追加）
const HOLIDAYS = new Set([
  '2026-01-01', '2026-01-12',
  '2026-02-11', '2026-02-23',
  '2026-03-20',
  '2026-04-29',
  '2026-05-03', '2026-05-04', '2026-05-05', '2026-05-06',
  '2026-07-20',
  '2026-08-11',
  '2026-09-21', '2026-09-22', '2026-09-23',
  '2026-10-12',
  '2026-11-03', '2026-11-23',
]);

function generateDummyEvents(): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  let idCounter = 0;

  const wp1 = DUMMY_WORKPLACES[0];
  const wp2 = DUMMY_WORKPLACES[1];

  // 当月 + 過去2ヶ月を動的に生成
  const now = new Date();
  const months: { year: number; month: number; maxDay: number }[] = [];
  for (let offset = 2; offset >= 0; offset--) {
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const maxDay = new Date(y, m, 0).getDate();
    months.push({ year: y, month: m, maxDay });
  }

  for (const { year, month, maxDay } of months) {
    for (let day = 1; day <= maxDay; day++) {
      const date = new Date(year, month - 1, day);
      const dow = date.getDay();

      if (dow === 0 || dow === 6) continue;

      const pad = (n: number) => String(n).padStart(2, '0');
      const dateStr = `${year}-${pad(month)}-${pad(day)}`;
      if (HOLIDAYS.has(dateStr)) continue;

      const seed = year * 10000 + month * 100 + day;

      // WP1: 3–4 events per working day
      const numWp1 = seed % 2 === 0 ? 4 : 3;
      const usedHours = new Set<number>();

      for (let i = 0; i < numWp1; i++) {
        const idx = (seed % WP1_TEMPLATES.length + i * 4) % WP1_TEMPLATES.length;
        const tmpl = WP1_TEMPLATES[idx];
        if (usedHours.has(tmpl.startHour)) continue;
        usedHours.add(tmpl.startHour);

        const start = new Date(year, month - 1, day, tmpl.startHour, 0);
        const end = new Date(start.getTime() + tmpl.duration * 3600 * 1000);

        events.push({
          id: `ev-${++idCounter}`,
          workplaceId: wp1.id,
          workplaceName: wp1.name,
          workplaceColor: wp1.color,
          title: tmpl.title,
          start,
          end,
          durationHours: tmpl.duration,
          isAllDay: false,
        });
      }

      // WP2: Mon / Wed / Fri, 1–2 events in the evening
      if (dow === 1 || dow === 3 || dow === 5) {
        const numWp2 = seed % 3 === 0 ? 2 : 1;
        const usedWp2Hours = new Set<number>();

        for (let i = 0; i < numWp2; i++) {
          const idx = (seed % WP2_TEMPLATES.length + i * 3) % WP2_TEMPLATES.length;
          const tmpl = WP2_TEMPLATES[idx];
          if (usedWp2Hours.has(tmpl.startHour)) continue;
          usedWp2Hours.add(tmpl.startHour);

          const start = new Date(year, month - 1, day, tmpl.startHour, 0);
          const end = new Date(start.getTime() + tmpl.duration * 3600 * 1000);

          events.push({
            id: `ev-${++idCounter}`,
            workplaceId: wp2.id,
            workplaceName: wp2.name,
            workplaceColor: wp2.color,
            title: tmpl.title,
            start,
            end,
            durationHours: tmpl.duration,
            isAllDay: false,
          });
        }
      }
    }
  }

  return events.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export const DUMMY_EVENTS: CalendarEvent[] = generateDummyEvents();
