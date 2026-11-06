import { redirect } from "next/navigation";
import { TransactionEditor } from "@/components/TransactionEditor";
import { isDemoMode } from "@/lib/demo";
import { todayString } from "@/lib/dates";
import { copyAsNew, emptyTransaction } from "@/lib/transactionDefaults";
import { getTransaction, listRecentTitles } from "@/lib/transactions";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function NewTransactionPage({ searchParams }: Props) {
  if (isDemoMode()) redirect("/transactions");

  const { copy } = await searchParams;
  const copyId = Number(Array.isArray(copy) ? copy[0] : copy);
  const today = todayString();

  // ?copy=ID 이면 그 거래를 복사해서 시작한다. 없는 id면 빈 폼.
  const source = Number.isInteger(copyId) && copyId > 0 ? await getTransaction(copyId) : null;

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">{source ? "거래 복사해서 입력" : "거래 입력"}</h1>
      <TransactionEditor
        initial={source ? copyAsNew(source, today) : emptyTransaction(today)}
        titleSuggestions={await listRecentTitles()}
      />
    </>
  );
}
