/**
 * JST (Asia/Tokyo, UTC+9) 固定のタイムゾーンユーティリティ
 *
 * JS の Date は常に UTC 内部値を持つ。
 * toZonedTime  : UTC Date → 「JST の時刻を UTC として表現した Date」
 * fromZonedTime: 「JST の時刻を UTC として表現した Date」→ UTC Date
 * この 2 関数を使って date-fns の各種演算を JST 基準で行う。
 */
import {
  toZonedTime,
  fromZonedTime,
  formatInTimeZone,
} from 'date-fns-tz';
import {
  startOfDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
} from 'date-fns';

export const JST = 'Asia/Tokyo';

// ─── 表示 ───────────────────────────────────────────────

/** UTC Date を JST でフォーマット */
export function fmtJST(date: Date, fmt: string): string {
  return formatInTimeZone(date, JST, fmt);
}

/** UTC Date の JST 日付文字列 "yyyy-MM-dd" */
export function jstDateStr(date: Date): string {
  return formatInTimeZone(date, JST, 'yyyy-MM-dd');
}

// ─── 期間境界 (UTC Date を返す) ─────────────────────────

/** JST の月初 00:00:00 を UTC Date で返す */
export function startOfMonthJST(date: Date): Date {
  return fromZonedTime(startOfMonth(toZonedTime(date, JST)), JST);
}

/** JST の月末 23:59:59.999 を UTC Date で返す */
export function endOfMonthJST(date: Date): Date {
  return fromZonedTime(endOfMonth(toZonedTime(date, JST)), JST);
}

/** JST の週初 (月曜) 00:00:00 を UTC Date で返す */
export function startOfWeekJST(date: Date): Date {
  return fromZonedTime(startOfWeek(toZonedTime(date, JST), { weekStartsOn: 1 }), JST);
}

/** JST の週末 (日曜) 23:59:59.999 を UTC Date で返す */
export function endOfWeekJST(date: Date): Date {
  return fromZonedTime(endOfWeek(toZonedTime(date, JST), { weekStartsOn: 1 }), JST);
}

/**
 * ユーザーが入力した "YYYY-MM-DD" 文字列を
 * JST の 00:00:00 / 23:59:59 に対応する UTC Date に変換
 */
export function jstStrToUTC(dateStr: string, isEnd = false): Date {
  const suffix = isEnd ? 'T23:59:59' : 'T00:00:00';
  // new Date(str) はローカルでパースされるため、直接 fromZonedTime に渡す
  return fromZonedTime(dateStr + suffix, JST);
}

// ─── 日付シーケンス生成 ─────────────────────────────────

/**
 * [start, end] の範囲を JST 日単位で反復し、
 * 各 JST 日の 00:00:00 に対応する UTC Date の配列を返す
 */
export function eachDayJST(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  let cur = startOfDay(toZonedTime(start, JST));          // JST 空間の 00:00
  const last = startOfDay(toZonedTime(end, JST));
  while (cur <= last) {
    days.push(fromZonedTime(cur, JST));                   // UTC に戻す
    cur = addDays(cur, 1);
  }
  return days;
}

/**
 * [start, end] の範囲を JST 週 (月曜始まり) 単位で反復し、
 * 各 JST 週の月曜 00:00:00 に対応する UTC Date の配列を返す
 */
export function eachWeekJST(start: Date, end: Date): Date[] {
  const weeks: Date[] = [];
  let cur = startOfWeek(toZonedTime(start, JST), { weekStartsOn: 1 });
  const last = startOfDay(toZonedTime(end, JST));
  while (cur <= last) {
    weeks.push(fromZonedTime(cur, JST));
    cur = addDays(cur, 7);
  }
  return weeks;
}
