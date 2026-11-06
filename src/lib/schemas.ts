import { z } from "zod";
import {
  ALL_CATEGORIES,
  PAYMENT_METHODS,
  TRANSACTION_TYPES,
  typeOfCategory,
} from "./categories";
import { isValidDate } from "./dates";

/** 거래 품목 한 줄. 카테고리는 품목마다 지정한다. */
export const transactionItemSchema = z.object({
  name: z.string().trim().min(1),
  quantity: z.number().int().min(1),
  price: z.number().int().min(0),
  category: z.enum(ALL_CATEGORIES),
});

/** 입력 화면의 값이자 저장·수정 요청(API 입력)의 형태. 총액은 서버가 품목 합계로 계산한다. */
export const transactionInputSchema = z
  .object({
    type: z.enum(TRANSACTION_TYPES),
    date: z.string().refine(isValidDate, "올바른 날짜가 아닙니다."),
    title: z.string().trim().min(1),
    paymentMethod: z.enum([...PAYMENT_METHODS, ""]),
    memo: z.string().max(500),
    items: z.array(transactionItemSchema).min(1),
  })
  .superRefine((data, ctx) => {
    // 수입 거래에 지출 카테고리를 쓰는 식의 불일치를 막는다.
    data.items.forEach((item, index) => {
      if (typeOfCategory(item.category) !== data.type) {
        ctx.addIssue({
          code: "custom",
          path: ["items", index, "category"],
          message: "거래 종류와 맞지 않는 카테고리입니다.",
        });
      }
    });
  });

export const budgetInputSchema = z.object({
  /** "전체" 또는 지출 카테고리 */
  category: z.string().min(1),
  /** 0이면 예산을 삭제한다 */
  amount: z.number().int().min(0),
});

export type TransactionItemData = z.infer<typeof transactionItemSchema>;
export type TransactionInput = z.infer<typeof transactionInputSchema>;

/** 저장된 거래 (화면 표시용) */
export type SavedTransaction = TransactionInput & {
  id: number;
  total: number;
  createdAt: string;
};

export type SavedBudget = { category: string; amount: number };
