"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toCsv } from "@/lib/csv";
import { todayString } from "@/lib/dates";
import { formatWon } from "@/lib/format";
import type { SavedTransaction } from "@/lib/schemas";
import { summarize } from "@/lib/stats";
import {
  filterTransactions,
  groupByCategory,
  type TransactionFilter,
} from "@/lib/transactionFilter";
import { CategoryGroups } from "./CategoryGroups";
import { TransactionCard } from "./TransactionCard";
import { TransactionFilterBar } from "./TransactionFilterBar";

type View = "transaction" | "category";

const VIEW_LABELS: Record<View, string> = { transaction: "거래별", category: "카테고리별" };

type Props = {
  transactions: SavedTransaction[];
  /** URL 쿼리(달력, 메인 화면 링크 등)에서 넘어온 처음 필터 */
  initialFilter: TransactionFilter;
};

/** 내역 화면: 필터·검색, 거래별/카테고리별 보기, 삭제, CSV 내보내기 */
export function TransactionList({ transactions, initialFilter }: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState<TransactionFilter>(initialFilter);
  const [view, setView] = useState<View>("transaction");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => filterTransactions(transactions, filter), [transactions, filter]);
  const groups = useMemo(() => groupByCategory(filtered), [filtered]);
  const summary = useMemo(() => summarize(filtered), [filtered]);

  async function handleDelete(t: SavedTransaction) {
    if (!window.confirm(`"${t.title}" (${t.date}) 거래를 삭제할까요?`)) return;

    setError(null);
    setDeletingId(t.id);
    try {
      const res = await fetch(`/api/transactions/${t.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 404) throw new Error();
      router.refresh();
    } catch {
      setError("삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setDeletingId(null);
    }
  }

  /** 지금 필터가 적용된 내역을 CSV 파일로 내려받는다. */
  function handleExport() {
    const blob = new Blob([toCsv(filtered)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `스마트가계부_${todayString()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (transactions.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
        저장된 내역이 없습니다.{" "}
        <Link href="/transactions/new" className="text-blue-600 hover:underline">
          첫 거래를 입력해 보세요.
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <TransactionFilterBar filter={filter} onChange={setFilter} />

      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <p className="rounded-lg bg-white p-2 ring-1 ring-gray-200">
          <span className="block text-xs text-gray-500">수입</span>
          <strong className="text-blue-600">{formatWon(summary.income)}</strong>
        </p>
        <p className="rounded-lg bg-white p-2 ring-1 ring-gray-200">
          <span className="block text-xs text-gray-500">지출</span>
          <strong className="text-rose-600">{formatWon(summary.expense)}</strong>
        </p>
        <p className="rounded-lg bg-white p-2 ring-1 ring-gray-200">
          <span className="block text-xs text-gray-500">잔액</span>
          <strong>{formatWon(summary.balance)}</strong>
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-gray-600">
          {view === "transaction" ? `거래 ${filtered.length}건` : `카테고리 ${groups.length}개`}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            CSV 내보내기
          </button>
          <div className="flex overflow-hidden rounded-lg border border-gray-300 text-sm" role="group" aria-label="보기 방식">
            {(Object.keys(VIEW_LABELS) as View[]).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={view === key}
                onClick={() => setView(key)}
                className={`px-3 py-1 ${
                  view === key ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {VIEW_LABELS[key]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
          조건에 맞는 내역이 없습니다.
        </p>
      ) : view === "category" ? (
        <CategoryGroups groups={groups} />
      ) : (
        <ul className="space-y-3">
          {filtered.map((t) => (
            <TransactionCard
              key={t.id}
              transaction={t}
              deleting={deletingId === t.id}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
