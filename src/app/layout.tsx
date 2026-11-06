import type { Metadata } from "next";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { NavLinks } from "@/components/NavLinks";
import { readAuthConfig } from "@/lib/auth";
import { isDemoMode } from "@/lib/demo";
import "./globals.css";

export const metadata: Metadata = {
  title: "스마트가계부",
  description: "수입과 지출, 예산을 한눈에 관리하는 스마트가계부",
};

// 로그아웃 버튼 표시 여부를 빌드 시점이 아니라 요청 시점의 환경 변수로 정한다.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const authEnabled = readAuthConfig().state === "enabled";
  const demo = isDemoMode();

  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {demo && (
          <p className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
            데모 모드: 가상의 샘플 데이터이며 읽기만 할 수 있어요.
          </p>
        )}
        <header className="border-b border-gray-200 bg-white">
          <nav className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4 text-sm">
            <Link href="/" className="text-base font-bold">
              💰 스마트가계부
            </Link>
            <NavLinks />
            {authEnabled && <LogoutButton />}
          </nav>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
