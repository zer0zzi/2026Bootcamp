"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "메인" },
  { href: "/transactions", label: "내역" },
  { href: "/calendar", label: "달력" },
  { href: "/budget", label: "예산" },
];

/** 메인("/")은 정확히 일치할 때만, 나머지는 하위 경로(/transactions/new 등)까지 현재 탭으로 본다. */
function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** 상단 탭. 현재 탭은 색·굵기·밑줄과 aria-current로 구분한다. */
export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {NAV_LINKS.map(({ href, label }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`border-b-2 py-1 ${
              active
                ? "border-blue-600 font-bold text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}
