import { BudgetForm } from "@/components/BudgetForm";
import { listBudgets } from "@/lib/budgets";

export const dynamic = "force-dynamic";

export default async function BudgetPage() {
  const budgets = await listBudgets();

  return (
    <>
      <h1 className="mb-2 text-2xl font-bold">예산</h1>
      <p className="mb-6 text-sm text-gray-600">
        매달 쓸 수 있는 금액을 정해 두면 메인 화면에서 사용률을 보여 드려요. 80%부터 &quot;주의&quot;,
        100%부터 &quot;초과&quot;로 표시됩니다. 금액을 비우면 예산이 해제됩니다.
      </p>
      <BudgetForm budgets={budgets} />
    </>
  );
}
