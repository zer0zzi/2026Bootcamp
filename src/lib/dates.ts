/** "YYYY-MM" 형태의 월 */
export type YearMonth = string;

const pad = (n: number) => String(n).padStart(2, "0");

/** 로컬 시간 기준 YYYY-MM-DD. toISOString은 UTC라 날짜가 하루 어긋날 수 있다. */
export function toDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayString(now: Date = new Date()): string {
  return toDateString(now);
}

export function currentYearMonth(now: Date = new Date()): YearMonth {
  return todayString(now).slice(0, 7);
}

/** URL 쿼리의 month 값을 읽는다. 없거나 잘못된 값이면 이번 달. */
export function resolveMonth(param: string | string[] | undefined, now: Date = new Date()): YearMonth {
  const value = Array.isArray(param) ? param[0] : param;
  return value && isValidYearMonth(value) ? value : currentYearMonth(now);
}

/** 실제로 존재하는 날짜인지 (2026-02-30 같은 값을 걸러낸다) */
export function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

export function isValidYearMonth(value: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

/** 월을 delta개월 이동한다. 연도 경계를 넘어도 맞게 계산한다. */
export function shiftMonth(month: YearMonth, delta: number): YearMonth {
  const [y, m] = month.split("-").map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

export function daysInMonth(month: YearMonth): number {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

/** 그 달 1일의 요일 (0=일요일) */
export function firstWeekday(month: YearMonth): number {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).getDay();
}

/** 그 달의 첫날과 마지막 날 */
export function monthRange(month: YearMonth): { from: string; to: string } {
  return { from: `${month}-01`, to: `${month}-${pad(daysInMonth(month))}` };
}

export function monthLabel(month: YearMonth): string {
  const [y, m] = month.split("-").map(Number);
  return `${y}년 ${m}월`;
}

/** YYYY-MM-DD가 해당 월에 속하는지 */
export function isInMonth(date: string, month: YearMonth): boolean {
  return date.startsWith(`${month}-`);
}
