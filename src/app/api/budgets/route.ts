import { NextResponse } from "next/server";
import { badRequest, readJson } from "@/lib/api";
import { listBudgets, setBudget } from "@/lib/budgets";
import { EXPENSE_CATEGORIES, TOTAL_BUDGET_KEY } from "@/lib/categories";
import { budgetInputSchema } from "@/lib/schemas";

const BUDGET_KEYS: readonly string[] = [TOTAL_BUDGET_KEY, ...EXPENSE_CATEGORIES];

/** GET /api/budgets - 설정된 예산 목록 */
export async function GET() {
  return NextResponse.json(await listBudgets());
}

/** PUT /api/budgets - 예산 하나를 저장한다. 금액이 0이면 삭제한다. */
export async function PUT(request: Request) {
  const parsed = budgetInputSchema.safeParse(await readJson(request));
  if (!parsed.success || !BUDGET_KEYS.includes(parsed.data.category)) return badRequest();

  await setBudget(parsed.data.category, parsed.data.amount);
  return NextResponse.json(parsed.data);
}
