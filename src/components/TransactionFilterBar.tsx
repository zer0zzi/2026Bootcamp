"use client";

import {
  ALL_CATEGORIES,
  TRANSACTION_TYPES,
  TYPE_LABELS,
  categoriesFor,
  type TransactionType,
} from "@/lib/categories";
import { monthRange, currentYearMonth } from "@/lib/dates";
import { EMPTY_FILTER, type TransactionFilter } from "@/lib/transactionFilter";

type Props = {
  filter: TransactionFilter;
  onChange: (filter: TransactionFilter) => void;
};

const dateInputClass =
  "rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none";

const chipClass = (selected: boolean) =>
  `rounded-full border px-3 py-1 text-sm ${
    selected
      ? "border-blue-600 bg-blue-600 text-white"
      : "border-gray-300 text-gray-700 hover:border-blue-400"
  }`;

/** 검색어·종류·카테고리·기간으로 내역을 거르는 컨트롤 */
export function TransactionFilterBar({ filter, onChange }: Props) {
  const isFiltered = JSON.stringify(filter) !== JSON.stringify(EMPTY_FILTER);
  const categories = filter.type ? categoriesFor(filter.type) : ALL_CATEGORIES;

  /** 종류를 바꿀 때, 그 종류에 없는 카테고리가 선택돼 있으면 해제한다. */
  function changeType(type: TransactionType | null) {
    const keep = filter.category && (type ? categoriesFor(type).includes(filter.category) : true);
    onChange({ ...filter, type, category: keep ? filter.category : null });
  }

  return (
    <section aria-label="내역 필터" className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
      <input
        type="search"
        aria-label="검색"
        placeholder="상호, 메모, 품목 검색"
        className={`${dateInputClass} w-full`}
        value={filter.query}
        onChange={(e) => onChange({ ...filter, query: e.target.value })}
      />

      <div className="flex flex-wrap gap-2" role="group" aria-label="거래 종류">
        {[null, ...TRANSACTION_TYPES].map((type) => (
          <button
            key={type ?? "all"}
            type="button"
            aria-pressed={filter.type === type}
            onClick={() => changeType(type)}
            className={chipClass(filter.type === type)}
          >
            {type ? TYPE_LABELS[type] : "수입+지출"}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="카테고리">
        {[null, ...categories].map((category) => (
          <button
            key={category ?? "all"}
            type="button"
            aria-pressed={filter.category === category}
            onClick={() => onChange({ ...filter, category })}
            className={chipClass(filter.category === category)}
          >
            {category ?? "전체"}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <label className="flex items-center gap-1">
          <span className="text-gray-600">기간</span>
          <input
            type="date"
            aria-label="시작일"
            className={dateInputClass}
            value={filter.from}
            max={filter.to || undefined}
            onChange={(e) => onChange({ ...filter, from: e.target.value })}
          />
        </label>
        <span className="text-gray-400">~</span>
        <input
          type="date"
          aria-label="종료일"
          className={dateInputClass}
          value={filter.to}
          min={filter.from || undefined}
          onChange={(e) => onChange({ ...filter, to: e.target.value })}
        />
        <button
          type="button"
          onClick={() => onChange({ ...filter, ...monthRange(currentYearMonth()) })}
          className="rounded border border-gray-300 px-2 py-1 text-gray-700 hover:border-blue-400"
        >
          이번 달
        </button>
        {isFiltered && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTER)}
            className="text-gray-500 hover:text-gray-800 hover:underline"
          >
            필터 초기화
          </button>
        )}
      </div>
    </section>
  );
}
