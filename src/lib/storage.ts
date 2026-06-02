import type { Workplace } from '@/types';

export const STORAGE_KEY = 'wtv_workplaces';

export function loadWorkplaces(): Workplace[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Workplace[];
  } catch {}
  return [];
}

export function saveWorkplaces(wps: Workplace[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wps));
}
