import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/marketplace/product-card";
import { ArtisanCard } from "@/components/marketplace/artisan-card";
import { CategoryCard } from "@/components/marketplace/category-card";
import { ArrowRight, Hand, BookHeart, MapPinned, Users2, Star, Package, Leaf } from "lucide-react";

async function getHomeData() {
  const [products, artisans, categories, totalArtisans] = await Promise.all([
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
  ]);

  return { products, artisans, categories, totalArtisans };
}

// Sem isso, a página fica com cache estático indefinido (gerada uma vez no
// build) e nunca reflete mudanças de "featured" — plano do artesão, novos
// produtos aprovados, etc.
export const revalidate = 300;

const FEITO_DE = [
  { icon: Hand,      label: "Feito à mão",       desc: "Peças únicas, feitas com tempo, cuidado e intenção." },
  { icon: BookHeart, label: "Feito de histórias", desc: "Cada produto carrega uma história real de quem faz." },
  { icon: MapPinned, label: "Feito no Brasil",    desc: "Artesãos de todo o país, valorizando nossas origens." },
  { icon: Users2,    label: "Feito de Gente",     desc: "Conectamos quem cria com quem valoriza o real." },
];

export default async function HomePage() {
  const { products, artisans, categories, totalArtisans } = await getHomeData();
  const processPhotos = [...products, ...artisans.map((a) => ({ id: a.id, images: a.logoImage ? [{ url: a.logoImage }] : [] }))]
    .filter((p) => p.images[0]?.url)
    .slice(0, 4);

  return (
    <div className="bg-brand-cream">
      {/* ── Hero — fundo claro, textura de papel, mosaico editorial ───────── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #071a33 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />
        <span className="hidden md:block absolute top-10 left-[8%] text-brand-mustard text-3xl select-none pointer-events-none" aria-hidden>✦</span>
        <span className="hidden md:block absolute bottom-24 left-[3%] text-brand-terracota text-xl select-none pointer-events-none" aria-hidden>✳</span>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 pb-20 md:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* ── Texto ── */}
            <div>
              <div className="flex items-center gap-2.5 mb-6">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-navy/50">
                  Marketplace de Artesanato Brasileiro
                </span>
              </div>

              <h1 className="mb-6">
                <span className="block text-4xl md:text-5xl lg:text-[3.4rem] font-bold uppercase leading-[1.08] text-brand-navy">
                  Cada peça carrega
                </span>
                <span className="relative inline-block text-4xl md:text-5xl lg:text-[3.4rem] font-bold uppercase leading-[1.08] text-brand-green mt-1">
                  uma vida inteira.
                  <svg className="absolute left-0 -bottom-2 w-full" height="10" viewBox="0 0 300 10" preserveAspectRatio="none" aria-hidden>
                    <path d="M2,6 Q40,2 80,6 T160,6 T240,6 T298,6" fill="none" stroke="#c1652e" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>

              <p className="text-base text-brand-navy/60 mb-8 leading-relaxed max-w-[440px]">
                Arte feita à mão, com intenção, por pessoas reais espalhadas pelo Brasil.
                O que você encontra aqui nenhuma prateleira de shopping tem.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Button
                  size="lg"
                  asChild
                  className="bg-brand-navy hover:bg-[#051224] text-white font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
                >
                  <Link href="/produtos">
                    Explorar produtos <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-brand-navy/25 text-brand-navy bg-transparent hover:bg-brand-navy/5 font-semibold transition-all duration-200"
                >
                  <Link href="/seja-artesao">Quero vender aqui</Link>
                </Button>
              </div>

              <div className="flex items-center gap-5 flex-wrap">
                {artisans.length > 0 && (
                  <div className="flex items-center gap-2.5">
                    <div className="size-6 rounded-full bg-brand-green/12 flex items-center justify-center shrink-0">
                      <Leaf className="size-3.5 text-brand-green" />
                    </div>
                    <div className="flex -space-x-2.5">
                      {artisans.slice(0, 4).map((a) => (
                        <div
                          key={a.id}
                          className="size-8 rounded-full border-2 border-brand-cream bg-brand-navy flex items-center justify-center flex-shrink-0 overflow-hidden"
                        >
                          {a.logoImage ? (
                            <Image src={a.logoImage} alt={a.storeName} width={32} height={32} className="object-cover w-full h-full" />
                          ) : (
                            <span className="text-white text-[10px] font-bold">{a.storeName.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <span className="text-brand-navy/60 text-sm">
                      <strong className="text-brand-navy">{totalArtisans > 0 ? `${totalArtisans}+` : "Vários"}</strong>{" "}
                      artesãos verificados
                    </span>
                  </div>
                )}
                <div className="h-4 w-px bg-brand-navy/15 hidden sm:block" />
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="size-3 fill-brand-mustard text-brand-mustard" />
                    ))}
                  </div>
                  <span className="text-brand-navy/45 text-xs">Produtos 100% artesanais</span>
                </div>
              </div>
            </div>

            {/* ── Foto editorial + selo ── */}
            {products[0]?.images[0] && (
              <div className="relative">
                <div className="relative aspect-[4/3.2] rounded-[2rem] overflow-hidden shadow-xl">
                  <Image
                    src={products[0].images[0].url}
                    alt={products[0].name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 90vw, 45vw"
                    priority
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 size-24 rounded-full bg-white shadow-lg border-2 border-dashed border-brand-navy/20 flex flex-col items-center justify-center text-center p-2">
                  <span className="text-brand-mustard text-sm leading-none mb-0.5">✦</span>
                  <span className="font-hand text-brand-navy text-[13px] leading-tight font-semibold">
                    Feito à mão<br />com história
                  </span>
                </div>
                <svg className="hidden md:block absolute -right-8 -top-6 w-16 h-16 text-brand-navy/25" viewBox="0 0 60 60" fill="none" aria-hidden>
                  <path d="M4,30 C4,15 20,4 34,10 C48,16 52,34 40,44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M34,38 L40,44 L46,36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Peças com história — grade de produtos, papel claro ───────────── */}
      <section className="py-16 md:py-20 bg-white border-y border-brand-navy/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
            <h2 className="text-2xl md:text-3xl font-bold uppercase text-brand-navy">
              Peças com história, <span className="text-brand-green">feitas por gente</span>.
            </h2>
            <Button variant="ghost" asChild className="text-brand-navy hover:text-brand-navy/70 hover:bg-brand-navy/5">
              <Link href="/produtos">
                Ver todos os produtos <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {products.slice(0, 5).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-brand-terracota/30 bg-brand-terracota/5 py-14 text-center px-6">
              <Package className="size-10 text-brand-terracota/40 mx-auto mb-3" />
              <p className="font-medium text-brand-navy">Primeiros produtos chegando em breve</p>
              <p className="text-sm text-neutral-400 mt-1 mb-5">Seja um dos primeiros artesãos a expor sua obra aqui.</p>
              <Button asChild size="sm" className="bg-brand-terracota hover:bg-[#9a5125] text-white">
                <Link href="/seja-artesao">Quero vender aqui</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── "Feito de..." — 4 valores, selo à direita ─────────────────────── */}
      <section className="py-14 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8 flex-wrap">
            <div className="flex-1 min-w-[260px] grid grid-cols-2 sm:grid-cols-4 gap-6">
              {FEITO_DE.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex flex-col items-start gap-2">
                  <div className="size-10 rounded-full bg-white border border-brand-navy/10 flex items-center justify-center">
                    <Icon className="size-4.5 text-brand-green" />
                  </div>
                  <p className="font-semibold text-sm text-brand-navy">{label}</p>
                  <p className="text-xs text-brand-navy/50 leading-snug">{desc}</p>
                </div>
              ))}
            </div>
            <div className="hidden lg:flex size-24 rounded-full border-2 border-dashed border-brand-navy/20 items-center justify-center text-center p-2 shrink-0">
              <span className="font-hand text-brand-navy text-sm font-semibold leading-tight">
                Eu conheço<br />quem fez
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categorias ──────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-green mb-1">Navegue</p>
              <h2 className="text-2xl font-bold text-brand-navy">Categorias</h2>
            </div>
            <Button variant="ghost" asChild className="text-brand-green hover:text-brand-green hover:bg-brand-green/10">
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
            <div className="rounded-2xl border border-dashed border-brand-green/30 bg-brand-cream py-14 text-center px-6">
              <Package className="size-10 text-brand-green/30 mx-auto mb-3" />
              <p className="font-medium text-brand-navy">Categorias em cadastro</p>
              <p className="text-sm text-neutral-400 mt-1">Em breve você poderá navegar por tema e técnica artesanal.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── Conheça quem faz — texto + mosaico de fotos ───────────────────── */}
      <section className="py-16 md:py-20 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold uppercase text-brand-navy leading-snug mb-3">
                Conheça quem faz, <span className="text-brand-terracota">valorize o que é real</span>.
              </h2>
              <p className="text-brand-navy/60 leading-relaxed mb-5 max-w-md">
                Aqui você encontra mais que produtos. Encontra pessoas, processos, detalhes
                e bastidores que fazem tudo isso ter valor.
              </p>
              <Button variant="ghost" asChild className="text-brand-navy hover:bg-brand-navy/5 px-0 hover:px-3">
                <Link href="/artesaos">
                  Conhecer artesãos <ArrowRight className="ml-1 size-4" />
                </Link>
              </Button>
            </div>
            {processPhotos.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {processPhotos.map((p) => (
                  <div key={p.id} className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-sm">
                    <Image src={p.images[0]!.url} alt="" fill className="object-cover" sizes="180px" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Artesãos em destaque ───────────────────────────────────────── */}
      {artisans.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-navy mb-1">Comunidade</p>
                <h2 className="text-2xl font-bold text-brand-navy">Artesãos em Destaque</h2>
              </div>
              <Button variant="ghost" asChild className="text-brand-navy hover:text-brand-navy/70 hover:bg-brand-navy/5">
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

      {/* ── Barra final — sólida, olive, direta ───────────────────────────── */}
      <section className="bg-brand-green py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-5">
          <p className="text-white font-bold uppercase tracking-wide text-lg flex items-center gap-2">
            <span className="text-brand-mustard" aria-hidden>✦</span> Feito por gente, para gente.
          </p>
          <Button asChild className="bg-brand-navy hover:bg-[#051224] text-white font-semibold rounded-full px-6">
            <Link href="/seja-artesao">
              Quero vender aqui <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
