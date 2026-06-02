'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, ArrowRight, CalendarDays } from 'lucide-react';
import type { Workplace } from '@/types';
import { DUMMY_WORKPLACES } from '@/lib/dummyData';
import { loadWorkplaces, saveWorkplaces } from '@/lib/storage';
import WorkplaceCard from '@/components/WorkplaceCard';
import AddWorkplaceModal from '@/components/AddWorkplaceModal';

export default function SettingsPage() {
  const [workplaces, setWorkplaces] = useState<Workplace[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Workplace | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const stored = loadWorkplaces();
    setWorkplaces(stored.length > 0 ? stored : DUMMY_WORKPLACES);
    if (stored.length === 0) saveWorkplaces(DUMMY_WORKPLACES);
    setInitialized(true);
  }, []);

  function handleSave(data: Omit<Workplace, 'id'>) {
    if (editTarget) {
      const updated = workplaces.map((wp) => wp.id === editTarget.id ? { ...wp, ...data } : wp);
      setWorkplaces(updated);
      saveWorkplaces(updated);
    } else {
      if (workplaces.length >= 10) return;
      const newWp: Workplace = { ...data, id: `wp-${Date.now()}` };
      const updated = [...workplaces, newWp];
      setWorkplaces(updated);
      saveWorkplaces(updated);
    }
    setShowModal(false);
    setEditTarget(null);
  }

  function handleDelete(id: string) {
    const updated = workplaces.filter((wp) => wp.id !== id);
    setWorkplaces(updated);
    saveWorkplaces(updated);
  }

  function handleEdit(wp: Workplace) {
    setEditTarget(wp);
    setShowModal(true);
  }

  if (!initialized) return null;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="bg-white border-b border-[#eaeaea]">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-black">稼働時間集計</h1>
            <p className="text-xs text-[#999] mt-0.5">勤務先 (iCal) の設定</p>
          </div>
          {workplaces.length > 0 && (
            <Link href="/dashboard" className="btn-filled py-2 px-5 text-xs gap-1.5">
              ダッシュボード <ArrowRight size={13} />
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8">
        {workplaces.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#f4f4f4] mb-5">
              <CalendarDays size={28} className="text-[#666]" />
            </div>
            <h2 className="text-lg font-semibold text-black mb-2">勤務先を登録してください</h2>
            <p className="text-sm text-[#666] mb-8">
              iCal URL（Google カレンダーなど）を登録すると<br />稼働時間を自動集計します
            </p>
            <button onClick={() => setShowModal(true)} className="btn-filled py-3 px-8 gap-2">
              <Plus size={16} /> 勤務先を追加
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-[#999] uppercase tracking-widest">
                登録済み勤務先 ({workplaces.length}/10)
              </p>
              {workplaces.length < 10 && (
                <button
                  onClick={() => { setEditTarget(null); setShowModal(true); }}
                  className="btn-outlined py-1.5 px-4 text-xs gap-1.5"
                >
                  <Plus size={13} /> 追加
                </button>
              )}
            </div>

            <div className="space-y-2">
              {workplaces.map((wp) => (
                <WorkplaceCard key={wp.id} workplace={wp} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>

            <div className="mt-8 card-filled p-4">
              <p className="text-xs text-[#666]">
                <span className="font-semibold text-black">デモモード:</span>{' '}
                サンプルデータで 2026年4〜5月 の稼働時間を確認できます。
                実際の iCal URL を登録すると本番データを使用します。
              </p>
            </div>
          </>
        )}
      </main>

      {showModal && (
        <AddWorkplaceModal
          initial={editTarget}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
        />
      )}
    </div>
  );
}
