import { describe, expect, it } from "vitest";
import { makeTransaction, sampleTransactions } from "./__fixtures__/transactions";
import {
  budgetStatuses,
  dailyTotals,
  expenseByCategory,
  monthlyTrend,
  projectMonthExpense,
  summarize,
  transactionsInMonth,
} from "./stats";

const november = transactionsInMonth(sampleTransactions, "2026-11");

describe("summarize", () => {
  it("수입·지출·잔액을 계산한다", () => {
    expect(summarize(november)).toEqual({
      income: 3000000,
      expense: 2500 + 1800 + 1500 + 4500,
      balance: 3000000 - 10300,
      count: 4,
    });
  });

  it("거래가 없으면 모두 0", () => {
    expect(summarize([])).toEqual({ income: 0, expense: 0, balance: 0, count: 0 });
  });
});

describe("expenseByCategory", () => {
  it("지출만 카테고리별로 모으고 큰 금액 순으로 정렬한다 (수입은 제외)", () => {
    const result = expenseByCategory(november);
    expect(result.map((r) => [r.category, r.total])).toEqual([
      ["식비", 7000],
      ["생활", 1800],
      ["교통", 1500],
    ]);
  });

  it("비율의 합은 1이다", () => {
    const sum = expenseByCategory(november).reduce((acc, r) => acc + r.ratio, 0);
    expect(sum).toBeCloseTo(1);
  });

  it("지출이 없으면 빈 배열", () => {
    expect(expenseByCategory([])).toEqual([]);
  });
});

describe("budgetStatuses", () => {
  const expenses = november.filter((t) => t.type === "EXPENSE");

  it("전체·카테고리 예산의 사용률과 단계를 계산한다", () => {
    const result = budgetStatuses(
      [
        { category: "식비", amount: 7500 }, // 7000/7500 = 93% -> warning
        { category: "전체", amount: 10000 }, // 10300/10000 -> over
        { category: "교통", amount: 20000 }, // 7.5% -> ok
      ],
      expenses,
    );

    expect(result.map((r) => [r.category, r.spent, r.level])).toEqual([
      ["전체", 10300, "over"],
      ["식비", 7000, "warning"],
      ["교통", 1500, "ok"],
    ]);
  });

  it("딱 100%면 초과로 본다", () => {
    const [status] = budgetStatuses([{ category: "교통", amount: 1500 }], expenses);
    expect(status.level).toBe("over");
  });

  it("지출이 없는 카테고리는 0원 사용", () => {
    const [status] = budgetStatuses([{ category: "교육", amount: 50000 }], expenses);
    expect(status).toMatchObject({ spent: 0, ratio: 0, level: "ok" });
  });

  it("금액이 0인 예산은 무시한다", () => {
    expect(budgetStatuses([{ category: "식비", amount: 0 }], expenses)).toEqual([]);
  });
});

describe("monthlyTrend", () => {
  it("최근 N개월을 오래된 순으로 돌려주고 거래 없는 달은 0이다", () => {
    const result = monthlyTrend(sampleTransactions, "2026-11", 3);
    expect(result).toEqual([
      { month: "2026-09", income: 0, expense: 0 },
      { month: "2026-10", income: 0, expense: 30000 },
      { month: "2026-11", income: 3000000, expense: 10300 },
    ]);
  });
});

describe("dailyTotals", () => {
  it("일별 수입·지출을 합산하고 같은 날 거래를 합친다", () => {
    expect(dailyTotals(sampleTransactions, "2026-11")).toEqual({
      1: { income: 3000000, expense: 4300 },
      5: { income: 0, expense: 1500 },
      10: { income: 0, expense: 4500 },
    });
  });

  it("다른 달 거래는 섞이지 않는다", () => {
    const result = dailyTotals([makeTransaction(9, "2026-12-01", "x", "EXPENSE", [["a", 1, "식비"]])], "2026-11");
    expect(result).toEqual({});
  });
});

describe("projectMonthExpense", () => {
  it("일평균 지출로 월말 지출을 예상한다", () => {
    // 10일간 10,000원 -> 하루 1,000원 -> 30일 = 30,000원
    expect(projectMonthExpense(10000, "2026-11", "2026-11-10")).toBe(30000);
  });

  it("지난 달·다음 달은 예상하지 않는다", () => {
    expect(projectMonthExpense(10000, "2026-10", "2026-11-10")).toBeNull();
    expect(projectMonthExpense(10000, "2026-12", "2026-11-10")).toBeNull();
  });
});
