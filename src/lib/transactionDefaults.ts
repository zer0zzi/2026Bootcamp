import { categoriesFor } from "./categories";
import type { SavedTransaction, TransactionInput } from "./schemas";

/** 새 거래 입력 폼의 기본값: 오늘 날짜의 빈 지출 한 줄 */
export function emptyTransaction(today: string): TransactionInput {
  return {
    type: "EXPENSE",
    date: today,
    title: "",
    paymentMethod: "",
    memo: "",
    items: [{ name: "", quantity: 1, price: 0, category: categoriesFor("EXPENSE")[0] }],
  };
}

/** 기존 거래를 복사해 새 거래의 초기값으로 쓴다. 날짜만 오늘로 바꾼다. (반복되는 지출을 빠르게 입력) */
export function copyAsNew(source: SavedTransaction, today: string): TransactionInput {
  return {
    type: source.type,
    date: today,
    title: source.title,
    paymentMethod: source.paymentMethod,
    memo: source.memo,
    items: source.items.map((item) => ({ ...item })),
  };
}

/** 저장된 거래를 수정 폼의 초기값으로 바꾼다. */
export function toInput(source: SavedTransaction): TransactionInput {
  return copyAsNew(source, source.date);
}
