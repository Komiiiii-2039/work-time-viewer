'use client';

import type { Workplace } from '@/types';

interface Props {
  workplace: Workplace;
  onEdit: (wp: Workplace) => void;
  onDelete: (id: string) => void;
}

export default function WorkplaceCard({ workplace, onEdit, onDelete }: Props) {
  const maskedUrl =
    workplace.icalUrl.length > 60
      ? workplace.icalUrl.slice(0, 30) + '…' + workplace.icalUrl.slice(-20)
      : workplace.icalUrl;

  return (
    <div className="card-outlined p-4 flex items-center gap-4">
      <div
        className="w-1 h-10 rounded-full flex-shrink-0"
        style={{ backgroundColor: workplace.color }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-black truncate">{workplace.name}</p>
        <p className="text-xs text-[#999] truncate mt-0.5 font-mono">{maskedUrl}</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button onClick={() => onEdit(workplace)} className="btn-outlined py-1.5 px-4 text-xs">
          編集
        </button>
        <button
          onClick={() => onDelete(workplace.id)}
          className="btn-text py-1.5 px-3 text-xs text-[#999]"
        >
          削除
        </button>
      </div>
    </div>
  );
}
