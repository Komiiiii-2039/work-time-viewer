import type { TitleSummary } from '@/types';

interface Props {
  data: TitleSummary[];
}

export default function TitleSummaryTable({ data }: Props) {
  if (data.length === 0) {
    return <p className="text-[#999] text-sm text-center py-10">データがありません</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#eaeaea]">
            <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-[#999] uppercase tracking-widest">タイトル</th>
            <th className="text-left py-2.5 px-3 text-[10px] font-semibold text-[#999] uppercase tracking-widest">勤務先</th>
            <th className="text-right py-2.5 px-3 text-[10px] font-semibold text-[#999] uppercase tracking-widest">合計</th>
            <th className="text-right py-2.5 px-3 text-[10px] font-semibold text-[#999] uppercase tracking-widest">件数</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-[#fafafa] hover:bg-[#fafafa] transition-colors">
              <td className="py-2.5 px-3 font-medium text-black">{row.title}</td>
              <td className="py-2.5 px-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: row.workplaceColor }} />
                  <span className="text-[#666]">{row.workplaceName}</span>
                </div>
              </td>
              <td className="py-2.5 px-3 text-right font-semibold text-black">{row.totalHours}h</td>
              <td className="py-2.5 px-3 text-right text-[#999]">{row.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
