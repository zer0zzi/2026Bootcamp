import Link from "next/link";
import { TransactionList } from "@/components/TransactionList";
import { isDemoMode } from "@/lib/demo";
import { parseFilterParams } from "@/lib/transactionFilter";
import { listTransactions } from "@/lib/transactions";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function TransactionsPage({ searchParams }: Props) {
  // 달력·메인 화면에서 넘어온 쿼리(?category=식비&from=...)가 처음 필터가 된다.
  const initialFilter = parseFilterParams(await searchParams);
  const transactions = await listTransactions();
  const readOnly = isDemoMode();

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">내역</h1>
        {!readOnly && (
          <Link
            href="/transactions/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + 거래 입력
          </Link>
        )}
      </div>
      <TransactionList transactions={transactions} initialFilter={initialFilter} readOnly={readOnly} />
    </>
  );
}
