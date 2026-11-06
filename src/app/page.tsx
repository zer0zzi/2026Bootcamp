import Link from "next/link";
import { BudgetProgress } from "@/components/BudgetProgress";
import { CategoryBreakdown } from "@/components/CategoryBreakdown";
import { MonthNav } from "@/components/MonthNav";
import { MonthlyTrend } from "@/components/MonthlyTrend";
import { RecentTransactions } from "@/components/RecentTransactions";
import { SummaryCards } from "@/components/SummaryCards";
import { listBudgets } from "@/lib/budgets";
import { monthRange, resolveMonth, shiftMonth, todayString } from "@/lib/dates";
import {
  budgetStatuses,
  expenseByCategory,
  monthlyTrend,
  projectMonthExpense,
  summarize,
  transactionsInMonth,
} from "@/lib/stats";
import { listTransactions } from "@/lib/transactions";

// 거래가 바뀌면 바로 반영돼야 하므로 매 요청마다 새로 계산한다.
export const dynamic = "force-dynamic";

const TREND_MONTHS = 6;

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function DashboardPage({ searchParams }: Props) {
  const month = resolveMonth((await searchParams).month);
  const [transactions, budgets] = await Promise.all([listTransactions(), listBudgets()]);

  const monthTransactions = transactionsInMonth(transactions, month);
  const summary = summarize(monthTransactions);
  const previous = summarize(transactionsInMonth(transactions, shiftMonth(month, -1)));
  const { from, to } = monthRange(month);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <MonthNav month={month} basePath="/" />
        <Link
          href="/transactions/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + 거래 입력
        </Link>
      </div>

      <SummaryCards
        summary={summary}
        previousExpense={previous.expense}
        projectedExpense={projectMonthExpense(summary.expense, month, todayString())}
      />

      <BudgetProgress statuses={budgetStatuses(budgets, monthTransactions)} />

      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryBreakdown shares={expenseByCategory(monthTransactions)} from={from} to={to} />
        <MonthlyTrend months={monthlyTrend(transactions, month, TREND_MONTHS)} />
      </div>

      <RecentTransactions transactions={monthTransactions} />
    </div>
  );
}
