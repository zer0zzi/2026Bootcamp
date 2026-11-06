import { NextResponse } from "next/server";
import { badRequest, notFound, parseId, readJson } from "@/lib/api";
import { transactionInputSchema } from "@/lib/schemas";
import { deleteTransaction, updateTransaction } from "@/lib/transactions";

type Context = { params: Promise<{ id: string }> };

/** PUT /api/transactions/:id - 거래를 수정한다. 품목은 통째로 교체된다. */
export async function PUT(request: Request, { params }: Context) {
  const id = parseId((await params).id);
  if (id === null) return badRequest("올바르지 않은 id입니다.");

  const parsed = transactionInputSchema.safeParse(await readJson(request));
  if (!parsed.success) return badRequest();

  return (await updateTransaction(id, parsed.data)) ? NextResponse.json({ id }) : notFound();
}

/** DELETE /api/transactions/:id - 거래와 품목을 삭제한다. */
export async function DELETE(_request: Request, { params }: Context) {
  const id = parseId((await params).id);
  if (id === null) return badRequest("올바르지 않은 id입니다.");

  return (await deleteTransaction(id)) ? new NextResponse(null, { status: 204 }) : notFound();
}
