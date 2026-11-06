import Link from "next/link";
import { currentYearMonth, monthLabel, shiftMonth, type YearMonth } from "@/lib/dates";

type Props = {
  month: YearMonth;
  /** 월 이동 링크가 가리킬 경로 (예: "/", "/calendar") */
  basePath: string;
};

const linkClass = "rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50";

/** 이전 달 / 다음 달 이동. 월은 URL 쿼리(?month=YYYY-MM)로 유지해 새로고침·공유해도 같은 화면이 된다. */
export function MonthNav({ month, basePath }: Props) {
  const isCurrent = month === currentYearMonth();

  return (
    <nav aria-label="월 이동" className="flex items-center gap-2">
      <Link href={`${basePath}?month=${shiftMonth(month, -1)}`} className={linkClass} aria-label="이전 달">
        ◀
      </Link>
      <h2 className="min-w-28 text-center text-lg font-bold">{monthLabel(month)}</h2>
      <Link href={`${basePath}?month=${shiftMonth(month, 1)}`} className={linkClass} aria-label="다음 달">
        ▶
      </Link>
      {!isCurrent && (
        <Link href={basePath} className="ml-2 text-sm text-blue-600 hover:underline">
          이번 달로
        </Link>
      )}
    </nav>
  );
}
