import { prisma } from "./db";
import { assertWritable, isDemoMode } from "./demo";
import { createDemoBudgets } from "./demoData";
import type { SavedBudget } from "./schemas";

export async function listBudgets(): Promise<SavedBudget[]> {
  if (isDemoMode()) return createDemoBudgets();

  const rows = await prisma.budget.findMany({ orderBy: { id: "asc" } });
  return rows.map(({ category, amount }) => ({ category, amount }));
}

/** 예산을 저장한다. 금액이 0이면 예산을 삭제한다. */
export async function setBudget(category: string, amount: number): Promise<void> {
  assertWritable();
  if (amount === 0) {
    await prisma.budget.deleteMany({ where: { category } });
    return;
  }
  await prisma.budget.upsert({
    where: { category },
    create: { category, amount },
    update: { amount },
  });
}
