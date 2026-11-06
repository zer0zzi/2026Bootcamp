"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { TransactionInput } from "@/lib/schemas";
import { TransactionForm } from "./TransactionForm";

type Props = {
  initial: TransactionInput;
  titleSuggestions: string[];
  /** 있으면 그 거래를 수정(PUT), 없으면 새로 저장(POST)한다. */
  editingId?: number;
};

/** 폼 입력을 API로 저장하고 내역 화면으로 돌아가는 화면 흐름. */
export function TransactionEditor({ initial, titleSuggestions, editingId }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(data: TransactionInput) {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(
        editingId === undefined ? "/api/transactions" : `/api/transactions/${editingId}`,
        {
          method: editingId === undefined ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );
      if (!res.ok) throw new Error((await res.json()).error ?? "저장에 실패했습니다.");

      router.push("/transactions");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장에 실패했습니다.");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <TransactionForm
        initial={initial}
        titleSuggestions={titleSuggestions}
        submitLabel={editingId === undefined ? "저장하기" : "수정 저장"}
        saving={saving}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}
