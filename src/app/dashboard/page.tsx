'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { addMonths, subMonths, subDays } from 'date-fns';
import { Settings, RefreshCw, ChevronLeft, ChevronRight, Github } from 'lucide-react';
import { startOfMonthJST, endOfMonthJST, jstStrToUTC, fmtJST } from '@/lib/timezone';
import type { Workplace } from '@/types';
import { DUMMY_WORKPLACES, DUMMY_EVENTS } from '@/lib/dummyData';
import { loadWorkplaces } from '@/lib/storage';
import { useCalendarData } from '@/lib/useCalendarData';
import { filterEvents, aggregate, getWeeklyData, getDailyData, getTitleSummary, getTopTitles, getDescriptionCloud } from '@/lib/aggregator';
import { loadNotes, saveNote } from '@/lib/localNotes';
import SummaryCards from '@/components/SummaryCards';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import TitleSummaryTable from '@/components/TitleSummaryTable';
import WordCloud from '@/components/WordCloud';
import EventListTable from '@/components/EventListTable';
import InvoiceSummary from '@/components/InvoiceSummary';

const WeeklyChart = dynamic(() => import('@/components/WeeklyChart'), { ssr: false });
const DailyChart = dynamic(() => import('@/components/DailyChart'), { ssr: false });
const CumulativeChart = dynamic(() => import('@/components/CumulativeChart'), { ssr: false });

type PeriodMode = 'month' | 'last30';

function isRealWorkplace(wps: Workplace[]): boolean {
  return wps.some(
    (wp) =>
      !DUMMY_WORKPLACES.some((d) => d.id === wp.id) ||
      !DUMMY_WORKPLACES.some((d) => d.icalUrl === wp.icalUrl)
  );
}

export default function DashboardPage() {
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [selectedWpId, setSelectedWpId] = useState<string>('all');
  const [periodMode, setPeriodMode] = useState<PeriodMode>('month');
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonthJST(new Date()));
  const [initialized, setInitialized] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    const wps = loadWorkplaces();
    setWorkplaces(wps.length > 0 ? wps : DUMMY_WORKPLACES);
    setNotes(loadNotes());
    setInitialized(true);
  }, []);

  function handleSaveNote(eventId: string, text: string) {
    setNotes(saveNote(eventId, text));
  }

  const useReal = initialized && isRealWorkplace(workplaces);
  const { events: realEvents, wpStatuses, loading, lastUpdated, refresh } = useCalendarData(
    useReal ? workplaces : []
  );

  const allEvents = useMemo(() => {
    if (useReal && realEvents.length > 0) return realEvents;
    if (useReal && loading) return [];
    return DUMMY_EVENTS;
  }, [useReal, realEvents, loading]);

  const isDemoMode = !useReal;

  const { startDate, endDate } = useMemo(() => {
    if (periodMode === 'month') {
      return { startDate: startOfMonthJST(currentMonth), endDate: endOfMonthJST(currentMonth) };
    }
    // 直近30日: 今日を含む過去30日
    const todayStr = fmtJST(new Date(), 'yyyy-MM-dd');
    const startStr = fmtJST(subDays(new Date(), 29), 'yyyy-MM-dd');
    return { startDate: jstStrToUTC(startStr, false), endDate: jstStrToUTC(todayStr, true) };
  }, [periodMode, currentMonth]);

  const wpIds = selectedWpId === 'all' ? 'all' : [selectedWpId] as string[] | 'all';

  const filteredEvents = useMemo(
    () => filterEvents(allEvents, wpIds, startDate, endDate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allEvents, selectedWpId, startDate, endDate]
  );

  const aggregation = useMemo(() => aggregate(filteredEvents), [filteredEvents]);
  const topTitles = useMemo(() => getTopTitles(filteredEvents, 8), [filteredEvents]);
  const weeklyData = useMemo(() => getWeeklyData(filteredEvents, startDate, endDate), [filteredEvents, startDate, endDate]);
  const dailyData = useMemo(() => getDailyData(filteredEvents, startDate, endDate), [filteredEvents, startDate, endDate]);
  const titleSummary = useMemo(() => getTitleSummary(filteredEvents), [filteredEvents]);
  const descriptionCloud = useMemo(() => getDescriptionCloud(filteredEvents), [filteredEvents]);

  if (!initialized) return null;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="bg-white border-b border-[#eaeaea] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-semibold text-black hidden sm:block">稼働時間集計</h1>
            <Link href="/" className="btn-text py-1.5 px-3 text-xs text-[#666] gap-1.5">
              <Settings size={13} /> 設定
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Fetch status */}
            {wpStatuses.map((s) => (
              <span
                key={s.id}
                title={s.errorMsg}
                className={`hidden md:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                  s.status === 'ok'      ? 'border-[#eaeaea] text-black bg-white' :
                  s.status === 'error'   ? 'border-[#eaeaea] text-[#999] bg-white' :
                  s.status === 'loading' ? 'border-[#eaeaea] text-[#666] bg-white' :
                  'border-[#eaeaea] text-[#bbb] bg-white'
                }`}
              >
                {s.status === 'loading' && <RefreshCw size={11} className="animate-spin" />}
                {s.status === 'ok'      && <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />}
                {s.status === 'error'   && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                {s.name}
              </span>
            ))}

            {lastUpdated && (
              <p className="text-xs text-[#999] hidden md:block font-mono">
                {fmtJST(lastUpdated, 'HH:mm')}
              </p>
            )}
            {isDemoMode && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full border border-[#eaeaea] text-[#666]">
                デモ
              </span>
            )}
            <button
              onClick={refresh}
              disabled={loading}
              className="btn-outlined py-1.5 px-4 text-xs gap-1.5 disabled:opacity-40"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              {loading ? '読込中' : '更新'}
            </button>
            <a
              href="https://github.com/Komiiiii-2039/work-time-viewer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#999] hover:text-black transition-colors"
              title="Komiiiii-2039/work-time-viewer"
            >
              <Github size={18} />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 py-6 space-y-5">

        {/* Demo notice */}
        {isDemoMode && (
          <div className="card-filled px-4 py-3 text-sm text-[#666]">
            <strong className="text-black">デモモード:</strong>{' '}
            サンプルデータ（直近3ヶ月）を表示中です。
            <Link href="/" className="ml-2 underline text-black">設定</Link>
            で実際の iCal URL を登録してください。
          </div>
        )}

        {/* Workplace filter */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedWpId('all')}
            className={`chip ${selectedWpId === 'all' ? 'chip-active' : ''}`}
          >
            すべて
          </button>
          {workplaces.map((wp) => (
            <button
              key={wp.id}
              onClick={() => setSelectedWpId(wp.id)}
              className={`chip ${selectedWpId === wp.id ? 'chip-active' : ''} gap-1.5`}
              style={selectedWpId === wp.id ? {} : {}}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: selectedWpId === wp.id ? 'rgba(255,255,255,0.7)' : wp.color }}
              />
              {wp.name}
            </button>
          ))}
        </div>

        {/* Period filter */}
        <div className="card-outlined p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-1.5">
              <button
                onClick={() => setPeriodMode('month')}
                className={`chip ${periodMode === 'month' ? 'chip-active' : ''}`}
              >
                月単位
              </button>
              <button
                onClick={() => setPeriodMode('last30')}
                className={`chip ${periodMode === 'last30' ? 'chip-active' : ''}`}
              >
                直近30日
              </button>
            </div>

            {periodMode === 'month' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
                  className="btn-outlined p-2"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-sm font-semibold text-black min-w-[80px] text-center">
                  {fmtJST(startDate, 'yyyy年M月')}
                </span>
                <button
                  onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
                  className="btn-outlined p-2"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            ) : (
              <span className="text-xs text-[#999] font-mono">
                {fmtJST(startDate, 'M/d')} — {fmtJST(endDate, 'M/d')}
              </span>
            )}

            <p className="text-xs text-[#999] ml-auto font-mono">
              {filteredEvents.length} events
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <SummaryCards data={aggregation} />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card-outlined p-5 flex flex-col gap-5">
            <div>
              <h2 className="text-xs font-semibold text-[#999] uppercase tracking-widest mb-4">週別稼働時間</h2>
              <WeeklyChart data={weeklyData} topTitles={topTitles} />
            </div>
            <div className="border-t border-[#eaeaea] pt-4">
              <h2 className="text-xs font-semibold text-[#999] uppercase tracking-widest mb-3">作業内容</h2>
              <WordCloud data={descriptionCloud} />
            </div>
          </div>
          <div className="card-outlined p-5 flex flex-col gap-5">
            <div>
              <h2 className="text-xs font-semibold text-[#999] uppercase tracking-widest mb-4">日別稼働時間</h2>
              <DailyChart data={dailyData} topTitles={topTitles} notes={notes} onSaveNote={handleSaveNote} />
            </div>
            <div className="border-t border-[#eaeaea] pt-4">
              <h2 className="text-xs font-semibold text-[#999] uppercase tracking-widest mb-3">日別稼働</h2>
              <ActivityHeatmap
                dailyData={dailyData}
                startDate={startDate}
                endDate={periodMode === 'last30' ? endDate : undefined}
              />
            </div>
          </div>
        </div>

        {/* Cumulative stacked area chart */}
        <div className="card-outlined p-5">
          <h2 className="text-xs font-semibold text-[#999] uppercase tracking-widest mb-4">日別稼働（積み上げ）</h2>
          <CumulativeChart data={dailyData} />
        </div>

        {/* Title summary */}
        <div className="card-outlined p-5">
          <h2 className="text-xs font-semibold text-[#999] uppercase tracking-widest mb-4">タイトル別集計</h2>
          <TitleSummaryTable data={titleSummary} />
        </div>

        {/* Invoice summary */}
        <InvoiceSummary events={filteredEvents} notes={notes} />

        {/* Event list */}
        <div className="card-outlined p-5">
          <h2 className="text-xs font-semibold text-[#999] uppercase tracking-widest mb-4">イベント一覧</h2>
          <EventListTable events={filteredEvents} workplaces={workplaces} notes={notes} onSaveNote={handleSaveNote} />
        </div>
      </main>

    </div>
  );
}
