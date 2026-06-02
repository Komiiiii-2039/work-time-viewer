export interface Workplace {
  id: string;
  name: string;
  icalUrl: string;
  color: string;
}

export interface CalendarEvent {
  id: string;
  workplaceId: string;
  workplaceName: string;
  workplaceColor: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  durationHours: number;
  isAllDay: boolean;
}

export interface AggregationResult {
  totalHours: number;
  workingDays: number;
}

export interface TitleEntry {
  title: string;
  color: string;
  totalHours: number;
}

export interface WeeklyData {
  weekLabel: string;
  weekStart: Date;
  byTitle: Record<string, number>;
}

export interface DailyData {
  date: string;
  dateObj: Date;
  total: number;
  byTitle: Record<string, number>;
  events: CalendarEvent[];
}

export interface TitleSummary {
  title: string;
  workplaceName: string;
  workplaceColor: string;
  totalHours: number;
  count: number;
}
