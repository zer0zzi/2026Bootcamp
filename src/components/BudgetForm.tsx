"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EXPENSE_CATEGORIES, TOTAL_BUDGET_KEY } from "@/lib/categories";
import type { SavedBudget } from "@/lib/schemas";

const KEYS: string[] = [TOTAL_BUDGET_KEY, ...EXPENSE_CATEGORIES];

const labelOf = (key: string) => (key === TOTAL_BUDGET_KEY ? "월 전체 예산" : key);

/** 설정된 예산을 { 카테고리: 금액 } 형태로 바꾼다. 없는 카테고리는 0(미설정). */
function toAmountMap(budgets: SavedBudget[]): Record<string, number> {
  const map = Object.fromEntries(KEYS.map((key) => [key, 0]));
  for (const { category, amount } of budgets) map[category] = amount;
  return map;
}

/** 월 전체와 카테고리별 예산을 설정한다. 금액을 비우거나 0으로 두면 예산이 해제된다. */
export function BudgetForm({ budgets, readOnly = false }: { budgets: SavedBudget[]; readOnly?: boolean }) {
  const router = useRouter();
  // 서버에 저장된 값. 이 값과 다른 칸만 저장 요청을 보낸다.
  const [saved, setSaved] = useState(() => toAmountMap(budgets));
  const [amounts, setAmounts] = useState(saved);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const changedKeys = KEYS.filter((key) => amounts[key] !== saved[key]);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const results = await Promise.all(
        changedKeys.map((category) =>
          fetch("/api/budgets", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category, amount: amounts[category] }),
          }),
        ),
      );
      if (results.some((res) => !res.ok)) throw new Error();

      // 이 화면에 그대로 머물고, 방금 저장한 값을 기준으로 삼아 "변경 없음" 상태로 돌아간다.
      setSaved(amounts);
      setMessage({ ok: true, text: "예산이 저장되었습니다." });
      router.refresh();
    } catch {
      setMessage({ ok: false, text: "저장하지 못했습니다. 잠시 후 다시 시도해 주세요." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {KEYS.map((key) => (
          <li key={key} className="flex items-center justify-between gap-4 px-4 py-3">
            <label htmlFor={`budget-${key}`} className={key === TOTAL_BUDGET_KEY ? "font-bold" : "text-sm"}>
              {labelOf(key)}
            </label>
            <div className="flex items-center gap-1 text-sm">
              <input
                id={`budget-${key}`}
                type="number"
                min={0}
                step={1000}
                disabled={readOnly}
                placeholder="미설정"
                className="w-36 rounded border border-gray-300 px-2 py-1 text-right focus:border-blue-500 focus:outline-none"
                value={amounts[key] === 0 ? "" : amounts[key]}
                onChange={(e) => {
                  setMessage(null); // 다시 고치기 시작하면 이전 안내는 지운다.
                  setAmounts({ ...amounts, [key]: Math.max(0, Math.round(Number(e.target.value)) || 0) });
                }}
              />
              <span className="text-gray-500">원</span>
            </div>
          </li>
        ))}
      </ul>

      {message && (
        <p
          role="status"
          className={`rounded-lg px-4 py-3 text-sm ${message.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
        >
          {message.text}
        </p>
      )}

      {!readOnly && (
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || changedKeys.length === 0}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {saving ? "저장 중..." : "예산 저장"}
        </button>
      )}
    </div>
  );
}
