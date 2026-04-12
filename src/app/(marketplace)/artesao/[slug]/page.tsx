import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/marketplace/product-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, MessageCircle, ExternalLink } from "lucide-react";
import { getInitials } from "@/lib/utils";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getArtisan(slug: string) {
  return prisma.artisanProfile.findUnique({
    where: { slug, status: "APPROVED" },
    include: {
      user: { select: { name: true } },
      categories: { include: { category: true } },
      products: {
        where: { status: "ACTIVE" },
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
          artisan: { select: { storeName: true, slug: true } },
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      },
      reviews: {
        where: { published: true },
        include: { user: { select: { name: true, image: true } } },
        take: 5,
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artisan = await prisma.artisanProfile.findUnique({
    where: { slug },
    select: { storeName: true, bio: true },
  });
  return { title: artisan?.storeName ?? "Artesão", description: artisan?.bio ?? undefined };
}

export default async function ArtisanPage({ params }: Props) {
  const { slug } = await params;
  const artisan = await getArtisan(slug);
  if (!artisan) notFound();

  return (
    <div>
      {/* Banner */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-amber-100 to-orange-100 overflow-hidden">
        {artisan.bannerImage && (
          <Image
            src={artisan.bannerImage}
            alt={artisan.storeName}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile header */}
        <div className="relative -mt-16 mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <Avatar className="size-28 border-4 border-white shadow-lg">
            <AvatarImage src={artisan.logoImage ?? undefined} />
            <AvatarFallback className="text-2xl bg-amber-100 text-amber-700">
              {getInitials(artisan.storeName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-neutral-900">{artisan.storeName}</h1>
              {artisan.featured && (
                <Badge className="bg-amber-500 hover:bg-amber-500">✦ Destaque</Badge>
              )}
            </div>
            {(artisan.city || artisan.state) && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="size-4" />
                <span>{[artisan.city, artisan.state].filter(Boolean).join(", ")}</span>
              </div>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {artisan.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <span>{artisan.rating.toFixed(1)}</span>
                </div>
              )}
              <span>{artisan.products.length} produtos</span>
              {artisan.totalSales > 0 && <span>{artisan.totalSales} vendas</span>}
            </div>
          </div>

          {/* Social links */}
          <div className="flex gap-2">
            {artisan.whatsapp && (
              <Button size="sm" variant="outline" asChild>
                <a href={`https://wa.me/${artisan.whatsapp}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4 mr-1.5" /> WhatsApp
                </a>
              </Button>
            )}
            {artisan.instagram && (
              <Button size="sm" variant="outline" asChild>
                <a href={`https://instagram.com/${artisan.instagram}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1.5 size-4" /> Instagram
                </a>
              </Button>
            )}
            {artisan.website && (
              <Button size="sm" variant="outline" asChild>
                <a href={artisan.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" />
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-16">
          <aside className="lg:col-span-1">
            {artisan.bio && (
              <div className="mb-6">
                <h3 className="font-semibold text-neutral-900 mb-2">Sobre</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{artisan.bio}</p>
              </div>
            )}
            {artisan.story && (
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-100 mb-6">
                <p className="text-xs font-semibold text-amber-700 mb-1">✦ Nossa história</p>
                <p className="text-sm text-amber-700 leading-relaxed">{artisan.story}</p>
              </div>
            )}
            {artisan.categories.length > 0 && (
              <div>
                <h3 className="font-semibold text-neutral-900 mb-2">Categorias</h3>
                <div className="flex flex-wrap gap-1.5">
                  {artisan.categories.map(({ category }) => (
                    <Badge key={category.id} variant="secondary">{category.name}</Badge>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <main className="lg:col-span-3">
            <h2 className="text-xl font-bold mb-6">
              Produtos ({artisan.products.length})
            </h2>
            {artisan.products.length === 0 ? (
              <p className="text-muted-foreground">Nenhum produto disponível no momento.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {artisan.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
