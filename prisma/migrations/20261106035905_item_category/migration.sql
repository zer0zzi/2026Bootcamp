/*
  Warnings:

  - You are about to drop the column `category` on the `Receipt` table. All the data in the column will be lost.
  - Added the required column `category` to the `ReceiptItem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Receipt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "merchant" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Receipt" ("createdAt", "date", "id", "merchant", "total") SELECT "createdAt", "date", "id", "merchant", "total" FROM "Receipt";
DROP TABLE "Receipt";
ALTER TABLE "new_Receipt" RENAME TO "Receipt";
CREATE TABLE "new_ReceiptItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "receiptId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    CONSTRAINT "ReceiptItem_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ReceiptItem" ("id", "name", "price", "quantity", "receiptId") SELECT "id", "name", "price", "quantity", "receiptId" FROM "ReceiptItem";
DROP TABLE "ReceiptItem";
ALTER TABLE "new_ReceiptItem" RENAME TO "ReceiptItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
