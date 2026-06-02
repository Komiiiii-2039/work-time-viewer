'use client';

import { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import type { CalendarEvent } from '@/types';
import { formatInvoiceSummary } from '@/lib/aggregator';

interface Props {
  events: CalendarEvent[];
  notes: Record<string, string>;
}

export default function InvoiceSummary({ events, notes }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const text = formatInvoiceSummary(events, notes);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <div className="card-outlined">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-5 text-sm font-medium text-black hover:bg-[#fafafa] transition-colors rounded-[inherit]"
      >
        <span>請求書用サマリー</span>
        {open ? <ChevronUp size={16} className="text-[#999]" /> : <ChevronDown size={16} className="text-[#999]" />}
      </button>

      {open && (
        <div className="border-t border-[#eaeaea] px-5 pb-5">
          <div className="flex justify-end mt-4 mb-3">
            <button
              onClick={handleCopy}
              className={`btn-${copied ? 'tonal' : 'outlined'} py-1.5 px-4 text-xs gap-1.5`}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'コピー済み' : 'コピー'}
            </button>
          </div>
          <pre className="text-sm text-[#333] bg-[#fafafa] rounded-xl p-4 whitespace-pre-wrap font-mono leading-7 select-all">
            {text || 'イベントがありません'}
          </pre>
        </div>
      )}
    </div>
  );
}
