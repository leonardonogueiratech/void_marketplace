"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface ActiveFiltersProps {
  params: {
    categoria?: string;
    ordem?: string;
    min?: string;
    max?: string;
    q?: string;
  };
  categories: { id: string; name: string; slug: string }[];
  total: number;
}

const ORDER_LABELS: Record<string, string> = {
  "menor-preco": "Menor preço",
  "maior-preco": "Maior preço",
  "mais-vendidos": "Mais vendidos",
  "avaliacao": "Melhor avaliação",
  "categoria": "Por Categoria",
};

export function ActiveFilters({ params, categories, total }: ActiveFiltersProps) {
  const router = useRouter();

  const chips: { key: string; label: string }[] = [];

  if (params.q) chips.push({ key: "q", label: `"${params.q}"` });
  if (params.categoria) {
    const cat = categories.find((c) => c.slug === params.categoria);
    chips.push({ key: "categoria", label: cat?.name ?? params.categoria });
  }
  if (params.ordem && params.ordem !== "recentes") {
    chips.push({ key: "ordem", label: ORDER_LABELS[params.ordem] ?? params.ordem });
  }
  if (params.min) chips.push({ key: "min", label: `Mín R$${params.min}` });
  if (params.max) chips.push({ key: "max", label: `Máx R$${params.max}` });

  function removeChip(key: string) {
    const p = new URLSearchParams();
    const all = { ...params } as Record<string, string>;
    delete all[key];
    delete all["pagina"];
    Object.entries(all).forEach(([k, v]) => { if (v) p.set(k, v); });
    router.push(`/produtos${p.toString() ? `?${p.toString()}` : ""}`);
  }

  if (chips.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {total} produto{total !== 1 ? "s" : ""} disponíve{total !== 1 ? "is" : "l"}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground mr-1">Filtros:</span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={() => removeChip(chip.key)}
          className="inline-flex items-center gap-1.5 text-xs font-medium bg-[#1e3a5f] text-white px-3 py-1.5 rounded-full hover:bg-[#162d4a] transition-colors"
        >
          {chip.label}
          <X className="size-3" />
        </button>
      ))}
      <button
        onClick={() => router.push("/produtos")}
        className="text-xs text-[#27ae60] hover:text-[#1e9150] font-medium underline underline-offset-2 transition-colors"
      >
        Limpar tudo
      </button>
    </div>
  );
}
