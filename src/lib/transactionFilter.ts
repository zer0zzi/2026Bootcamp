import {
  ALL_CATEGORIES,
  TRANSACTION_TYPES,
  type Category,
  type TransactionType,
} from "./categories";
import { isValidDate } from "./dates";
import type { SavedTransaction, TransactionItemData } from "./schemas";

export type TransactionFilter = {
  /** null이면 수입·지출 모두 */
  type: TransactionType | null;
  /** null이면 전체 카테고리 */
  category: Category | null;
  /** YYYY-MM-DD. 빈 문자열이면 제한 없음 */
  from: string;
  to: string;
  /** 상호/내용, 메모, 품목명에서 찾는 검색어 */
  query: string;
};

export const EMPTY_FILTER: TransactionFilter = {
  type: null,
  category: null,
  from: "",
  to: "",
  query: "",
};

/** 카테고리별 보기의 한 줄: 어느 거래의 어떤 품목인지 */
export type CategoryEntry = {
  transactionId: number;
  title: string;
  date: string;
  item: TransactionItemData;
};

export type CategoryGroup = {
  category: Category;
  total: number;
  entries: CategoryEntry[];
};

const sumPrices = (items: TransactionItemData[]) => items.reduce((sum, item) => sum + item.price, 0);

function matchesQuery(t: SavedTransaction, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [t.title, t.memo, ...t.items.map((item) => item.name)].some((text) =>
    text.toLowerCase().includes(needle),
  );
}

/**
 * 종류·기간·검색어·카테고리로 거래를 거른다.
 * 카테고리를 고르면 그 카테고리의 품목만 남기고 총액도 남은 품목 기준으로 다시 계산한다.
 * (날짜는 YYYY-MM-DD 문자열이라 사전순 비교가 곧 날짜순 비교다.)
 */
export function filterTransactions(
  transactions: SavedTransaction[],
  { type, category, from, to, query }: TransactionFilter,
): SavedTransaction[] {
  return transactions
    .filter((t) => !type || t.type === type)
    .filter((t) => (!from || t.date >= from) && (!to || t.date <= to))
    .filter((t) => matchesQuery(t, query))
    .flatMap((t) => {
      if (!category) return [t];
      const items = t.items.filter((item) => item.category === category);
      return items.length > 0 ? [{ ...t, items, total: sumPrices(items) }] : [];
    });
}

/** 품목을 카테고리별로 모은다. 품목이 있는 카테고리만, ALL_CATEGORIES 순서대로 돌려준다. */
export function groupByCategory(transactions: SavedTransaction[]): CategoryGroup[] {
  return ALL_CATEGORIES.map((category) => {
    const entries = transactions.flatMap((t) =>
      t.items
        .filter((item) => item.category === category)
        .map((item) => ({ transactionId: t.id, title: t.title, date: t.date, item })),
    );
    return { category, total: sumPrices(entries.map((e) => e.item)), entries };
  }).filter((group) => group.entries.length > 0);
}

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** URL 쿼리에서 필터를 읽는다. 잘못된 값은 무시하고 기본값을 쓴다. */
export function parseFilterParams(params: SearchParams): TransactionFilter {
  const type = first(params.type);
  const category = first(params.category);
  const from = first(params.from) ?? "";
  const to = first(params.to) ?? "";

  return {
    type: (TRANSACTION_TYPES as readonly string[]).includes(type ?? "")
      ? (type as TransactionType)
      : null,
    category: (ALL_CATEGORIES as readonly string[]).includes(category ?? "")
      ? (category as Category)
      : null,
    from: isValidDate(from) ? from : "",
    to: isValidDate(to) ? to : "",
    query: first(params.q) ?? "",
  };
}
