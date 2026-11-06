import { MonthCalendar } from "@/components/MonthCalendar";
import { MonthNav } from "@/components/MonthNav";
import { resolveMonth } from "@/lib/dates";
import { formatWon } from "@/lib/format";
import { dailyTotals, summarize, transactionsInMonth } from "@/lib/stats";
import { listTransactions } from "@/lib/transactions";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function CalendarPage({ searchParams }: Props) {
  const month = resolveMonth((await searchParams).month);
  const transactions = await listTransactions();
  const summary = summarize(transactionsInMonth(transactions, month));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">달력</h1>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <MonthNav month={month} basePath="/calendar" />
        <p className="text-sm text-gray-600">
          수입 <strong className="text-blue-600">{formatWon(summary.income)}</strong> · 지출{" "}
          <strong className="text-rose-600">{formatWon(summary.expense)}</strong>
        </p>
      </div>
      <MonthCalendar month={month} totals={dailyTotals(transactions, month)} />
    </div>
  );
}
