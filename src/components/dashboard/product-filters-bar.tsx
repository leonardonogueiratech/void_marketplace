"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, X } from "lucide-react";

const STATUS_TABS = [
  { value: "ALL",      label: "Todos" },
  { value: "ACTIVE",   label: "Ativos" },
  { value: "DRAFT",    label: "Rascunhos" },
  { value: "INACTIVE", label: "Inativos" },
  { value: "SOLD_OUT", label: "Esgotados" },
];

interface Props {
  statusCounts: Record<string, number>;
  total: number;
}

export function ProductFiltersBar({ statusCounts, total }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentStatus = params.get("status") ?? "ALL";
  const currentQ = params.get("q") ?? "";

  const push = useCallback(
    (updates: Record<string, string | undefined>) => {
      const next = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v) next.set(k, v); else next.delete(k);
      }
      startTransition(() => router.push(`${pathname}?${next.toString()}`));
    },
    [params, pathname, router]
  );

  return (
    <div className="space-y-3">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
        <input
          type="text"
          defaultValue={currentQ}
          placeholder="Buscar por nome do produto..."
          onChange={(e) => push({ q: e.target.value || undefined, status: currentStatus !== "ALL" ? currentStatus : undefined })}
          className="w-full pl-9 pr-9 py-2 text-sm rounded-xl border border-[#1e3a5f]/15 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/30 transition-all"
        />
        {currentQ && (
          <button
            onClick={() => push({ q: undefined })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Tabs de status */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {STATUS_TABS.map((tab) => {
          const count = tab.value === "ALL" ? total : (statusCounts[tab.value] ?? 0);
          const active = currentStatus === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => push({ status: tab.value !== "ALL" ? tab.value : undefined, q: currentQ || undefined })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                active
                  ? "bg-[#1e3a5f] text-white"
                  : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              } ${isPending ? "opacity-60" : ""}`}
            >
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? "bg-white/20" : "bg-neutral-200"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
