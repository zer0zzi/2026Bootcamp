import type { Category, TransactionType } from "../categories";
import type { SavedTransaction } from "../schemas";

type ItemSpec = [name: string, price: number, category: Category];

/** 테스트용 거래를 간단히 만든다. 총액은 품목 합계로 채운다. */
export function makeTransaction(
  id: number,
  date: string,
  title: string,
  type: TransactionType,
  items: ItemSpec[],
  extra: Partial<Pick<SavedTransaction, "memo" | "paymentMethod">> = {},
): SavedTransaction {
  return {
    id,
    type,
    date,
    title,
    total: items.reduce((sum, [, price]) => sum + price, 0),
    paymentMethod: "",
    memo: "",
    createdAt: "",
    ...extra,
    items: items.map(([name, price, category]) => ({ name, quantity: 1, price, category })),
  };
}

/** 2026년 10~11월에 걸친 샘플 가계부 */
export const sampleTransactions: SavedTransaction[] = [
  makeTransaction(1, "2026-10-20", "지난달 마트", "EXPENSE", [["쌀", 30000, "식비"]]),
  makeTransaction(2, "2026-11-01", "GS25", "EXPENSE", [
    ["김밥", 2500, "식비"],
    ["휴지", 1800, "생활"],
  ], { memo: "야식", paymentMethod: "카드" }),
  makeTransaction(3, "2026-11-01", "11월 월급", "INCOME", [["급여", 3000000, "급여"]]),
  makeTransaction(4, "2026-11-05", "지하철", "EXPENSE", [["교통비", 1500, "교통"]]),
  makeTransaction(5, "2026-11-10", "카페", "EXPENSE", [["라떼", 4500, "식비"]]),
];
