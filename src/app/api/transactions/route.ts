import { NextResponse } from "next/server";
import { badRequest, readJson } from "@/lib/api";
import { transactionInputSchema } from "@/lib/schemas";
import { createTransaction, listTransactions } from "@/lib/transactions";

/** GET /api/transactions - 모든 거래를 최신 날짜순으로 반환한다. */
export async function GET() {
  return NextResponse.json(await listTransactions());
}

/** POST /api/transactions - 거래를 저장한다. 총액은 서버가 품목 합계로 계산한다. */
export async function POST(request: Request) {
  const parsed = transactionInputSchema.safeParse(await readJson(request));
  if (!parsed.success) return badRequest();

  const id = await createTransaction(parsed.data);
  return NextResponse.json({ id }, { status: 201 });
}
