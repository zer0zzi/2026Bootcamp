import { describe, expect, it } from "vitest";
import { sampleTransactions } from "./__fixtures__/transactions";
import {
  EMPTY_FILTER,
  filterTransactions,
  groupByCategory,
  parseFilterParams,
} from "./transactionFilter";

const ids = (list: { id: number }[]) => list.map((t) => t.id);

describe("filterTransactions", () => {
  it("필터가 없으면 모두 그대로 돌려준다", () => {
    expect(filterTransactions(sampleTransactions, EMPTY_FILTER)).toEqual(sampleTransactions);
  });

  it("수입/지출로 거른다", () => {
    expect(ids(filterTransactions(sampleTransactions, { ...EMPTY_FILTER, type: "INCOME" }))).toEqual([3]);
    expect(filterTransactions(sampleTransactions, { ...EMPTY_FILTER, type: "EXPENSE" })).toHaveLength(4);
  });

  it("기간은 시작일·종료일을 포함하며 한쪽만 지정해도 된다", () => {
    expect(ids(filterTransactions(sampleTransactions, { ...EMPTY_FILTER, from: "2026-11-05", to: "2026-11-10" }))).toEqual([4, 5]);
    expect(ids(filterTransactions(sampleTransactions, { ...EMPTY_FILTER, from: "2026-11-06" }))).toEqual([5]);
    expect(ids(filterTransactions(sampleTransactions, { ...EMPTY_FILTER, to: "2026-10-31" }))).toEqual([1]);
  });

  it("검색어는 상호·메모·품목명에서 대소문자 구분 없이 찾는다", () => {
    expect(ids(filterTransactions(sampleTransactions, { ...EMPTY_FILTER, query: "gs25" }))).toEqual([2]);
    expect(ids(filterTransactions(sampleTransactions, { ...EMPTY_FILTER, query: "야식" }))).toEqual([2]);
    expect(ids(filterTransactions(sampleTransactions, { ...EMPTY_FILTER, query: "라떼" }))).toEqual([5]);
    expect(filterTransactions(sampleTransactions, { ...EMPTY_FILTER, query: "  " })).toHaveLength(5);
  });

  it("카테고리를 고르면 그 품목만 남기고 총액을 다시 계산한다", () => {
    const result = filterTransactions(sampleTransactions, { ...EMPTY_FILTER, category: "식비" });
    const gs25 = result.find((t) => t.id === 2)!;
    expect(gs25.items.map((i) => i.name)).toEqual(["김밥"]);
    expect(gs25.total).toBe(2500);
  });

  it("조건을 함께 적용한다", () => {
    const result = filterTransactions(sampleTransactions, {
      ...EMPTY_FILTER,
      type: "EXPENSE",
      category: "식비",
      from: "2026-11-05",
    });
    expect(ids(result)).toEqual([5]);
  });

  it("원본을 바꾸지 않는다", () => {
    filterTransactions(sampleTransactions, { ...EMPTY_FILTER, category: "식비" });
    expect(sampleTransactions[1].items).toHaveLength(2);
  });
});

describe("groupByCategory", () => {
  it("품목이 있는 카테고리만 정의된 순서로 묶고 합계를 구한다", () => {
    const groups = groupByCategory(sampleTransactions);
    expect(groups.map((g) => [g.category, g.total])).toEqual([
      ["식비", 37000],
      ["교통", 1500],
      ["생활", 1800],
      ["급여", 3000000],
    ]);
  });

  it("각 항목에 어느 거래의 품목인지 정보를 담는다", () => {
    const [food] = groupByCategory(sampleTransactions.filter((t) => t.id !== 1));
    expect(food.entries.map((e) => [e.title, e.date, e.item.name])).toEqual([
      ["GS25", "2026-11-01", "김밥"],
      ["카페", "2026-11-10", "라떼"],
    ]);
  });

  it("거래가 없으면 빈 배열", () => {
    expect(groupByCategory([])).toEqual([]);
  });
});

describe("parseFilterParams", () => {
  it("유효한 쿼리를 읽는다", () => {
    expect(
      parseFilterParams({ type: "EXPENSE", category: "식비", from: "2026-11-01", to: "2026-11-30", q: "마트" }),
    ).toEqual({ type: "EXPENSE", category: "식비", from: "2026-11-01", to: "2026-11-30", query: "마트" });
  });

  it("잘못된 값은 무시하고 기본값을 쓴다", () => {
    expect(
      parseFilterParams({ type: "x", category: "없는분류", from: "2026-02-30", to: "abc" }),
    ).toEqual(EMPTY_FILTER);
  });

  it("값이 배열로 와도 첫 값을 쓴다", () => {
    expect(parseFilterParams({ type: ["INCOME", "EXPENSE"] }).type).toBe("INCOME");
  });
});
