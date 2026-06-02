'use client';

import type { WordEntry } from '@/lib/aggregator';

interface Props {
  data: WordEntry[];
}

export default function WordCloud({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-[#999] text-xs text-center py-6">descriptionがありません</p>;
  }

  const maxC = Math.max(...data.map((d) => d.count));
  const minC = Math.min(...data.map((d) => d.count));
  const range = maxC - minC || 1;

  function fontSize(c: number) {
    return Math.round(11 + ((c - minC) / range) * 12);
  }
  function opacity(c: number) {
    return 0.4 + ((c - minC) / range) * 0.6;
  }

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-2 items-baseline py-1">
      {data.map((item, i) => (
        <span
          key={i}
          className="font-medium leading-snug cursor-default transition-opacity hover:opacity-100"
          style={{
            fontSize: fontSize(item.count) + 'px',
            color: '#000',
            opacity: opacity(item.count),
          }}
          title={`${item.text}  ${item.count}回`}
        >
          {item.text}
        </span>
      ))}
    </div>
  );
}
