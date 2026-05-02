"use client";

import { useState } from "react";
import { Star, ShieldCheck, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate, getInitials } from "@/lib/utils";

interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  reply?: string | null;
  orderId?: string | null;
  createdAt: Date;
  user: { name?: string | null; image?: string | null };
}

interface RatingDistribution {
  [star: number]: number;
}

interface Props {
  reviews: Review[];
  averageRating: number;
  artisanName?: string;
  distribution: RatingDistribution;
}

type SortOption = "recent" | "best" | "worst";

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "size-3.5", md: "size-4", lg: "size-5" };
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${sizes[size]} ${
            i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-neutral-200 text-neutral-200"
          }`}
        />
      ))}
    </div>
  );
}

export function ReviewList({ reviews, averageRating, artisanName, distribution }: Props) {
  const [sort, setSort] = useState<SortOption>("recent");
  const [showAll, setShowAll] = useState(false);

  const sorted = [...reviews].sort((a, b) => {
    if (sort === "best") return b.rating - a.rating;
    if (sort === "worst") return a.rating - b.rating;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const total = reviews.length;
  const visible = showAll ? sorted : sorted.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Resumo geral */}
      <div className="flex flex-col sm:flex-row gap-6 p-5 bg-neutral-50 rounded-2xl border border-neutral-100">
        {/* Nota geral */}
        <div className="flex flex-col items-center justify-center sm:w-36 shrink-0 text-center">
          <span className="text-5xl font-bold text-neutral-900">{averageRating.toFixed(1)}</span>
          <Stars rating={averageRating} size="md" />
          <span className="text-xs text-muted-foreground mt-1">{total} avaliação{total !== 1 ? "ões" : ""}</span>
        </div>

        {/* Barras de distribuição */}
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] ?? 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs text-neutral-600">
                <span className="w-3 text-right shrink-0">{star}</span>
                <Star className="size-3 fill-amber-400 text-amber-400 shrink-0" />
                <div className="flex-1 bg-neutral-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right shrink-0">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ordenação */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-700">
          {total} avaliação{total !== 1 ? "ões" : ""}
        </span>
        <div className="flex items-center gap-1 text-sm">
          <span className="text-muted-foreground hidden sm:inline">Ordenar:</span>
          {(["recent", "best", "worst"] as SortOption[]).map((opt) => (
            <button
              key={opt}
              onClick={() => setSort(opt)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                sort === opt
                  ? "bg-[#1e3a5f] text-white"
                  : "text-neutral-500 hover:bg-neutral-100"
              }`}
            >
              {opt === "recent" ? "Mais recentes" : opt === "best" ? "Melhor nota" : "Pior nota"}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <div className="space-y-6">
        {visible.map((review) => (
          <div key={review.id} className="flex gap-4">
            <Avatar className="size-9 shrink-0 mt-0.5">
              <AvatarImage src={review.user.image ?? undefined} />
              <AvatarFallback className="text-xs bg-neutral-200">
                {getInitials(review.user.name ?? "U")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1.5">
              {/* Cabeçalho */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium text-sm text-neutral-900">
                  {review.user.name ?? "Cliente"}
                </span>
                {review.orderId && (
                  <Badge className="gap-1 text-[10px] px-1.5 py-0.5 bg-[#27ae60]/10 text-[#27ae60] border-[#27ae60]/20 hover:bg-[#27ae60]/10">
                    <ShieldCheck className="size-2.5" /> Compra verificada
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {formatDate(review.createdAt)}
                </span>
              </div>

              {/* Estrelas */}
              <Stars rating={review.rating} size="sm" />

              {/* Comentário */}
              {review.comment && (
                <p className="text-sm text-neutral-600 leading-relaxed">{review.comment}</p>
              )}

              {/* Resposta do artesão */}
              {review.reply && (
                <div className="mt-3 ml-2 border-l-2 border-[#1e3a5f]/20 pl-3 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="size-5 rounded-full bg-[#1e3a5f] flex items-center justify-center shrink-0">
                      <Star className="size-2.5 fill-white text-white" />
                    </div>
                    <span className="text-xs font-semibold text-[#1e3a5f]">
                      Resposta de {artisanName ?? "artesão"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">{review.reply}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Ver mais */}
      {total > 5 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-[#1e3a5f] font-medium border border-[#1e3a5f]/20 rounded-xl hover:bg-[#1e3a5f]/5 transition-colors"
        >
          Ver todas as {total} avaliações <ChevronDown className="size-4" />
        </button>
      )}
    </div>
  );
}
