'use client';

import { useMemo } from 'react';
import { toZonedTime } from 'date-fns-tz';
import { fmtJST, jstDateStr, eachDayJST, startOfMonthJST, endOfMonthJST } from '@/lib/timezone';
import type { DailyData } from '@/types';

const JST = 'Asia/Tokyo';

// 0h → 8h+ の5段階 (GitHub草スタイル、Vercel Blue基調)
const LEVEL_COLORS = ['#eaeaea', '#d3e5ff', '#a8ceff', '#3d8ef8', '#0070f3'] as const;
const LEVEL_HOURS  = [0, 0.1, 3, 6, 8] as const; // 各レベルの下限

function getLevel(hours: number): number {
  if (hours < LEVEL_HOURS[1]) return 0;
  if (hours < LEVEL_HOURS[2]) return 1;
  if (hours < LEVEL_HOURS[3]) return 2;
  if (hours < LEVEL_HOURS[4]) return 3;
  return 4;
}

interface Props {
  dailyData: DailyData[];
  startDate: Date;
  endDate?: Date; // 指定時はその範囲のみ表示、省略時は startDate の月全体
}

export default function ActivityHeatmap({ dailyData, startDate, endDate }: Props) {
  // 日付文字列 → 合計稼働時間のマップ
  const hoursByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of dailyData) {
      if (d.total > 0) map.set(jstDateStr(d.dateObj), d.total);
    }
    return map;
  }, [dailyData]);

  // endDate 省略時は startDate の月全体、指定時はその範囲
  const gridStart = endDate ? startDate : startOfMonthJST(startDate);
  const gridEnd   = endDate ?? endOfMonthJST(startDate);
  const days = eachDayJST(gridStart, gridEnd);

  // 月曜始まりの先頭パディング (0=月 … 6=日)
  const firstDow = (toZonedTime(gridStart, JST).getDay() + 6) % 7;

  const cells: (Date | null)[] = [
    ...Array<null>(firstDow).fill(null),
    ...days,
  ];
  // 末尾を 7 の倍数に揃える
  const tail = cells.length % 7;
  if (tail !== 0) cells.push(...Array<null>(7 - tail).fill(null));

  const todayStr = jstDateStr(new Date());
  const DOW = ['月', '火', '水', '木', '金', '土', '日'];

  return (
    <div className="select-none">
      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DOW.map((label, i) => (
          <div
            key={label}
            className={`text-center text-[9px] font-medium ${
              i >= 5 ? 'text-[#ccc]' : 'text-[#bbb]'
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* 日付セル */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`pad-${i}`} className="aspect-square" />;

          const dateStr = jstDateStr(day);
          const hours   = hoursByDate.get(dateStr) ?? 0;
          const level   = getLevel(hours);
          const isToday = dateStr === todayStr;
          const dow     = (toZonedTime(day, JST).getDay() + 6) % 7;
          const isWeekend = dow >= 5;
          const textLight = level >= 3;

          return (
            <div
              key={dateStr}
              className="relative aspect-square rounded flex items-center justify-center"
              style={{ backgroundColor: LEVEL_COLORS[level] }}
              title={`${fmtJST(day, 'M/d(EEE)')}  ${
                hours > 0 ? hours.toFixed(1) + 'h' : '稼働なし'
              }`}
            >
              <span
                className="text-[9px] font-medium leading-none"
                style={{
                  color: textLight
                    ? 'rgba(255,255,255,0.9)'
                    : isWeekend
                    ? '#ccc'
                    : '#888',
                }}
              >
                {fmtJST(day, 'd')}
              </span>

              {isToday && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0.5 h-0.5 rounded-full"
                  style={{
                    backgroundColor: textLight ? 'rgba(255,255,255,0.8)' : '#000',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* 凡例 */}
      <div className="flex items-center gap-1 mt-2 justify-end">
        <span className="text-[9px] text-[#ccc]">少</span>
        {LEVEL_COLORS.slice(1).map((color, i) => (
          <div
            key={i}
            className="w-2.5 h-2.5 rounded-sm"
            style={{ backgroundColor: color }}
          />
        ))}
        <span className="text-[9px] text-[#ccc]">多</span>
      </div>
    </div>
  );
}
