import { EXPENSE_CATEGORIES, TOTAL_BUDGET_KEY, type Category } from "./categories";
import { daysInMonth, isInMonth, shiftMonth, type YearMonth } from "./dates";
import type { SavedBudget, SavedTransaction } from "./schemas";

export type Summary = { income: number; expense: number; balance: number; count: number };

export type CategoryShare = { category: Category; total: number; ratio: number };

export type BudgetLevel = "ok" | "warning" | "over";

export type BudgetStatus = {
  /** "전체" 또는 지출 카테고리 */
  category: string;
  budget: number;
  spent: number;
  /** spent / budget (1이면 100%, 초과하면 1보다 크다) */
  ratio: number;
  level: BudgetLevel;
};

export type MonthTotals = { month: YearMonth; income: number; expense: number };

/** 예산 사용률이 이 값 이상이면 경고 */
export const BUDGET_WARNING_RATIO = 0.8;

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

/** 해당 월의 거래만 골라낸다. */
export function transactionsInMonth(
  transactions: SavedTransaction[],
  month: YearMonth,
): SavedTransaction[] {
  return transactions.filter((t) => isInMonth(t.date, month));
}

/** 수입·지출·잔액 합계 */
export function summarize(transactions: SavedTransaction[]): Summary {
  const income = sum(transactions.filter((t) => t.type === "INCOME").map((t) => t.total));
  const expense = sum(transactions.filter((t) => t.type === "EXPENSE").map((t) => t.total));
  return { income, expense, balance: income - expense, count: transactions.length };
}

/** 지출을 카테고리별로 집계한다. 금액이 큰 순서이며 ratio는 전체 지출 대비 비율(0~1). */
export function expenseByCategory(transactions: SavedTransaction[]): CategoryShare[] {
  const totals = new Map<Category, number>();
  for (const t of transactions) {
    if (t.type !== "EXPENSE") continue;
    for (const item of t.items) {
      totals.set(item.category, (totals.get(item.category) ?? 0) + item.price);
    }
  }
  const all = sum([...totals.values()]);
  return [...totals.entries()]
    .map(([category, total]) => ({ category, total, ratio: all === 0 ? 0 : total / all }))
    .sort((a, b) => b.total - a.total);
}

/** 예산 대비 지출 현황. "전체"가 맨 앞이고 나머지는 카테고리 정의 순서를 따른다. */
export function budgetStatuses(
  budgets: SavedBudget[],
  monthExpenseTransactions: SavedTransaction[],
): BudgetStatus[] {
  const byCategory = new Map(
    expenseByCategory(monthExpenseTransactions).map((share) => [share.category as string, share.total]),
  );
  const totalSpent = summarize(monthExpenseTransactions).expense;
  const order = [TOTAL_BUDGET_KEY, ...EXPENSE_CATEGORIES] as string[];

  return budgets
    .filter((b) => b.amount > 0)
    .sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category))
    .map(({ category, amount }) => {
      const spent = category === TOTAL_BUDGET_KEY ? totalSpent : (byCategory.get(category) ?? 0);
      const ratio = spent / amount;
      const level: BudgetLevel =
        ratio >= 1 ? "over" : ratio >= BUDGET_WARNING_RATIO ? "warning" : "ok";
      return { category, budget: amount, spent, ratio, level };
    });
}

/** endMonth까지 최근 count개월의 수입·지출. 오래된 달이 먼저 온다. */
export function monthlyTrend(
  transactions: SavedTransaction[],
  endMonth: YearMonth,
  count: number,
): MonthTotals[] {
  return Array.from({ length: count }, (_, i) => {
    const month = shiftMonth(endMonth, i - (count - 1));
    const { income, expense } = summarize(transactionsInMonth(transactions, month));
    return { month, income, expense };
  });
}

/** 일(1~31)별 수입·지출 합계. 거래가 없는 날은 키가 없다. */
export function dailyTotals(
  transactions: SavedTransaction[],
  month: YearMonth,
): Record<number, { income: number; expense: number }> {
  const result: Record<number, { income: number; expense: number }> = {};
  for (const t of transactionsInMonth(transactions, month)) {
    const day = Number(t.date.slice(8, 10));
    result[day] ??= { income: 0, expense: 0 };
    if (t.type === "INCOME") result[day].income += t.total;
    else result[day].expense += t.total;
  }
  return result;
}

/**
 * 지금까지의 일평균 지출로 월말 지출을 예상한다.
 * today가 해당 월에 속하지 않으면(지난 달·다음 달) 의미가 없으므로 null.
 */
export function projectMonthExpense(
  expenseSoFar: number,
  month: YearMonth,
  today: string,
): number | null {
  if (!isInMonth(today, month)) return null;
  const elapsedDays = Number(today.slice(8, 10));
  return Math.round((expenseSoFar / elapsedDays) * daysInMonth(month));
}
