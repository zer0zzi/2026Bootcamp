import type { TransactionType } from "./categories";

/** 1234567 -> "1,234,567원" */
export function formatWon(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

/** 수입은 +, 지출은 -를 붙인다. 색에만 의존하지 않고 부호로도 구분하기 위함. */
export function formatSignedWon(type: TransactionType, amount: number): string {
  return `${type === "INCOME" ? "+" : "-"}${formatWon(amount)}`;
}

/** 0.256 -> "26%" */
export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}
