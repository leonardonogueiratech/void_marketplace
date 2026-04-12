"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface ProductFiltersProps {
  categories: { id: string; name: string; slug: string }[];
}

const ORDER_OPTIONS = [
  { value: "recentes", label: "Mais recentes" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "mais-vendidos", label: "Mais vendidos" },
  { value: "avaliacao", label: "Melhor avaliação" },
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

  const clearFilters = () => {
    router.push("/produtos");
  };

  const activeCategory = searchParams.get("categoria");
  const activeOrder = searchParams.get("ordem") ?? "recentes";
  const minPrice = searchParams.get("min") ?? "";
  const maxPrice = searchParams.get("max") ?? "";

  return (
    <div className="space-y-6">
      {/* Order */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Ordenar por</Label>
        <div className="flex flex-col gap-1">
          {ORDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateFilter("ordem", opt.value)}
              className={`text-left text-sm px-2 py-1.5 rounded-md transition-colors ${
                activeOrder === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-neutral-100 text-muted-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <Label className="text-sm font-semibold mb-3 block">Categoria</Label>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => updateFilter("categoria", "")}
              className={`text-left text-sm px-2 py-1.5 rounded-md transition-colors ${
                !activeCategory
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-neutral-100 text-muted-foreground"
              }`}
            >
              Todas
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateFilter("categoria", cat.slug)}
                className={`text-left text-sm px-2 py-1.5 rounded-md transition-colors ${
                  activeCategory === cat.slug
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-neutral-100 text-muted-foreground"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Price range */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Faixa de Preço</Label>
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            placeholder="Min"
            defaultValue={minPrice}
            className="h-8 text-sm"
            onBlur={(e) => updateFilter("min", e.target.value)}
          />
          <span className="text-muted-foreground text-sm">—</span>
          <Input
            type="number"
            placeholder="Max"
            defaultValue={maxPrice}
            className="h-8 text-sm"
            onBlur={(e) => updateFilter("max", e.target.value)}
          />
        </div>
      </div>

      <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
        Limpar filtros
      </Button>
    </div>
  );
}
