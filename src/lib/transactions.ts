import type { Category, PaymentMethod, TransactionType } from "./categories";
import { prisma } from "./db";
import type { SavedTransaction, TransactionInput } from "./schemas";

const withItems = { items: { orderBy: { id: "asc" as const } } };

type Row = NonNullable<Awaited<ReturnType<typeof findRow>>>;

function findRow(id: number) {
  return prisma.transaction.findUnique({ where: { id }, include: withItems });
}

/** DB 행을 화면에서 쓰는 형태로 바꾼다. 문자열 컬럼을 도메인 타입으로 좁히는 곳은 여기뿐이다. */
function toSaved(row: Row): SavedTransaction {
  return {
    id: row.id,
    type: row.type as TransactionType,
    date: row.date,
    title: row.title,
    total: row.total,
    paymentMethod: row.paymentMethod as PaymentMethod | "",
    memo: row.memo,
    createdAt: row.createdAt.toISOString(),
    items: row.items.map(({ name, quantity, price, category }) => ({
      name,
      quantity,
      price,
      category: category as Category,
    })),
  };
}

/** 총액은 요청 값을 믿지 않고 품목 가격의 합계로 계산한다. */
const sumOfItems = (items: TransactionInput["items"]) =>
  items.reduce((sum, item) => sum + item.price, 0);

/** 모든 거래를 최신 날짜순으로 조회한다. */
export async function listTransactions(): Promise<SavedTransaction[]> {
  const rows = await prisma.transaction.findMany({
    include: withItems,
    orderBy: [{ date: "desc" }, { id: "desc" }],
  });
  return rows.map(toSaved);
}

export async function getTransaction(id: number): Promise<SavedTransaction | null> {
  const row = await findRow(id);
  return row ? toSaved(row) : null;
}

export async function createTransaction({ items, ...data }: TransactionInput): Promise<number> {
  const saved = await prisma.transaction.create({
    data: { ...data, total: sumOfItems(items), items: { create: items } },
  });
  return saved.id;
}

/** 품목은 통째로 교체한다. 거래와 품목이 함께 바뀌거나 함께 안 바뀌도록 트랜잭션으로 묶는다. 없으면 false. */
export async function updateTransaction(
  id: number,
  { items, ...data }: TransactionInput,
): Promise<boolean> {
  const exists = await prisma.transaction.count({ where: { id } });
  if (!exists) return false;

  await prisma.$transaction([
    prisma.transactionItem.deleteMany({ where: { transactionId: id } }),
    prisma.transaction.update({
      where: { id },
      data: { ...data, total: sumOfItems(items), items: { create: items } },
    }),
  ]);
  return true;
}

/** 삭제한다. 없으면 false. 품목은 onDelete: Cascade로 함께 지워진다. */
export async function deleteTransaction(id: number): Promise<boolean> {
  const { count } = await prisma.transaction.deleteMany({ where: { id } });
  return count > 0;
}

/** 자동완성용: 최근에 쓴 상호/내용을 중복 없이 최대 limit개 돌려준다. */
export async function listRecentTitles(limit = 30): Promise<string[]> {
  const rows = await prisma.transaction.findMany({
    select: { title: true },
    orderBy: { id: "desc" },
    take: 200,
  });
  return [...new Set(rows.map((row) => row.title))].slice(0, limit);
}
