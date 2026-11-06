import { formatPercent, formatWon } from "@/lib/format";
import type { Summary } from "@/lib/stats";

type Props = {
  summary: Summary;
  /** 전월 지출. 비교할 수 없으면(없거나 0) 비교 문구를 숨긴다. */
  previousExpense: number;
  /** 월말 예상 지출. 이번 달이 아니면 null. */
  projectedExpense: number | null;
};

/** 전월 대비 지출 변화 문구. 색에만 기대지 않도록 "늘었어요/줄었어요" 글자와 화살표를 함께 쓴다. */
function expenseChangeText(expense: number, previous: number): string | null {
  if (previous <= 0) return null;
  const diff = expense - previous;
  if (diff === 0) return "전월과 같아요";
  const ratio = formatPercent(Math.abs(diff) / previous);
  return diff > 0
    ? `전월보다 ▲ ${formatWon(diff)} (${ratio}) 늘었어요`
    : `전월보다 ▼ ${formatWon(-diff)} (${ratio}) 줄었어요`;
}

const cardClass = "rounded-xl border border-gray-200 bg-white p-4";

/** 이번 달 수입·지출·잔액과 지출 인사이트 */
export function SummaryCards({ summary, previousExpense, projectedExpense }: Props) {
  const change = expenseChangeText(summary.expense, previousExpense);

  return (
    <section aria-label="월 요약" className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className={cardClass}>
          <p className="text-sm text-gray-500">수입</p>
          <p className="text-xl font-bold text-blue-600">{formatWon(summary.income)}</p>
        </div>
        <div className={cardClass}>
          <p className="text-sm text-gray-500">지출</p>
          <p className="text-xl font-bold text-rose-600">{formatWon(summary.expense)}</p>
          {change && <p className="mt-1 text-xs text-gray-500">{change}</p>}
        </div>
        <div className={cardClass}>
          <p className="text-sm text-gray-500">잔액</p>
          <p className={`text-xl font-bold ${summary.balance < 0 ? "text-red-600" : ""}`}>
            {formatWon(summary.balance)}
          </p>
        </div>
      </div>
      {projectedExpense !== null && summary.expense > 0 && (
        <p className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-600">
          지금 속도로 쓰면 이번 달 지출은 약 <strong>{formatWon(projectedExpense)}</strong>이 될 것 같아요.
        </p>
      )}
    </section>
  );
}
