import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, AtSign, MapPin, MessageCircle } from "lucide-react";

export default async function DashboardProfilePage() {
  const session = await auth();
  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId: session!.user.id },
    include: {
      categories: {
        include: { category: true },
      },
      subscription: true,
      _count: {
        select: {
          products: { where: { status: "ACTIVE" } },
          reviews: true,
        },
      },
    },
  });

  if (!artisan) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Perfil da loja</h1>
          <p className="mt-1 text-muted-foreground">
            Resumo público do seu ateliê dentro do marketplace.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/artesao/${artisan.slug}`}>Ver loja pública</Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="relative h-40 bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100">
          {artisan.bannerImage && (
            <Image
              src={artisan.bannerImage}
              alt={artisan.storeName}
              fill
              className="object-cover"
            />
          )}
        </div>
        <CardContent className="relative pt-0">
          <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex size-20 items-center justify-center rounded-2xl border-4 border-white bg-white text-2xl font-bold text-amber-700 shadow-sm">
              {artisan.storeName.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold text-neutral-900">{artisan.storeName}</h2>
                <Badge variant="secondary">{artisan.status}</Badge>
                {artisan.featured && <Badge className="bg-amber-500 hover:bg-amber-500">Destaque</Badge>}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                @{artisan.slug}
              </p>
            </div>
          </div>

          {artisan.bio && (
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {artisan.bio}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Informações da loja</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            {(artisan.city || artisan.state || artisan.location) && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>
                  {[artisan.location, artisan.city, artisan.state].filter(Boolean).join(" • ")}
                </span>
              </div>
            )}
            {artisan.whatsapp && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <MessageCircle className="mt-0.5 size-4 shrink-0" />
                <span>{artisan.whatsapp}</span>
              </div>
            )}
            {artisan.instagram && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <AtSign className="mt-0.5 size-4 shrink-0" />
                <span>@{artisan.instagram}</span>
              </div>
            )}
            {artisan.website && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <Globe className="mt-0.5 size-4 shrink-0" />
                <span>{artisan.website}</span>
              </div>
            )}

            {artisan.story && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                  História da marca
                </p>
                <p className="mt-2 text-sm leading-relaxed text-amber-800">
                  {artisan.story}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indicadores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Produtos ativos</p>
              <p className="text-2xl font-bold">{artisan._count.products}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avaliações</p>
              <p className="text-2xl font-bold">{artisan._count.reviews}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Plano atual</p>
              <p className="text-2xl font-bold">{artisan.subscription?.plan ?? "FREE"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Categorias</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {artisan.categories.length > 0 ? (
                  artisan.categories.map(({ category }) => (
                    <Badge key={category.id} variant="outline">{category.name}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">Nenhuma categoria definida.</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
