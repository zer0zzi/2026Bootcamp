import { TYPE_LABELS } from "./categories";
import type { SavedTransaction } from "./schemas";

const HEADER = ["날짜", "구분", "상호/내용", "결제수단", "카테고리", "품목", "수량", "금액", "메모"];

/** 쉼표·따옴표·줄바꿈이 있으면 따옴표로 감싸고 내부 따옴표는 두 번 쓴다. */
function escapeCell(value: string | number): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * 거래를 CSV 문자열로 만든다. 품목 한 줄이 CSV 한 줄이다.
 * 엑셀에서 한글이 깨지지 않도록 맨 앞에 BOM을 붙인다.
 */
export function toCsv(transactions: SavedTransaction[]): string {
  const rows = transactions.flatMap((t) =>
    t.items.map((item) => [
      t.date,
      TYPE_LABELS[t.type],
      t.title,
      t.paymentMethod,
      item.category,
      item.name,
      item.quantity,
      item.price,
      t.memo,
    ]),
  );
  const lines = [HEADER, ...rows].map((row) => row.map(escapeCell).join(","));
  return `﻿${lines.join("\r\n")}\r\n`;
}
