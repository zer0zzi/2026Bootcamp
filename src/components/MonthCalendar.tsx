import Link from "next/link";
import { daysInMonth, firstWeekday, todayString, type YearMonth } from "@/lib/dates";
import { formatWon } from "@/lib/format";

type Props = {
  month: YearMonth;
  /** 일(1~31)별 수입·지출 합계 */
  totals: Record<number, { income: number; expense: number }>;
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** 만 원 단위 이하는 줄여 보여 좁은 칸에 들어가게 한다. 예: 1,234,000 -> "123.4만" */
function compact(amount: number): string {
  return amount >= 10000 ? `${(amount / 10000).toFixed(1).replace(/\.0$/, "")}만` : amount.toLocaleString("ko-KR");
}

/** 월 달력. 날짜를 누르면 그날의 내역으로 이동한다. */
export function MonthCalendar({ month, totals }: Props) {
  const today = todayString();
  // 1일 앞의 빈 칸 + 날짜 칸. 앞 빈 칸은 null.
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday(month)).fill(null),
    ...Array.from({ length: daysInMonth(month) }, (_, i) => i + 1),
  ];

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[32rem] rounded-xl border border-gray-200 bg-white p-2">
        <div className="grid grid-cols-7 text-center text-xs text-gray-500">
          {WEEKDAYS.map((day, i) => (
            <p key={day} className={`py-1 ${i === 0 ? "text-red-500" : ""}`}>
              {day}
            </p>
          ))}
        </div>
        <ul className="grid grid-cols-7 gap-1">
          {cells.map((day, index) => {
            if (day === null) return <li key={`blank-${index}`} aria-hidden="true" />;

            const date = `${month}-${String(day).padStart(2, "0")}`;
            const total = totals[day];
            const isToday = date === today;
            return (
              <li key={day}>
                <Link
                  href={`/transactions?from=${date}&to=${date}`}
                  aria-label={`${date}${total ? `, 수입 ${formatWon(total.income)}, 지출 ${formatWon(total.expense)}` : ", 거래 없음"}`}
                  className={`block h-20 rounded-lg border p-1 text-xs hover:border-blue-400 ${
                    isToday ? "border-blue-500 bg-blue-50" : "border-gray-100"
                  }`}
                >
                  <span className={`font-medium ${isToday ? "text-blue-700" : ""}`}>{day}</span>
                  {total && total.income > 0 && (
                    <span className="block truncate text-blue-600">+{compact(total.income)}</span>
                  )}
                  {total && total.expense > 0 && (
                    <span className="block truncate text-rose-600">-{compact(total.expense)}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
