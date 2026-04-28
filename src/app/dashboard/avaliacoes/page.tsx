import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star } from "lucide-react";
import { ReviewReply } from "@/components/dashboard/review-reply";

export default async function DashboardReviewsPage() {
  const session = await auth();
  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId: session!.user.id },
  });

  if (!artisan) return null;

  const reviews = await prisma.review.findMany({
    where: { artisanId: artisan.id, published: true },
    include: {
      user: { select: { name: true, image: true } },
      product: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const average =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Avaliações</h1>
        <p className="mt-1 text-sm text-neutral-500">Acompanhe e responda o que os clientes dizem sobre sua loja.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Média geral</p>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-[#1e3a5f]">
                {average > 0 ? average.toFixed(1) : "—"}
              </p>
              {average > 0 && (
                <div className="flex gap-0.5 mb-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`size-4 ${n <= Math.round(average) ? "fill-amber-400 text-amber-400" : "text-neutral-200 fill-neutral-100"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Total de avaliações</p>
            <p className="text-3xl font-bold text-[#1e3a5f]">{reviews.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Distribuição</p>
            <div className="space-y-1 mt-1">
              {distribution.map(({ star, count }) => (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs w-3 text-neutral-500">{star}</span>
                  <Star className="size-3 fill-amber-400 text-amber-400 shrink-0" />
                  <div className="flex-1 bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="text-xs text-neutral-400 w-4 text-right">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-neutral-400">
            <Star className="size-10 mx-auto mb-3 text-neutral-200" />
            <p className="font-medium">Nenhuma avaliação ainda.</p>
            <p className="text-sm mt-1">As avaliações aparecerão aqui após pedidos entregues.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="border-[#1e3a5f]/10">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarImage src={review.user.image ?? undefined} />
                      <AvatarFallback className="text-xs bg-[#1e3a5f]/10 text-[#1e3a5f]">
                        {getInitials(review.user.name ?? "Cliente")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-[#1e3a5f]">
                        {review.user.name ?? "Cliente"}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {review.product?.name ? `${review.product.name} · ` : ""}
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="gap-1 shrink-0">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    {review.rating}/5
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {review.comment ? (
                  <p className="text-sm leading-relaxed text-neutral-700">{review.comment}</p>
                ) : (
                  <p className="text-sm text-neutral-400 italic">Cliente não deixou comentário.</p>
                )}

                <ReviewReply reviewId={review.id} existingReply={review.reply} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
