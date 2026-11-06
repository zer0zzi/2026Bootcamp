"use client";

import { useState } from "react";
import {
  PAYMENT_METHODS,
  TRANSACTION_TYPES,
  TYPE_LABELS,
  categoriesFor,
  type TransactionType,
} from "@/lib/categories";
import { formatWon } from "@/lib/format";
import {
  transactionInputSchema,
  type TransactionInput,
  type TransactionItemData,
} from "@/lib/schemas";

type Props = {
  initial: TransactionInput;
  /** 상호/내용 자동완성 후보 (최근에 쓴 값) */
  titleSuggestions: string[];
  submitLabel: string;
  saving?: boolean;
  onSubmit: (data: TransactionInput) => void;
  onCancel: () => void;
};

const inputClass =
  "w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none";

/** 숫자 입력값을 정수로 바꾼다. 비어 있거나 잘못된 값은 0으로 처리한다. */
function toInt(value: string): number {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? n : 0;
}

/** 0은 빈칸으로 보여 줘서, 입력할 때 "0"을 지우는 수고를 없앤다. */
const showNumber = (n: number) => (n === 0 ? "" : n);

/** 거래(수입/지출) 입력·수정 폼. 총액은 품목 가격의 합계로 자동 계산된다. */
export function TransactionForm({
  initial,
  titleSuggestions,
  submitLabel,
  saving,
  onSubmit,
  onCancel,
}: Props) {
  const [data, setData] = useState<TransactionInput>(initial);

  const total = data.items.reduce((sum, item) => sum + item.price, 0);
  const canSave = transactionInputSchema.safeParse(data).success;
  const categories = categoriesFor(data.type);

  /** 종류를 바꾸면 그 종류에 없는 카테고리는 첫 카테고리로 바꾸고, 수입에서는 결제수단을 비운다. */
  function changeType(type: TransactionType) {
    if (type === data.type) return;
    const allowed = categoriesFor(type);
    setData((prev) => ({
      ...prev,
      type,
      paymentMethod: type === "INCOME" ? "" : prev.paymentMethod,
      items: prev.items.map((item) =>
        allowed.includes(item.category) ? item : { ...item, category: allowed[0] },
      ),
    }));
  }

  function updateItem(index: number, patch: Partial<TransactionItemData>) {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  function removeItem(index: number) {
    setData((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  }

  function addItem() {
    setData((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", quantity: 1, price: 0, category: categories[0] }],
    }));
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(data);
      }}
    >
      <div className="flex overflow-hidden rounded-lg border border-gray-300 text-sm" role="group" aria-label="거래 종류">
        {TRANSACTION_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            aria-pressed={data.type === type}
            onClick={() => changeType(type)}
            className={`flex-1 px-4 py-2 font-medium ${
              data.type === type
                ? type === "INCOME"
                  ? "bg-blue-600 text-white"
                  : "bg-rose-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium text-gray-700">날짜</span>
          <input
            type="date"
            className={inputClass}
            value={data.date}
            onChange={(e) => setData({ ...data, date: e.target.value })}
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium text-gray-700">
            {data.type === "INCOME" ? "내용" : "상호명 / 내용"}
          </span>
          <input
            className={inputClass}
            list="title-suggestions"
            value={data.title}
            placeholder={data.type === "INCOME" ? "예: 11월 월급" : "예: 하나로마트"}
            onChange={(e) => setData({ ...data, title: e.target.value })}
          />
          <datalist id="title-suggestions">
            {titleSuggestions.map((title) => (
              <option key={title} value={title} />
            ))}
          </datalist>
        </label>
        {data.type === "EXPENSE" && (
          <label className="space-y-1 text-sm">
            <span className="font-medium text-gray-700">결제수단</span>
            <select
              className={inputClass}
              value={data.paymentMethod}
              onChange={(e) =>
                setData({ ...data, paymentMethod: e.target.value as TransactionInput["paymentMethod"] })
              }
            >
              <option value="">선택 안 함</option>
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="space-y-1 text-sm">
          <span className="font-medium text-gray-700">메모</span>
          <input
            className={inputClass}
            value={data.memo}
            maxLength={500}
            onChange={(e) => setData({ ...data, memo: e.target.value })}
          />
        </label>
      </section>

      <section className="space-y-2">
        <div className="flex items-end justify-between">
          <h2 className="text-sm font-medium text-gray-700">
            {data.type === "INCOME" ? "수입 항목" : "품목"}
          </h2>
          <p aria-live="polite" className="text-sm">
            <span className="text-gray-500">총액 </span>
            <strong className="text-base">{formatWon(total)}</strong>
          </p>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-2">이름</th>
                <th className="w-20 px-3 py-2">수량</th>
                <th className="w-32 px-3 py-2">금액 (원)</th>
                <th className="w-36 px-3 py-2">카테고리</th>
                <th className="w-10 px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, index) => (
                <tr key={index} className="border-t border-gray-100">
                  <td className="px-3 py-2">
                    <input
                      aria-label={`${index + 1}번 이름`}
                      className={inputClass}
                      value={item.name}
                      onChange={(e) => updateItem(index, { name: e.target.value })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={1}
                      aria-label={`${index + 1}번 수량`}
                      className={inputClass}
                      value={item.quantity}
                      onChange={(e) => updateItem(index, { quantity: toInt(e.target.value) })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      aria-label={`${index + 1}번 금액`}
                      className={inputClass}
                      value={showNumber(item.price)}
                      onChange={(e) => updateItem(index, { price: toInt(e.target.value) })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      aria-label={`${index + 1}번 카테고리`}
                      className={inputClass}
                      value={item.category}
                      onChange={(e) =>
                        updateItem(index, { category: e.target.value as TransactionItemData["category"] })
                      }
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={data.items.length === 1}
                      aria-label={`${index + 1}번 삭제`}
                      className="text-gray-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" onClick={addItem} className="text-sm text-blue-600 hover:underline">
          + 항목 추가
        </button>
      </section>

      {!canSave && (
        <p className="text-xs text-gray-500">
          날짜, 상호명/내용, 항목 이름을 모두 채우면 저장할 수 있어요.
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={!canSave || saving}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {saving ? "저장 중..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
