import { formatWon } from "@/lib/format";
import type { MonthTotals } from "@/lib/stats";

const BAR_AREA_REM = 7;

/** 월별 수입·지출 추이 막대. 모든 막대는 같은 기준(가장 큰 값)으로 그려 달끼리 비교할 수 있다. */
export function MonthlyTrend({ months }: { months: MonthTotals[] }) {
  const max = Math.max(1, ...months.flatMap((m) => [m.income, m.expense]));
  const heightOf = (value: number) => `${(value / max) * BAR_AREA_REM}rem`;

  return (
    <section aria-label="월별 추이" className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">최근 {months.length}개월</h2>
        <p className="flex gap-3 text-xs text-gray-500">
          <span>
            <span className="mr-1 inline-block size-2 rounded-sm bg-blue-500" />
            수입
          </span>
          <span>
            <span className="mr-1 inline-block size-2 rounded-sm bg-rose-400" />
            지출
          </span>
        </p>
      </div>
      <ul className="grid gap-2" style={{ gridTemplateColumns: `repeat(${months.length}, minmax(0, 1fr))` }}>
        {months.map((m) => (
          <li key={m.month} className="space-y-1 text-center">
            <div
              className="flex items-end justify-center gap-1"
              style={{ height: `${BAR_AREA_REM}rem` }}
              role="img"
              aria-label={`${m.month} 수입 ${formatWon(m.income)}, 지출 ${formatWon(m.expense)}`}
            >
              <div className="w-3 rounded-t bg-blue-500" style={{ height: heightOf(m.income) }} />
              <div className="w-3 rounded-t bg-rose-400" style={{ height: heightOf(m.expense) }} />
            </div>
            <p className="text-xs text-gray-600">{Number(m.month.slice(5))}월</p>
            <p className="text-[11px] text-rose-600">{m.expense > 0 ? formatWon(m.expense) : "-"}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
