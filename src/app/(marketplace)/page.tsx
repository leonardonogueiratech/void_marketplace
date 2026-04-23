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
      {/* ── Hero — navy escuro, tom de autoridade e confiança ─────────────── */}
      <section className="relative bg-[#1e3a5f] py-24 md:py-36 overflow-hidden">
        {/* Textura de pontos suave */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #f7f3ed 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        {/* Blobs decorativos */}
        <div className="absolute right-0 top-0 w-1/2 h-full pointer-events-none overflow-hidden">
          <div className="absolute -right-24 -top-24 w-[480px] h-[480px] rounded-full bg-[#4a7c3f]/15" />
          <div className="absolute right-16 bottom-8 w-72 h-72 rounded-full bg-[#e07b2a]/10" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <Badge className="mb-5 bg-[#4a7c3f]/25 text-[#a8d5a2] border-[#4a7c3f]/40">
              Marketplace de Artesanato Brasileiro
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4 text-[#f7f3ed]">
              Cada peça carrega
              <br />
              <span className="text-[#e07b2a]">uma vida inteira.</span>
            </h1>
            <p className="text-xl text-[#f7f3ed]/85 font-medium mb-3 leading-snug">
              Do artesanal para o digital — conectando talento a oportunidades sem fronteiras
            </p>
            <p className="text-base text-[#f7f3ed]/55 mb-10 leading-relaxed max-w-lg">
              Aqui você encontra o que as prateleiras dos shoppings nunca terão: arte feita à mão,
              com intenção, por pessoas reais espalhadas pelo Brasil.
            </p>
            <div className="flex flex-wrap gap-3">
              {/* CTA primário: âmbar — energia, ação */}
              <Button
                size="lg"
                asChild
                className="bg-[#e07b2a] hover:bg-[#c96a1e] text-white font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                <Link href="/produtos">
                  Explorar Produtos <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              {/* CTA secundário: outline creme */}
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-[#f7f3ed] text-[#f7f3ed] bg-transparent hover:bg-[#f7f3ed] hover:text-[#1e3a5f] font-semibold transition-all duration-200 hover:scale-105"
              >
                <Link href="/seja-artesao">Quero Vender Aqui</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats — creme com números em cor, sem peso extra após hero ────── */}
      <section className="bg-[#f7f3ed] border-b border-[#1e3a5f]/8 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Users,       color: "#4a7c3f", label: "Artesãos ativos",      value: totalArtisans > 0 ? `${totalArtisans}+` : "Em breve" },
              { icon: Package,     color: "#1e3a5f", label: "Produtos disponíveis", value: totalProducts > 0 ? `${totalProducts}+` : "Em breve" },
              { icon: MapPin,      color: "#e07b2a", label: "Estados do Brasil",    value: "Todo BR" },
              { icon: ShieldCheck, color: "#4a7c3f", label: "Compra garantida",     value: "100%" },
            ].map(({ icon: Icon, color, label, value }) => (
              <div key={label} className="flex flex-col items-center gap-1 py-2">
                <Icon className="size-5 mb-1" style={{ color }} />
                <span className="text-2xl font-bold" style={{ color }}>{value}</span>
                <span className="text-xs text-neutral-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Missão / Visão / Valores — creme aquecido, respiro visual ─────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            {/* Linha decorativa verde */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-12 bg-[#4a7c3f]/40" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#4a7c3f]">Nossa essência</span>
              <div className="h-px w-12 bg-[#4a7c3f]/40" />
            </div>
            <h2 className="text-3xl font-bold text-[#1e3a5f]">Quem Somos</h2>
            <p className="text-neutral-500 mt-2 max-w-md mx-auto">
              Não é só uma loja virtual. É infraestrutura para um setor que já existe,
              já vende, e estava esperando por uma vitrine à altura do seu talento.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: Heart,
                accent: "#e07b2a",
                title: "Missão",
                desc: "Democratizar o acesso ao mercado para artesãos brasileiros, oferecendo uma plataforma digital que valoriza o trabalho manual, a criatividade e a cultura local — conectando cada peça a quem realmente aprecia sua história.",
              },
              {
                icon: Star,
                accent: "#1e3a5f",
                title: "Visão",
                desc: "Ser a maior vitrine de artesanato autêntico do Brasil, reconhecida por transformar talentos locais em negócios sustentáveis e por levar a riqueza cultural artesanal para além das feiras e fronteiras regionais.",
              },
              {
                icon: Leaf,
                accent: "#4a7c3f",
                title: "Valores",
                desc: "Autenticidade no que é feito à mão. Sustentabilidade nos materiais e nas práticas. Inclusão para todos os artesãos, independente de região. Transparência em cada transação.",
              },
            ].map(({ icon: Icon, accent, title, desc }) => (
              <div
                key={title}
                className="bg-[#f7f3ed] rounded-2xl p-7 flex flex-col gap-4 border border-transparent hover:border-[#1e3a5f]/10 hover:shadow-md transition-all"
                style={{ borderTop: `3px solid ${accent}` }}
              >
                <div className="size-11 rounded-xl flex items-center justify-center" style={{ background: `${accent}18` }}>
                  <Icon className="size-5" style={{ color: accent }} />
                </div>
                <h3 className="text-lg font-bold text-[#1e3a5f]">{title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories — fundo verde suave, não sólido ────────────────────── */}
      <section className="py-16 bg-[#eef5ec]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#4a7c3f] mb-1">Navegue</p>
              <h2 className="text-2xl font-bold text-[#1e3a5f]">Categorias</h2>
            </div>
            <Button variant="ghost" asChild className="text-[#4a7c3f] hover:text-[#3a6230] hover:bg-[#4a7c3f]/10">
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
            <div className="rounded-2xl border border-dashed border-[#4a7c3f]/30 bg-white py-14 text-center px-6">
              <Package className="size-10 text-[#4a7c3f]/30 mx-auto mb-3" />
              <p className="font-medium text-[#1e3a5f]">Categorias em cadastro</p>
              <p className="text-sm text-neutral-400 mt-1">Em breve você poderá navegar por tema e técnica artesanal.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Featured Products — branco limpo, foco no produto ────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#e07b2a] mb-1">Selecionados</p>
              <h2 className="text-2xl font-bold text-[#1e3a5f]">Produtos em Destaque</h2>
            </div>
            <Button variant="ghost" asChild className="text-[#1e3a5f] hover:text-[#1e3a5f]/70 hover:bg-[#1e3a5f]/5">
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
            <div className="rounded-2xl border border-dashed border-[#e07b2a]/30 bg-[#fff8f2] py-14 text-center px-6">
              <Package className="size-10 text-[#e07b2a]/40 mx-auto mb-3" />
              <p className="font-medium text-[#1e3a5f]">Primeiros produtos chegando em breve</p>
              <p className="text-sm text-neutral-400 mt-1 mb-5">Seja um dos primeiros artesãos a expor sua obra aqui.</p>
              <Button asChild size="sm" className="bg-[#e07b2a] hover:bg-[#c96a1e] text-white">
                <Link href="/seja-artesao">Quero vender aqui</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── Featured Artisans — creme, volta ao tom artesanal ────────────── */}
      <section className="py-16 bg-[#f7f3ed]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#1e3a5f] mb-1">Comunidade</p>
              <h2 className="text-2xl font-bold text-[#1e3a5f]">Artesãos em Destaque</h2>
            </div>
            <Button variant="ghost" asChild className="text-[#1e3a5f] hover:text-[#1e3a5f]/70 hover:bg-[#1e3a5f]/5">
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
              <Users className="size-10 text-[#1e3a5f]/20 mx-auto mb-3" />
              <p className="font-medium text-[#1e3a5f]">Artesãos se cadastrando</p>
              <p className="text-sm text-neutral-400 mt-1 mb-5">Nossa comunidade está crescendo. Faça parte da primeira leva.</p>
              <Button asChild size="sm" className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white">
                <Link href="/seja-artesao">Cadastrar minha loja</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA final — verde, contraste com o navy do hero ──────────────── */}
      <section className="py-20 bg-[#4a7c3f] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #f7f3ed 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-5 bg-[#f7f3ed]/15 text-[#f7f3ed]/80 border-[#f7f3ed]/20">
            Para artesãos
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-[#f7f3ed] mb-4">
            Sua arte merece mais do que
            <br />
            <span className="text-[#e07b2a]">uma barraca de feira.</span>
          </h2>
          <p className="text-[#f7f3ed]/65 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Você nasceu para criar — não para lidar com frete, algoritmo e câmera de celular às duas da manhã.
            Abra sua vitrine. O Brasil está esperando para te descobrir.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" asChild className="bg-[#e07b2a] hover:bg-[#c96a1e] text-white font-semibold shadow-lg hover:scale-105 transition-all">
              <Link href="/seja-artesao">
                Começar gratuitamente <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-[#f7f3ed]/40 text-[#f7f3ed] hover:bg-[#f7f3ed]/10">
              <Link href="/planos">Ver planos</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
