import Link from "next/link";
import { formatPercent, formatWon } from "@/lib/format";
import type { CategoryShare } from "@/lib/stats";

type Props = {
  shares: CategoryShare[];
  /** 각 카테고리 링크에 붙일 기간 (그 달 내역으로 바로 이동) */
  from: string;
  to: string;
};

/** 카테고리별 지출 비율. 막대는 가장 큰 카테고리를 100%로 두고 그린다. */
export function CategoryBreakdown({ shares, from, to }: Props) {
  const max = shares[0]?.total ?? 0;

  return (
    <section aria-label="카테고리별 지출" className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      <h2 className="font-bold">카테고리별 지출</h2>
      {shares.length === 0 ? (
        <p className="text-sm text-gray-500">이번 달 지출이 없어요.</p>
      ) : (
        <ul className="space-y-2">
          {shares.map((share) => (
            <li key={share.category}>
              <Link
                href={`/transactions?type=EXPENSE&category=${encodeURIComponent(share.category)}&from=${from}&to=${to}`}
                className="block space-y-1 rounded hover:bg-gray-50"
              >
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-medium">{share.category}</span>
                  <span className="text-gray-600">
                    {formatWon(share.total)} ({formatPercent(share.ratio)})
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
                  <div
                    className="h-full bg-rose-400"
                    style={{ width: `${max === 0 ? 0 : (share.total / max) * 100}%` }}
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
