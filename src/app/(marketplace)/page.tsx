import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/marketplace/product-card";
import { ArtisanCard } from "@/components/marketplace/artisan-card";
import { CategoryCard } from "@/components/marketplace/category-card";
import { ArrowRight, Leaf, Heart, Star, Package, Users, MapPin, ShieldCheck } from "lucide-react";

async function getHomeData() {
  const [products, artisans, categories, totalArtisans, totalProducts] = await Promise.all([
    prisma.product.findMany({
      where: { status: "ACTIVE", featured: true },
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        artisan: { select: { storeName: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.artisanProfile.findMany({
      where: { status: "APPROVED", featured: true },
      include: { user: { select: { name: true } } },
      take: 6,
    }),
    prisma.category.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
      take: 8,
    }),
    prisma.artisanProfile.count({ where: { status: "APPROVED" } }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
  ]);

  return { products, artisans, categories, totalArtisans, totalProducts };
}

export default async function HomePage() {
  const { products, artisans, categories, totalArtisans, totalProducts } = await getHomeData();

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-[#2e5a2a] via-[#4a7c3f] to-[#3a6b35] py-24 md:py-36 overflow-hidden">
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #f7f3ed 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Badge className="mb-5 bg-[#f7f3ed]/15 text-[#f7f3ed] border-[#f7f3ed]/30 hover:bg-[#f7f3ed]/20">
              Marketplace de Artesanato Brasileiro
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4 text-[#f7f3ed]">
              Do Artesanal
              <br />
              <span className="text-[#e07b2a]">para o Digital</span>
            </h1>
            <p className="text-xl text-[#f7f3ed]/90 font-medium mb-3 leading-snug">
              Conectando talento a oportunidades sem fronteiras
            </p>
            <p className="text-base text-[#f7f3ed]/65 mb-10 leading-relaxed max-w-lg">
              Descubra produtos artesanais feitos à mão por artesãos brasileiros.
              Consumo consciente, afetivo e sustentável — direto de quem faz.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild className="bg-[#e07b2a] hover:bg-[#c96a1e] text-white font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl">
                <Link href="/produtos">
                  Explorar Produtos <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild
                className="border-[#f7f3ed] text-[#f7f3ed] bg-transparent hover:bg-[#f7f3ed] hover:text-[#1e3a5f] font-semibold transition-all duration-200 hover:scale-105">
                <Link href="/seja-artesao">Quero Vender Aqui</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative blob */}
        <div className="absolute right-0 top-0 w-1/2 h-full pointer-events-none overflow-hidden">
          <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-[#f7f3ed]/5" />
          <div className="absolute right-20 bottom-10 w-64 h-64 rounded-full bg-[#e07b2a]/10" />
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <section className="bg-[#1e3a5f] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Users, label: "Artesãos ativos", value: totalArtisans > 0 ? `${totalArtisans}+` : "Em breve" },
              { icon: Package, label: "Produtos disponíveis", value: totalProducts > 0 ? `${totalProducts}+` : "Em breve" },
              { icon: MapPin, label: "Estados do Brasil", value: "Todo BR" },
              { icon: ShieldCheck, label: "Compra garantida", value: "100%" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <Icon className="size-5 text-[#e07b2a] mb-1" />
                <span className="text-xl font-bold text-[#f7f3ed]">{value}</span>
                <span className="text-xs text-[#f7f3ed]/55">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Missão / Visão / Valores ───────────────────────────────────────── */}
      <section className="py-20 bg-[#4a7c3f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#f7f3ed]">Quem Somos</h2>
            <p className="text-[#f7f3ed]/65 mt-2">O propósito que guia cada decisão da plataforma</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: Heart,
                title: "Missão",
                desc: "Democratizar o acesso ao mercado para artesãos brasileiros, oferecendo uma plataforma digital que valoriza o trabalho manual, a criatividade e a cultura local — conectando cada peça a quem realmente aprecia sua história.",
              },
              {
                icon: Star,
                title: "Visão",
                desc: "Ser a maior vitrine de artesanato autêntico do Brasil, reconhecida por transformar talentos locais em negócios sustentáveis e por levar a riqueza cultural artesanal para além das feiras e fronteiras regionais.",
              },
              {
                icon: Leaf,
                title: "Valores",
                desc: "Autenticidade no que é feito à mão. Sustentabilidade nos materiais e nas práticas. Inclusão para todos os artesãos, independente de região. Transparência em cada transação.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-[#f7f3ed] rounded-2xl p-7 flex flex-col gap-4 shadow-lg">
                <div className="size-12 rounded-full bg-[#4a7c3f]/12 flex items-center justify-center">
                  <Icon className="size-6 text-[#4a7c3f]" />
                </div>
                <h3 className="text-lg font-bold text-[#1e3a5f]">{title}</h3>
                <p className="text-sm text-neutral-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────── */}
      <section className="py-16 bg-[#f7f3ed]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1e3a5f]">Categorias</h2>
              <p className="text-muted-foreground mt-1">Explore por tipo de produto</p>
            </div>
            <Button variant="ghost" asChild className="text-[#1e3a5f] hover:text-[#1e3a5f]/80">
              <Link href="/categorias">
                Ver todas <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {categories.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#1e3a5f]/20 bg-white py-14 text-center px-6">
              <Package className="size-10 text-[#4a7c3f]/40 mx-auto mb-3" />
              <p className="font-medium text-[#1e3a5f]">Categorias em cadastro</p>
              <p className="text-sm text-muted-foreground mt-1">Em breve você poderá navegar por tema e técnica artesanal.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1e3a5f]">Produtos em Destaque</h2>
              <p className="text-muted-foreground mt-1">Selecionados pelos nossos artesãos</p>
            </div>
            <Button variant="ghost" asChild className="text-[#1e3a5f] hover:text-[#1e3a5f]/80">
              <Link href="/produtos">
                Ver todos <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#1e3a5f]/20 bg-[#f7f3ed] py-14 text-center px-6">
              <Package className="size-10 text-[#4a7c3f]/40 mx-auto mb-3" />
              <p className="font-medium text-[#1e3a5f]">Primeiros produtos chegando em breve</p>
              <p className="text-sm text-muted-foreground mt-1 mb-5">Seja um dos primeiros artesãos a expor sua obra aqui.</p>
              <Button asChild size="sm" className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white">
                <Link href="/seja-artesao">Quero vender aqui</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── Featured Artisans ─────────────────────────────────────────────── */}
      <section className="py-16 bg-[#f7f3ed]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1e3a5f]">Artesãos em Destaque</h2>
              <p className="text-muted-foreground mt-1">Conheça quem está por trás das peças</p>
            </div>
            <Button variant="ghost" asChild className="text-[#1e3a5f] hover:text-[#1e3a5f]/80">
              <Link href="/artesaos">
                Ver todos <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>

          {artisans.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {artisans.map((artisan) => (
                <ArtisanCard key={artisan.id} artisan={artisan} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#1e3a5f]/20 bg-white py-14 text-center px-6">
              <Users className="size-10 text-[#4a7c3f]/40 mx-auto mb-3" />
              <p className="font-medium text-[#1e3a5f]">Artesãos se cadastrando</p>
              <p className="text-sm text-muted-foreground mt-1 mb-5">Nossa comunidade está crescendo. Faça parte da primeira leva.</p>
              <Button asChild size="sm" className="bg-[#4a7c3f] hover:bg-[#3a6230] text-white">
                <Link href="/seja-artesao">Cadastrar minha loja</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA artesãos ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#1e3a5f]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-5 bg-[#f7f3ed]/10 text-[#f7f3ed]/80 border-[#f7f3ed]/20">
            Para artesãos
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-[#f7f3ed] mb-4">
            Você é artesão? <span className="text-[#e07b2a]">Venda aqui!</span>
          </h2>
          <p className="text-[#f7f3ed]/65 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Alcance clientes que valorizam o artesanato autêntico.
            Sem precisar investir em e-commerce próprio.
            Comece gratuitamente.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" asChild className="bg-[#f7f3ed] hover:bg-white text-[#1e3a5f] font-semibold shadow-lg">
              <Link href="/seja-artesao">
                Começar gratuitamente <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild
              className="border-[#f7f3ed]/30 text-[#f7f3ed] hover:bg-[#f7f3ed]/10">
              <Link href="/planos">Ver planos</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
