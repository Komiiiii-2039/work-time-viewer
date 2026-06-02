const KEY = 'wtv_notes';

export function loadNotes(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

/** 保存して新しい notes を返す */
export function saveNote(eventId: string, text: string): Record<string, string> {
  const notes = loadNotes();
  if (text.trim()) {
    notes[eventId] = text;
  } else {
    delete notes[eventId]; // 空にしたら ICS description に戻す
  }
  localStorage.setItem(KEY, JSON.stringify(notes));
  return { ...notes };
}
