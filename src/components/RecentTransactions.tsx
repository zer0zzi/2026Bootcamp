import Link from "next/link";
import { formatSignedWon } from "@/lib/format";
import type { SavedTransaction } from "@/lib/schemas";

/** 해당 월의 최근 거래 몇 건. 전체는 내역 화면에서 본다. */
export function RecentTransactions({
  transactions,
  limit = 5,
}: {
  transactions: SavedTransaction[];
  limit?: number;
}) {
  return (
    <section aria-label="최근 거래" className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">최근 거래</h2>
        <Link href="/transactions" className="text-sm text-blue-600 hover:underline">
          전체 보기
        </Link>
      </div>
      {transactions.length === 0 ? (
        <p className="text-sm text-gray-500">이 달에는 거래가 없어요.</p>
      ) : (
        <ul className="divide-y divide-gray-100 text-sm">
          {transactions.slice(0, limit).map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-4 py-2">
              <span className="min-w-0">
                <span className="block truncate font-medium">{t.title}</span>
                <span className="text-xs text-gray-500">{t.date}</span>
              </span>
              <span className={`shrink-0 font-semibold ${t.type === "INCOME" ? "text-blue-600" : "text-rose-600"}`}>
                {formatSignedWon(t.type, t.total)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
