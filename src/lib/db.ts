import { PrismaClient } from "@prisma/client";

// 개발 모드의 핫 리로드 때 클라이언트가 중복 생성되지 않도록 전역에 보관한다.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
