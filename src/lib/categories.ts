/** 거래 종류 */
export const TRANSACTION_TYPES = ["EXPENSE", "INCOME"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TYPE_LABELS: Record<TransactionType, string> = {
  EXPENSE: "지출",
  INCOME: "수입",
};

/** 지출 카테고리 */
export const EXPENSE_CATEGORIES = [
  "식비",
  "교통",
  "쇼핑",
  "생활",
  "주거/통신",
  "의료/건강",
  "문화/여가",
  "교육",
  "경조사",
  "기타",
] as const;

/** 수입 카테고리 */
export const INCOME_CATEGORIES = ["급여", "용돈", "부수입", "금융수입", "기타수입"] as const;

/** 저장·검증에 쓰는 전체 카테고리 (지출 → 수입 순서) */
export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES] as const;

export type Category = (typeof ALL_CATEGORIES)[number];

/** 거래 종류에 맞는 카테고리 목록 */
export function categoriesFor(type: TransactionType): readonly Category[] {
  return type === "INCOME" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

/** 카테고리가 어느 종류에 속하는지 */
export function typeOfCategory(category: Category): TransactionType {
  return (INCOME_CATEGORIES as readonly string[]).includes(category) ? "INCOME" : "EXPENSE";
}

/** 지출 결제수단 */
export const PAYMENT_METHODS = ["현금", "카드", "계좌이체", "기타"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** 예산에서 월 전체 지출을 나타내는 키 */
export const TOTAL_BUDGET_KEY = "전체";
