"use client";

import Link from "next/link";
import { formatSignedWon, formatWon } from "@/lib/format";
import type { SavedTransaction } from "@/lib/schemas";

type Props = {
  transaction: SavedTransaction;
  deleting: boolean;
  readOnly: boolean;
  onDelete: (transaction: SavedTransaction) => void;
};

/** 거래 한 건. 펼치면 품목·메모와 수정/복사/삭제 버튼이 보인다. */
export function TransactionCard({ transaction: t, deleting, readOnly, onDelete }: Props) {
  const categories = [...new Set(t.items.map((item) => item.category))];

  return (
    <li className="rounded-xl border border-gray-200 bg-white p-4">
      <details>
        <summary className="flex cursor-pointer items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate font-medium">{t.title}</p>
            <p className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
              <span>{t.date}</span>
              {t.paymentMethod && <span>· {t.paymentMethod}</span>}
              {categories.map((category) => (
                <span key={category} className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700">
                  {category}
                </span>
              ))}
            </p>
          </div>
          <p className={`shrink-0 font-semibold ${t.type === "INCOME" ? "text-blue-600" : "text-rose-600"}`}>
            {formatSignedWon(t.type, t.total)}
          </p>
        </summary>

        <ul className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-sm text-gray-600">
          {t.items.map((item, i) => (
            <li key={i} className="flex justify-between gap-4">
              <span>
                {item.name} × {item.quantity}{" "}
                <span className="text-xs text-gray-400">({item.category})</span>
              </span>
              <span>{formatWon(item.price)}</span>
            </li>
          ))}
        </ul>
        {t.memo && <p className="mt-2 text-sm text-gray-500">메모: {t.memo}</p>}

        {!readOnly && (
          <div className="mt-3 flex gap-3 border-t border-gray-100 pt-3 text-sm">
            <Link href={`/transactions/${t.id}/edit`} className="text-blue-600 hover:underline">
              수정
            </Link>
            <Link href={`/transactions/new?copy=${t.id}`} className="text-blue-600 hover:underline">
              복사해서 새로 입력
            </Link>
            <button
              type="button"
              disabled={deleting}
              onClick={() => onDelete(t)}
              className="ml-auto text-red-600 hover:underline disabled:opacity-50"
            >
              {deleting ? "삭제 중..." : "삭제"}
            </button>
          </div>
        )}
      </details>
    </li>
  );
}
