import Link from "next/link";
import { TOTAL_BUDGET_KEY } from "@/lib/categories";
import { formatPercent, formatWon } from "@/lib/format";
import type { BudgetLevel, BudgetStatus } from "@/lib/stats";

const BAR_COLOR: Record<BudgetLevel, string> = {
  ok: "bg-blue-500",
  warning: "bg-amber-500",
  over: "bg-red-600",
};

const LEVEL_TEXT: Record<BudgetLevel, string | null> = {
  ok: null,
  warning: "주의",
  over: "초과",
};

/** 월 예산 대비 사용률. 예산이 없으면 설정 화면으로 안내한다. */
export function BudgetProgress({ statuses }: { statuses: BudgetStatus[] }) {
  return (
    <section aria-label="예산" className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">예산</h2>
        <Link href="/budget" className="text-sm text-blue-600 hover:underline">
          예산 설정
        </Link>
      </div>

      {statuses.length === 0 ? (
        <p className="text-sm text-gray-500">설정된 예산이 없어요. 예산을 정하면 사용률을 보여 드려요.</p>
      ) : (
        <ul className="space-y-3">
          {statuses.map((s) => (
            <li key={s.category} className="space-y-1">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium">
                  {s.category === TOTAL_BUDGET_KEY ? "전체 예산" : s.category}
                  {LEVEL_TEXT[s.level] && (
                    <span className={`ml-2 text-xs font-semibold ${s.level === "over" ? "text-red-600" : "text-amber-600"}`}>
                      {LEVEL_TEXT[s.level]}
                    </span>
                  )}
                </span>
                <span className="text-gray-600">
                  {formatWon(s.spent)} / {formatWon(s.budget)} ({formatPercent(s.ratio)})
                </span>
              </div>
              <div
                role="progressbar"
                aria-label={`${s.category} 예산 사용률`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.min(100, Math.round(s.ratio * 100))}
                className="h-2 overflow-hidden rounded-full bg-gray-100"
              >
                <div
                  className={`h-full ${BAR_COLOR[s.level]}`}
                  style={{ width: `${Math.min(100, s.ratio * 100)}%` }}
                />
              </div>
              {s.level === "over" && (
                <p className="text-xs text-red-600">예산보다 {formatWon(s.spent - s.budget)} 더 썼어요.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
