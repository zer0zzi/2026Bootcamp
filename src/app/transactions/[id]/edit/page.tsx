import { notFound } from "next/navigation";
import { TransactionEditor } from "@/components/TransactionEditor";
import { toInput } from "@/lib/transactionDefaults";
import { getTransaction, listRecentTitles } from "@/lib/transactions";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditTransactionPage({ params }: Props) {
  const id = Number((await params).id);
  const transaction = Number.isInteger(id) && id > 0 ? await getTransaction(id) : null;
  if (!transaction) notFound();

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">거래 수정</h1>
      <TransactionEditor
        initial={toInput(transaction)}
        titleSuggestions={await listRecentTitles()}
        editingId={transaction.id}
      />
    </>
  );
}
