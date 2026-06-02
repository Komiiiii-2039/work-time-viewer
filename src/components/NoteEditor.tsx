'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import type { CalendarEvent } from '@/types';

interface Props {
  event: CalendarEvent;
  notes: Record<string, string>;
  onSaveNote: (id: string, text: string) => void;
  className?: string;
}

export default function NoteEditor({ event, notes, onSaveNote, className = '' }: Props) {
  const displayed = notes[event.id] ?? event.description ?? '';
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  function startEdit() {
    setDraft(displayed);
    setEditing(true);
  }

  if (editing) {
    return (
      <div className={`space-y-2 ${className}`}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-full text-xs rounded-xl border border-[#eaeaea] px-3 py-2 resize-none outline-none focus:border-black transition-colors font-sans"
          rows={3}
          autoFocus
          placeholder="メモを入力…"
        />
        <div className="flex gap-2">
          <button
            onClick={() => { onSaveNote(event.id, draft); setEditing(false); }}
            className="btn-filled text-xs py-1.5 px-4"
          >
            保存
          </button>
          <button
            onClick={() => setEditing(false)}
            className="btn-outlined text-xs py-1.5 px-4"
          >
            キャンセル
          </button>
          {notes[event.id] && (
            <button
              onClick={() => { onSaveNote(event.id, ''); setEditing(false); }}
              className="btn-text text-xs py-1.5 px-3 text-[#999] ml-auto"
            >
              削除
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-2 group ${className}`}>
      <div className="flex-1">
        {displayed ? (
          <p className="text-xs text-[#444] whitespace-pre-wrap leading-relaxed border-l-2 border-[#eaeaea] pl-3">
            {displayed}
            {notes[event.id] && (
              <span className="ml-1 text-[#999] text-[10px]">（編集済）</span>
            )}
          </p>
        ) : (
          <p className="text-xs text-[#bbb] border-l-2 border-dashed border-[#eaeaea] pl-3">メモなし</p>
        )}
      </div>
      <button
        onClick={startEdit}
        className="text-[#ccc] hover:text-black transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs px-1"
        title="メモを編集"
      >
        <Pencil size={12} /> 編集
      </button>
    </div>
  );
}
