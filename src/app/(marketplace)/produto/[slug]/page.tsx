import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, MapPin, ShieldCheck, Truck } from "lucide-react";
import { AddToCartButton } from "@/components/marketplace/add-to-cart-button";
import { ProductGallery } from "@/components/marketplace/product-gallery";
import { ReviewList } from "@/components/marketplace/review-list";
import { ProductCard } from "@/components/marketplace/product-card";
import { ContactArtisanButton } from "@/components/marketplace/contact-artisan-button";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug, status: "ACTIVE" },
    include: {
      images: { orderBy: { order: "asc" } },
      category: true,
      artisan: {
        include: {
          user: { select: { id: true, name: true } },
          subscription: true,
        },
      },
      reviews: {
        where: { published: true },
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

async function getRelatedProducts(slug: string, categoryId: string | null, artisanId: string) {
  return prisma.product.findMany({
    where: {
      status: "ACTIVE",
      slug: { not: slug },
      OR: [{ categoryId }, { artisanId }],
    },
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
      artisan: { select: { storeName: true, slug: true } },
    },
    take: 4,
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });
  return {
    title: product?.name ?? "Produto",
    description: product?.description ?? undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, session] = await Promise.all([getProduct(slug), auth()]);
  if (!product) notFound();

  const related = await getRelatedProducts(slug, product.categoryId, product.artisanId);
  const discount = product.comparePrice
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span>/</span>
        <Link href="/produtos" className="hover:text-primary">Produtos</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/categorias/${product.category.slug}`} className="hover:text-primary">
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-foreground truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* Gallery */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div>
            <Link
              href={`/artesao/${product.artisan.slug}`}
              className="text-sm text-amber-600 hover:underline font-medium"
            >
              {product.artisan.storeName}
            </Link>
            <h1 className="text-2xl font-bold text-neutral-900 mt-1">{product.name}</h1>
          </div>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${
                      i < Math.round(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-neutral-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating.toFixed(1)} ({product.reviews.length} avaliações)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-neutral-900">
              {formatCurrency(product.price)}
            </span>
            {product.comparePrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatCurrency(product.comparePrice)}
              </span>
            )}
            {discount && (
              <Badge className="bg-green-500 hover:bg-green-500">-{discount}%</Badge>
            )}
          </div>

          {/* Stock */}
          <div>
            {product.stock > 0 ? (
              <span className="text-sm text-green-600 font-medium">
                ✓ {product.stock} disponível{product.stock > 1 ? "is" : ""}
              </span>
            ) : (
              <Badge variant="destructive">Esgotado</Badge>
            )}
          </div>

          {/* Add to cart */}
          <AddToCartButton product={product} />

          {/* Chat with artisan */}
          <ContactArtisanButton
            artisanUserId={product.artisan.user.id}
            artisanName={product.artisan.storeName}
            isLoggedIn={!!session?.user}
          />

          <Separator />

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          )}

          {/* Materials */}
          {(() => {
            const materials: string[] = product.materials;
            return materials.length > 0 ? (
              <div>
                <p className="text-sm font-medium text-neutral-700 mb-1">Materiais:</p>
                <div className="flex flex-wrap gap-1.5">
                  {materials.map((mat) => (
                    <Badge key={mat} variant="outline" className="text-xs">{mat}</Badge>
                  ))}
                </div>
              </div>
            ) : null;
          })()}

          {/* Description */}
          {product.description && (
            <div>
              <p className="text-sm font-medium text-neutral-700 mb-1">Descrição</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Story */}
          {product.story && (
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
              <p className="text-sm font-medium text-amber-800 mb-1">✦ A história desta peça</p>
              <p className="text-sm text-amber-700 leading-relaxed">{product.story}</p>
            </div>
          )}

          <Separator />

          {/* Guarantees */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: ShieldCheck, text: "Produto verificado" },
              { icon: Truck, text: "Entrega pelo artesão" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="size-4 text-amber-600" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* Artisan mini card */}
          <div className="border border-border rounded-lg p-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Vendido por</p>
              <Link
                href={`/artesao/${product.artisan.slug}`}
                className="font-medium text-neutral-900 hover:text-primary truncate block"
              >
                {product.artisan.storeName}
              </Link>
              {product.artisan.city && (
                <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  <span>{[product.artisan.city, product.artisan.state].filter(Boolean).join(", ")}</span>
                </div>
              )}
            </div>
            <Link
              href={`/artesao/${product.artisan.slug}`}
              className="text-sm text-primary hover:underline shrink-0"
            >
              Ver loja →
            </Link>
          </div>
        </div>
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-6">Avaliações</h2>
          <ReviewList reviews={product.reviews} />
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-bold mb-6">Você também pode gostar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
