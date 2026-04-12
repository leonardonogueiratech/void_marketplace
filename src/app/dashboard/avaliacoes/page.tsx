import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

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
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Avaliações</h1>
        <p className="mt-1 text-muted-foreground">
          Acompanhe o que os clientes estão dizendo sobre sua loja.
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">Total de avaliações</p>
            <p className="mt-2 text-2xl font-bold">{reviews.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">Média atual</p>
            <p className="mt-2 text-2xl font-bold">
              {average > 0 ? average.toFixed(1) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">Nota pública</p>
            <p className="mt-2 text-2xl font-bold">{artisan.rating.toFixed(1)}</p>
          </CardContent>
        </Card>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            Sua loja ainda não recebeu avaliações publicadas.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage src={review.user.image ?? undefined} />
                    <AvatarFallback>
                      {getInitials(review.user.name ?? "Cliente")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">
                      {review.user.name ?? "Cliente"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {review.product?.name ?? "Avaliação da loja"} • {formatDate(review.createdAt)}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {review.rating}/5
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-neutral-700">
                  {review.comment || "Cliente não deixou comentário escrito."}
                </p>
                {review.reply && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                      Resposta da loja
                    </p>
                    <p className="mt-1 text-sm text-amber-800">{review.reply}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
