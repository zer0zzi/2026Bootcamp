import { describe, expect, it } from "vitest";
import { isInMonth, shiftMonth } from "./dates";
import { createDemoBudgets, createDemoTransactions } from "./demoData";
import { transactionInputSchema } from "./schemas";
import { summarize, transactionsInMonth } from "./stats";

const TODAY = "2026-11-06";

describe("createDemoTransactions", () => {
  const transactions = createDemoTransactions(TODAY);

  it("같은 날짜로 만들면 항상 같은 결과다", () => {
    expect(createDemoTransactions(TODAY)).toEqual(transactions);
  });

  it("오늘 이후 날짜의 거래는 만들지 않는다", () => {
    expect(transactions.every((t) => t.date <= TODAY)).toBe(true);
  });

  it("최근 6개월에 걸쳐 있고 그 밖의 달은 없다", () => {
    const months = new Set(transactions.map((t) => t.date.slice(0, 7)));
    expect([...months].sort()).toEqual(
      [-5, -4, -3, -2, -1, 0].map((delta) => shiftMonth("2026-11", delta)),
    );
  });

  it("실제 저장 스키마를 통과한다 (카테고리와 거래 종류가 맞고, 품목이 있다)", () => {
    for (const t of transactions) {
      const result = transactionInputSchema.safeParse(t);
      expect(result.success, `${t.date} ${t.title}`).toBe(true);
    }
  });

  it("id가 겹치지 않고 최신순(날짜 내림차순)으로 정렬돼 있다", () => {
    expect(new Set(transactions.map((t) => t.id)).size).toBe(transactions.length);
    const dates = transactions.map((t) => t.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("총액은 품목 가격의 합이다", () => {
    for (const t of transactions) {
      expect(t.total).toBe(t.items.reduce((sum, item) => sum + item.price, 0));
    }
  });

  it("매달 월급이 들어오고(지난 달들) 수입과 지출이 모두 있다", () => {
    const lastMonth = transactionsInMonth(transactions, "2026-10");
    expect(lastMonth.some((t) => t.title === "월급" && t.total === 2800000)).toBe(true);
    const { income, expense } = summarize(lastMonth);
    expect(income).toBeGreaterThan(0);
    expect(expense).toBeGreaterThan(0);
  });

  it("월급 같은 고정 금액은 달마다 같고, 변동 금액은 달마다 다르다", () => {
    const pick = (month: string, title: string) =>
      transactions.find((t) => isInMonth(t.date, month) && t.title === title)?.total;
    expect(pick("2026-09", "월세")).toBe(pick("2026-10", "월세"));
    expect(new Set(["2026-06", "2026-07", "2026-08", "2026-09", "2026-10"].map((m) => pick(m, "택시"))).size).toBeGreaterThan(1);
  });

  it("월 초에는 이번 달 거래가 적고, 달이 바뀌어도 이번 달 거래가 존재한다", () => {
    const early = createDemoTransactions("2027-01-02");
    expect(early.every((t) => t.date <= "2027-01-02")).toBe(true);
    expect(transactionsInMonth(early, "2027-01").length).toBeGreaterThan(0);
    expect(transactionsInMonth(early, "2026-12").length).toBeGreaterThan(0);
  });
});

describe("createDemoBudgets", () => {
  it("전체 예산을 포함하고 금액이 모두 양수다", () => {
    const budgets = createDemoBudgets();
    expect(budgets.some((b) => b.category === "전체")).toBe(true);
    expect(budgets.every((b) => b.amount > 0)).toBe(true);
  });
});
