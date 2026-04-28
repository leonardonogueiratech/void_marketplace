"use client";

import Link from "next/link";
import Image from "next/image";

const CATEGORY_STYLES: Record<string, { bg: string; accent: string; emoji: string }> = {
  "ceramica-barro":    { bg: "from-orange-50 to-amber-100",  accent: "border-orange-200",  emoji: "🏺" },
  "bordado-tecido":    { bg: "from-pink-50 to-rose-100",     accent: "border-pink-200",    emoji: "🧵" },
  "madeira-marcenaria":{ bg: "from-amber-50 to-yellow-100",  accent: "border-amber-200",   emoji: "🪵" },
  "joias-bijuterias":  { bg: "from-yellow-50 to-amber-100",  accent: "border-yellow-200",  emoji: "💍" },
  "couro-couroaria":   { bg: "from-stone-50 to-stone-100",   accent: "border-stone-200",   emoji: "👜" },
  "pintura-arte":      { bg: "from-purple-50 to-violet-100", accent: "border-purple-200",  emoji: "🎨" },
  "cestaria-palha":    { bg: "from-lime-50 to-green-100",    accent: "border-lime-200",    emoji: "🧺" },
  "pedra-cristal":     { bg: "from-sky-50 to-blue-100",      accent: "border-sky-200",     emoji: "💎" },
  "papel-origami":     { bg: "from-cyan-50 to-teal-100",     accent: "border-cyan-200",    emoji: "📄" },
  "velas-aromaterapia":{ bg: "from-fuchsia-50 to-pink-100",  accent: "border-fuchsia-200", emoji: "🕯️" },
  "decoracao":         { bg: "from-emerald-50 to-teal-100",  accent: "border-emerald-200", emoji: "🪴" },
  "moda-vestuario":    { bg: "from-indigo-50 to-blue-100",   accent: "border-indigo-200",  emoji: "👗" },
};

const DEFAULT_STYLE = { bg: "from-neutral-50 to-neutral-100", accent: "border-neutral-200", emoji: "🎁" };

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
    image?: string | null;
    description?: string | null;
    _count?: { products: number };
  };
}

export function CategoryCard({ category }: CategoryCardProps) {
  const style = CATEGORY_STYLES[category.slug] ?? DEFAULT_STYLE;
  const count = category._count?.products ?? 0;

  return (
    <Link
      href={`/categorias/${category.slug}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-gradient-to-br ${style.bg} ${style.accent} hover:shadow-lg hover:-translate-y-1 transition-all duration-200`}
    >
      {category.image ? (
        <>
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
          <div className="p-3">
            <p className="font-semibold text-sm text-[#1e3a5f]">{category.name}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{count} produto{count !== 1 ? "s" : ""}</p>
          </div>
        </>
      ) : (
        <div className="p-5 flex flex-col gap-3">
          <span className="text-4xl leading-none">{style.emoji}</span>
          <div>
            <p className="font-semibold text-sm text-[#1e3a5f] leading-snug">{category.name}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{count} produto{count !== 1 ? "s" : ""}</p>
          </div>
        </div>
      )}
    </Link>
  );
}
