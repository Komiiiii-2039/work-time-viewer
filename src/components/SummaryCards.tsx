import type { AggregationResult } from '@/types';

interface Props {
  data: AggregationResult;
  todayHours?: number;
}

interface CardProps {
  label: string;
  value: string;
  sub?: string;
  rightLabel?: string;
  rightValue?: string;
}

function Card({ label, value, sub, rightLabel, rightValue }: CardProps) {
  return (
    <div className="card-elevated p-5">
      {rightValue ? (
        <div className="flex items-stretch justify-between">
          <div>
            <p className="text-[10px] font-semibold text-[#999] uppercase tracking-widest">{label}</p>
            <p className="text-4xl font-semibold text-black mt-2 tracking-tight leading-none">{value}</p>
          </div>
          <div className="w-px bg-[#eaeaea] mx-4" />
          <div>
            <p className="text-[10px] font-semibold text-[#999] uppercase tracking-widest">{rightLabel}</p>
            <p className="text-4xl font-semibold text-black mt-2 tracking-tight leading-none">{rightValue}</p>
          </div>
        </div>
      ) : (
        <>
          <p className="text-[10px] font-semibold text-[#999] uppercase tracking-widest">{label}</p>
          <p className="text-4xl font-semibold text-black mt-2 tracking-tight leading-none">{value}</p>
        </>
      )}
      {sub && <p className="text-xs text-[#666] mt-2">{sub}</p>}
    </div>
  );
}

export default function SummaryCards({ data, todayHours }: Props) {
  const avgPerDay = data.workingDays > 0
    ? (data.totalHours / data.workingDays).toFixed(1) + 'h/日'
    : '—';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      <Card
        label="合計稼働時間"
        value={data.totalHours.toFixed(1) + 'h'}
        sub={`${data.workingDays}日稼働`}
      />
      <Card
        label="稼働日数"
        value={`${data.workingDays}日`}
        sub={`平均 ${avgPerDay}`}
      />
      <Card
        label="平均時間/日"
        value={data.workingDays > 0 ? (data.totalHours / data.workingDays).toFixed(1) + 'h' : '—'}
        sub={`合計 ${data.totalHours.toFixed(1)}h`}
        rightLabel="今日"
        rightValue={todayHours !== undefined ? todayHours.toFixed(1) + 'h' : undefined}
      />
    </div>
  );
}
