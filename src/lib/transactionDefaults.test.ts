import { describe, expect, it } from "vitest";
import { sampleTransactions } from "./__fixtures__/transactions";
import { transactionInputSchema } from "./schemas";
import { copyAsNew, emptyTransaction, toInput } from "./transactionDefaults";

describe("transactionDefaults", () => {
  it("빈 거래는 오늘 날짜의 지출 한 줄이다", () => {
    const empty = emptyTransaction("2026-11-06");
    expect(empty).toMatchObject({ type: "EXPENSE", date: "2026-11-06", title: "" });
    expect(empty.items).toHaveLength(1);
  });

  it("복사하면 날짜만 오늘로 바뀌고 id·총액은 따라오지 않는다", () => {
    const copy = copyAsNew(sampleTransactions[1], "2026-12-01");
    expect(copy.date).toBe("2026-12-01");
    expect(copy.title).toBe("GS25");
    expect(copy.items).toEqual(sampleTransactions[1].items);
    expect(copy).not.toHaveProperty("id");
    expect(copy).not.toHaveProperty("total");
  });

  it("복사본을 고쳐도 원본 품목이 바뀌지 않는다", () => {
    const copy = copyAsNew(sampleTransactions[1], "2026-12-01");
    copy.items[0].name = "바뀜";
    expect(sampleTransactions[1].items[0].name).toBe("김밥");
  });

  it("수정용 초기값은 날짜를 그대로 둔다", () => {
    expect(toInput(sampleTransactions[3]).date).toBe("2026-11-05");
  });

  it("복사·수정용 값은 저장 스키마를 통과한다", () => {
    for (const t of sampleTransactions) {
      expect(transactionInputSchema.safeParse(toInput(t)).success).toBe(true);
    }
  });
});

describe("transactionInputSchema", () => {
  const valid = {
    type: "EXPENSE",
    date: "2026-11-05",
    title: "카페",
    paymentMethod: "카드",
    memo: "",
    items: [{ name: "라떼", quantity: 1, price: 4500, category: "식비" }],
  };

  it("올바른 입력은 통과한다", () => {
    expect(transactionInputSchema.safeParse(valid).success).toBe(true);
  });

  it.each([
    ["존재하지 않는 날짜", { ...valid, date: "2026-02-30" }],
    ["빈 상호명", { ...valid, title: "  " }],
    ["품목 없음", { ...valid, items: [] }],
    ["빈 품목명", { ...valid, items: [{ ...valid.items[0], name: "" }] }],
    ["음수 금액", { ...valid, items: [{ ...valid.items[0], price: -1 }] }],
    ["수량 0", { ...valid, items: [{ ...valid.items[0], quantity: 0 }] }],
    ["없는 카테고리", { ...valid, items: [{ ...valid.items[0], category: "없음" }] }],
    ["지출에 수입 카테고리", { ...valid, items: [{ ...valid.items[0], category: "급여" }] }],
    ["수입에 지출 카테고리", { ...valid, type: "INCOME" }],
    ["잘못된 결제수단", { ...valid, paymentMethod: "비트코인" }],
  ])("거절한다: %s", (_label, input) => {
    expect(transactionInputSchema.safeParse(input).success).toBe(false);
  });
});
