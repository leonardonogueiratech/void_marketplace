"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Check, X } from "lucide-react";

interface ProductFiltersProps {
  categories: { id: string; name: string; slug: string }[];
}

const ORDER_OPTIONS = [
  { value: "recentes", label: "Mais recentes" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "mais-vendidos", label: "Mais vendidos" },
  { value: "avaliacao", label: "Melhor avaliação" },
  { value: "categoria", label: "Por Categoria" },
];

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("pagina");
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = () => router.push("/produtos");

  const activeCategory = searchParams.get("categoria");
  const activeOrder = searchParams.get("ordem") ?? "recentes";
  const minPrice = searchParams.get("min") ?? "";
  const maxPrice = searchParams.get("max") ?? "";

  const activeCount = [
    activeCategory,
    activeOrder !== "recentes" ? activeOrder : null,
    minPrice,
    maxPrice,
  ].filter(Boolean).length;

  return (
    <div className="sticky top-24 bg-white rounded-2xl border border-[#1e3a5f]/10 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e3a5f]/8 bg-[#f7f3ed]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-[#27ae60]" />
          <span className="text-sm font-semibold text-[#1e3a5f]">Filtros</span>
          {activeCount > 0 && (
            <span className="size-5 rounded-full bg-[#27ae60] text-white text-xs flex items-center justify-center font-medium">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs text-[#27ae60] hover:text-[#1e9150] font-medium flex items-center gap-1 transition-colors"
          >
            <X className="size-3" /> Limpar
          </button>
        )}
      </div>

      <div className="p-4 space-y-5">
        {/* Order */}
        <div>
          <p className="text-xs font-semibold text-[#1e3a5f]/50 uppercase tracking-wider mb-2">
            Ordenar por
          </p>
          <div className="flex flex-col gap-0.5">
            {ORDER_OPTIONS.map((opt) => {
              const isActive = activeOrder === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => updateFilter("ordem", opt.value)}
                  className={`flex items-center justify-between text-left text-sm px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-[#1e3a5f] text-white font-medium"
                      : "text-neutral-600 hover:bg-[#f7f3ed] hover:text-[#1e3a5f]"
                  }`}
                >
                  {opt.label}
                  {isActive && <Check className="size-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#1e3a5f]/8" />

        {/* Categories */}
        {categories.length > 0 && (
          <>
            <div>
              <p className="text-xs font-semibold text-[#1e3a5f]/50 uppercase tracking-wider mb-2">
                Categoria
              </p>
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => updateFilter("categoria", "")}
                  className={`flex items-center justify-between text-left text-sm px-3 py-2 rounded-lg transition-all ${
                    !activeCategory
                      ? "bg-[#27ae60] text-white font-medium"
                      : "text-neutral-600 hover:bg-[#f7f3ed] hover:text-[#1e3a5f]"
                  }`}
                >
                  Todas as categorias
                  {!activeCategory && <Check className="size-3.5 shrink-0" />}
                </button>
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => updateFilter("categoria", cat.slug)}
                      className={`flex items-center justify-between text-left text-sm px-3 py-2 rounded-lg transition-all ${
                        isActive
                          ? "bg-[#27ae60] text-white font-medium"
                          : "text-neutral-600 hover:bg-[#f7f3ed] hover:text-[#1e3a5f]"
                      }`}
                    >
                      {cat.name}
                      {isActive && <Check className="size-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="h-px bg-[#1e3a5f]/8" />
          </>
        )}

        {/* Price range */}
        <div>
          <p className="text-xs font-semibold text-[#1e3a5f]/50 uppercase tracking-wider mb-2">
            Faixa de Preço (R$)
          </p>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Mín"
              defaultValue={minPrice}
              className="h-8 text-sm border-[#1e3a5f]/20 focus-visible:ring-[#27ae60]"
              onBlur={(e) => updateFilter("min", e.target.value)}
            />
            <span className="text-[#1e3a5f]/30 text-sm font-medium">—</span>
            <Input
              type="number"
              placeholder="Máx"
              defaultValue={maxPrice}
              className="h-8 text-sm border-[#1e3a5f]/20 focus-visible:ring-[#27ae60]"
              onBlur={(e) => updateFilter("max", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
