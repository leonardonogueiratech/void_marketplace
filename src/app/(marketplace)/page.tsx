import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/marketplace/product-card";
import { ArtisanCard } from "@/components/marketplace/artisan-card";
import { CategoryCard } from "@/components/marketplace/category-card";
import { ArrowRight, Leaf, Heart, Star } from "lucide-react";

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { status: "ACTIVE", featured: true },
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
      artisan: { select: { storeName: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
}

async function getFeaturedArtisans() {
  return prisma.artisanProfile.findMany({
    where: { status: "APPROVED", featured: true },
    include: { user: { select: { name: true } } },
    take: 6,
  });
}

async function getCategories() {
  return prisma.category.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    take: 8,
  });
}

export default async function HomePage() {
  const [products, artisans, categories] = await Promise.all([
    getFeaturedProducts(),
    getFeaturedArtisans(),
    getCategories(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#f7f3ed] via-[#eef4ee] to-[#e8f0f8] py-20 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Badge variant="secondary" className="mb-4 bg-green-100 text-green-800 border-green-200">
              Marketplace de Artesanato Brasileiro
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6" style={{ color: "#1e3a5f" }}>
              Cada peça conta
              <br />
              <span style={{ color: "#4a7c3f" }}>uma história única</span>
            </h1>
            <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
              Descubra produtos artesanais feitos à mão por artesãos brasileiros.
              Consumo consciente, afetivo e sustentável — direto de quem faz.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white">
                <Link href="/produtos">
                  Explorar Produtos <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white">
                <Link href="/seja-artesao">Venda Aqui</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative element */}
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-green-200 to-transparent" />
        </div>
      </section>

      {/* Values */}
      <section className="py-12 bg-white border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: Heart, title: "Feito à Mão", desc: "Cada produto tem identidade autoral única" },
              { icon: Leaf, title: "Sustentável", desc: "Materiais conscientes e produção responsável" },
              { icon: Star, title: "Autêntico", desc: "Diretamente de artesãos brasileiros" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center gap-3 p-4">
                <div className="size-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Icon className="size-6 text-[#4a7c3f]" />
                </div>
                <h3 className="font-semibold text-neutral-900">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-16 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">Categorias</h2>
                <p className="text-muted-foreground mt-1">Explore por tipo de produto</p>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/categorias">
                  Ver todas <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">Em Destaque</h2>
                <p className="text-muted-foreground mt-1">Produtos selecionados pelos nossos artesãos</p>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/produtos">
                  Ver todos <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Artisans */}
      {artisans.length > 0 && (
        <section className="py-16 bg-neutral-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900">Artesãos em Destaque</h2>
                <p className="text-muted-foreground mt-1">Conheça quem está por trás das peças</p>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/artesaos">
                  Ver todos <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {artisans.map((artisan) => (
                <ArtisanCard key={artisan.id} artisan={artisan} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA para artesãos */}
      <section className="py-20 bg-[#1e3a5f]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Você é artesão? Venda aqui!
          </h2>
          <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto">
            Alcance clientes que valorizam o artesanato autêntico.
            Sem precisar investir em e-commerce próprio.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/seja-artesao">
              Começar gratuitamente <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
