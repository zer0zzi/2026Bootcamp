import { formatWon } from "@/lib/format";
import type { CategoryGroup } from "@/lib/transactionFilter";

/** 카테고리별로 품목을 모아 보여준다. 카테고리마다 합계가 있다. */
export function CategoryGroups({ groups }: { groups: CategoryGroup[] }) {
  return (
    <ul className="space-y-3">
      {groups.map((group) => (
        <li key={group.category} className="rounded-xl border border-gray-200 bg-white p-4">
          <details open>
            <summary className="flex cursor-pointer items-center justify-between">
              <span className="font-medium">
                {group.category}{" "}
                <span className="text-xs font-normal text-gray-500">{group.entries.length}건</span>
              </span>
              <span className="font-semibold">{formatWon(group.total)}</span>
            </summary>
            <ul className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-sm text-gray-600">
              {group.entries.map((entry, i) => (
                <li key={i} className="flex justify-between gap-4">
                  <span>
                    {entry.item.name} × {entry.item.quantity}{" "}
                    <span className="text-xs text-gray-400">
                      {entry.date} · {entry.title}
                    </span>
                  </span>
                  <span>{formatWon(entry.item.price)}</span>
                </li>
              ))}
            </ul>
          </details>
        </li>
      ))}
    </ul>
  );
}
