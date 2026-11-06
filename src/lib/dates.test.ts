import { describe, expect, it } from "vitest";
import {
  currentYearMonth,
  daysInMonth,
  firstWeekday,
  isInMonth,
  isValidDate,
  isValidYearMonth,
  monthLabel,
  monthRange,
  resolveMonth,
  shiftMonth,
  todayString,
} from "./dates";

describe("dates", () => {
  it("로컬 시간 기준 오늘 날짜를 만든다 (UTC로 어긋나지 않는다)", () => {
    // 로컬 자정 직후: toISOString을 쓰면 시간대에 따라 전날이 될 수 있는 시각
    expect(todayString(new Date(2026, 10, 5, 0, 30))).toBe("2026-11-05");
    expect(currentYearMonth(new Date(2026, 0, 1, 0, 5))).toBe("2026-01");
  });

  it("존재하지 않는 날짜를 걸러낸다", () => {
    expect(isValidDate("2026-02-28")).toBe(true);
    expect(isValidDate("2026-02-30")).toBe(false);
    expect(isValidDate("2024-02-29")).toBe(true);
    expect(isValidDate("2026-13-01")).toBe(false);
    expect(isValidDate("2026-1-1")).toBe(false);
  });

  it("월 형식을 검증한다", () => {
    expect(isValidYearMonth("2026-11")).toBe(true);
    expect(isValidYearMonth("2026-00")).toBe(false);
    expect(isValidYearMonth("2026-13")).toBe(false);
    expect(isValidYearMonth("abc")).toBe(false);
  });

  it("URL의 월 값이 잘못되면 이번 달을 쓴다", () => {
    const now = new Date(2026, 10, 6);
    expect(resolveMonth("2026-03", now)).toBe("2026-03");
    expect(resolveMonth(["2026-03", "2026-04"], now)).toBe("2026-03");
    expect(resolveMonth("2026-13", now)).toBe("2026-11");
    expect(resolveMonth("abc", now)).toBe("2026-11");
    expect(resolveMonth(undefined, now)).toBe("2026-11");
  });

  it("월 이동이 연도 경계를 넘어도 맞다", () => {
    expect(shiftMonth("2026-11", 1)).toBe("2026-12");
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
    expect(shiftMonth("2026-03", -14)).toBe("2025-01");
  });

  it("월의 일수와 범위, 첫 요일을 구한다", () => {
    expect(daysInMonth("2026-02")).toBe(28);
    expect(daysInMonth("2024-02")).toBe(29);
    expect(monthRange("2026-11")).toEqual({ from: "2026-11-01", to: "2026-11-30" });
    expect(firstWeekday("2026-11")).toBe(0); // 2026-11-01은 일요일
  });

  it("월 라벨과 소속 월 판별", () => {
    expect(monthLabel("2026-01")).toBe("2026년 1월");
    expect(isInMonth("2026-11-05", "2026-11")).toBe(true);
    expect(isInMonth("2026-12-05", "2026-11")).toBe(false);
  });
});
