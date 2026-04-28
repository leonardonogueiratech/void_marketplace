import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, AtSign, MapPin, MessageCircle, ExternalLink } from "lucide-react";
import { EditProfileForm } from "./edit-form";

export default async function DashboardProfilePage() {
  const session = await auth();

  const [artisan, allCategories] = await Promise.all([
    prisma.artisanProfile.findUnique({
      where: { userId: session!.user.id },
      include: {
        categories: { include: { category: true } },
        subscription: true,
        _count: { select: { products: { where: { status: "ACTIVE" } }, reviews: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!artisan) return null;

  const statusLabels: Record<string, string> = {
    APPROVED: "Ativo",
    PENDING: "Em análise",
    REJECTED: "Rejeitado",
    SUSPENDED: "Suspenso",
  };
  const statusColors: Record<string, string> = {
    APPROVED: "bg-[#27ae60]/10 text-[#27ae60] border-[#27ae60]/20",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    REJECTED: "bg-red-50 text-red-600 border-red-200",
    SUSPENDED: "bg-neutral-100 text-neutral-600 border-neutral-200",
  };

  return (
    <div className="space-y-8 max-w-3xl">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Perfil da loja</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Informações exibidas publicamente no marketplace.
          </p>
        </div>
        <Button variant="outline" asChild className="border-[#1e3a5f]/20 text-[#1e3a5f] hover:bg-[#1e3a5f]/5 self-start sm:self-auto">
          <Link href={`/artesao/${artisan.slug}`} target="_blank">
            <ExternalLink className="mr-2 size-4" /> Ver loja pública
          </Link>
        </Button>
      </div>

      {/* Preview card */}
      <Card className="overflow-hidden border-[#1e3a5f]/10 shadow-sm">
        <div className="relative h-36 bg-gradient-to-br from-[#e07b2a]/20 via-[#f7f3ed] to-[#27ae60]/15">
          {artisan.bannerImage && (
            <img
              src={artisan.bannerImage}
              alt={artisan.storeName}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </div>
        <CardContent className="relative pt-0 pb-5">
          <div className="-mt-9 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="size-[72px] shrink-0 flex items-center justify-center rounded-2xl border-4 border-white bg-[#1e3a5f] text-white text-xl font-bold shadow-sm overflow-hidden">
              {artisan.logoImage
                ? <img src={artisan.logoImage} alt={artisan.storeName} className="w-full h-full object-cover" />
                : artisan.storeName.slice(0, 2).toUpperCase()
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-[#1e3a5f]">{artisan.storeName}</h2>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColors[artisan.status] ?? statusColors.PENDING}`}>
                  {statusLabels[artisan.status] ?? artisan.status}
                </span>
                {artisan.featured && (
                  <Badge className="bg-[#e07b2a] hover:bg-[#e07b2a] text-white text-xs">Destaque</Badge>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">@{artisan.slug}</p>
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-[#1e3a5f]">{artisan._count.products}</p>
                <p className="text-xs text-neutral-400">produtos</p>
              </div>
              <div>
                <p className="text-lg font-bold text-[#1e3a5f]">{artisan._count.reviews}</p>
                <p className="text-xs text-neutral-400">avaliações</p>
              </div>
              <div>
                <p className="text-lg font-bold text-[#27ae60]">{artisan.subscription?.plan ?? "FREE"}</p>
                <p className="text-xs text-neutral-400">plano</p>
              </div>
            </div>
          </div>

          {artisan.bio && (
            <p className="mt-4 text-sm text-neutral-500 leading-relaxed line-clamp-2">{artisan.bio}</p>
          )}

          {(artisan.city || artisan.whatsapp || artisan.instagram || artisan.website) && (
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-neutral-400">
              {(artisan.city || artisan.state) && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3" />
                  {[artisan.city, artisan.state].filter(Boolean).join(", ")}
                </span>
              )}
              {artisan.whatsapp && (
                <span className="flex items-center gap-1">
                  <MessageCircle className="size-3" /> {artisan.whatsapp}
                </span>
              )}
              {artisan.instagram && (
                <span className="flex items-center gap-1">
                  <AtSign className="size-3" /> {artisan.instagram}
                </span>
              )}
              {artisan.website && (
                <span className="flex items-center gap-1">
                  <Globe className="size-3" /> {artisan.website}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit form */}
      <div>
        <h2 className="text-lg font-bold text-[#1e3a5f] mb-4">Editar perfil</h2>
        <EditProfileForm
          artisan={artisan}
          allCategories={allCategories}
        />
      </div>
    </div>
  );
}
