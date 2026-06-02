'use client';

import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import type { Workplace } from '@/types';

const PRESET_COLORS = [
  '#000000', '#444444', '#888888', '#cccccc',
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
];

interface Props {
  initial?: Workplace | null;
  onSave: (wp: Omit<Workplace, 'id'>) => void;
  onClose: () => void;
}

export default function AddWorkplaceModal({ initial, onSave, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [url, setUrl] = useState(initial?.icalUrl ?? '');
  const [color, setColor] = useState(initial?.color ?? PRESET_COLORS[4]);
  const [urlStatus, setUrlStatus] = useState<'idle' | 'ok' | 'ng'>('idle');

  useEffect(() => {
    if (!url) { setUrlStatus('idle'); return; }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/ical?url=${encodeURIComponent(url)}`, { signal: controller.signal });
        setUrlStatus(res.ok ? 'ok' : 'ng');
      } catch {
        setUrlStatus('ng');
      }
    }, 800);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [url]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    onSave({ name: name.trim(), icalUrl: url.trim(), color });
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-md3 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-black">
              {initial ? '勤務先を編集' : '勤務先を追加'}
            </h2>
            <button onClick={onClose} className="btn-text p-1.5 text-[#999]">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#666] uppercase tracking-widest mb-2">
                勤務先名
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例：株式会社ABC"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#666] uppercase tracking-widest mb-2">
                iCal URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://calendar.google.com/calendar/ical/…"
                  className="input-field pr-16"
                  required
                />
                {urlStatus !== 'idle' && (
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${
                    urlStatus === 'ok'
                      ? 'bg-white border-[#eaeaea] text-black'
                      : 'bg-white border-[#eaeaea] text-[#999]'
                  }`}>
                    {urlStatus === 'ok' ? <Check size={11} /> : <X size={11} />}
                    {urlStatus === 'ok' ? 'OK' : 'NG'}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#666] uppercase tracking-widest mb-2">
                表示色
              </label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      borderColor: color === c ? '#000' : 'transparent',
                      outline: color === c ? '2px solid #eaeaea' : 'none',
                      outlineOffset: '2px',
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-outlined flex-1 py-2.5">
                キャンセル
              </button>
              <button type="submit" className="btn-filled flex-1 py-2.5">
                {initial ? '更新' : '追加'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
