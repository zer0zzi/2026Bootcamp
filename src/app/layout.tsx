import type { Metadata } from "next";
import Link from "next/link";
import { NavLinks } from "@/components/NavLinks";
import "./globals.css";

export const metadata: Metadata = {
  title: "스마트가계부",
  description: "수입과 지출, 예산을 한눈에 관리하는 스마트가계부",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <header className="border-b border-gray-200 bg-white">
          <nav className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4 text-sm">
            <Link href="/" className="text-base font-bold">
              💰 스마트가계부
            </Link>
            <NavLinks />
          </nav>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
