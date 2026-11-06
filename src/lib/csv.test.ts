import { describe, expect, it } from "vitest";
import { makeTransaction, sampleTransactions } from "./__fixtures__/transactions";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("엑셀용 BOM과 헤더로 시작한다", () => {
    const csv = toCsv([]);
    expect(csv.startsWith("﻿날짜,구분,상호/내용,결제수단,카테고리,품목,수량,금액,메모")).toBe(true);
  });

  it("품목 한 줄이 CSV 한 줄이 된다", () => {
    const lines = toCsv(sampleTransactions.slice(1, 3)).trim().split("\r\n");
    expect(lines).toHaveLength(1 + 3); // 헤더 + (김밥, 휴지, 월급)
    expect(lines[1]).toBe("2026-11-01,지출,GS25,카드,식비,김밥,1,2500,야식");
    expect(lines[3]).toBe("2026-11-01,수입,11월 월급,,급여,급여,1,3000000,");
  });

  it("쉼표·따옴표·줄바꿈이 있는 값을 안전하게 감싼다", () => {
    const t = makeTransaction(1, "2026-11-01", '카페, "본점"', "EXPENSE", [["라떼", 4500, "식비"]], {
      memo: "첫째 줄\n둘째 줄",
    });
    const row = toCsv([t]).trim().split("\r\n").slice(1).join("\r\n");
    expect(row).toBe('2026-11-01,지출,"카페, ""본점""",,식비,라떼,1,4500,"첫째 줄\n둘째 줄"');
  });
});
