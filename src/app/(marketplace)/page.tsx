import Link from "next/link";
import Image from "next/image";
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
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-[#27ae60] via-[#1f9e58] to-[#17a2b8] overflow-hidden">
        {/* Textura de pontos */}
        <div
          className="absolute inset-0 opacity-[0.045] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #f7f3ed 1px, transparent 1px)", backgroundSize: "22px 22px" }}
        />
        {/* Blobs de fundo */}
        <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -left-16 bottom-16 w-64 h-64 rounded-full bg-[#1e3a5f]/10 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-28 pb-28 md:pb-36">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-center">

            {/* ── Texto ── */}
            <div>
              {/* Eyebrow */}
              <div className="flex items-center gap-2.5 mb-6">
                <div className="h-px w-8 bg-[#e07b2a]" />
                <span className="text-[#f7f3ed]/65 text-xs font-semibold uppercase tracking-[0.14em]">
                  Marketplace de Artesanato Brasileiro
                </span>
              </div>

              {/* Headline com contraste de peso */}
              <h1 className="mb-6">
                <span className="block text-5xl md:text-[3.75rem] font-black leading-[1.08] text-[#f7f3ed]">
                  Cada peça carrega
                </span>
                <span className="block text-5xl md:text-[3.75rem] font-black leading-[1.08] text-[#e07b2a]">
                  uma vida
                </span>
                <span className="block text-4xl md:text-[3.25rem] font-light leading-[1.15] text-[#f7f3ed]/80 tracking-wide mt-1">
                  inteira.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base text-[#f7f3ed]/60 mb-8 leading-relaxed max-w-[420px]">
                Arte feita à mão, com intenção, por pessoas reais espalhadas pelo Brasil.
                O que você encontra aqui nenhuma prateleira de shopping tem.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mb-10">
                <Button
                  size="lg"
                  asChild
                  className="bg-[#e07b2a] hover:bg-[#c96a1e] text-white font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
                >
                  <Link href="/produtos">
                    Explorar Produtos <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-[#f7f3ed]/70 text-[#f7f3ed] bg-white/10 hover:bg-white/20 hover:border-white font-semibold transition-all duration-200"
                >
                  <Link href="/seja-artesao">Quero Vender Aqui</Link>
                </Button>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-5 flex-wrap">
                {artisans.length > 0 && (
                  <div className="flex items-center gap-2.5">
                    <div className="flex -space-x-2.5">
                      {artisans.slice(0, 4).map((a) => (
                        <div
                          key={a.id}
                          className="size-8 rounded-full border-2 border-[#1f9e58] bg-[#1e3a5f] flex items-center justify-center flex-shrink-0 overflow-hidden"
                        >
                          {a.logoImage ? (
                            <Image
                              src={a.logoImage}
                              alt={a.storeName}
                              width={32}
                              height={32}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <span className="text-white text-[10px] font-bold">
                              {a.storeName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <span className="text-[#f7f3ed]/65 text-sm">
                      <strong className="text-[#f7f3ed]">
                        {totalArtisans > 0 ? `${totalArtisans}+` : "Vários"}
                      </strong>{" "}
                      artesãos verificados
                    </span>
                  </div>
                )}
                <div className="h-4 w-px bg-white/20 hidden sm:block" />
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="size-3 fill-[#e07b2a] text-[#e07b2a]" />
                    ))}
                  </div>
                  <span className="text-[#f7f3ed]/50 text-xs">Produtos 100% artesanais</span>
                </div>
              </div>
            </div>

            {/* ── Mosaico editorial ── */}
            {products.length >= 2 && (
              <div className="hidden lg:flex gap-3 items-center shrink-0 relative">
                {/* Card grande — portrait */}
                <Link
                  href={`/produto/${products[0].slug}`}
                  className="group relative w-52 h-[300px] rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/20 hover:ring-white/45 hover:scale-[1.02] transition-all duration-300 flex-shrink-0 block"
                >
                  {products[0].images[0] ? (
                    <Image
                      src={products[0].images[0].url}
                      alt={products[0].name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="208px"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1e3a5f] to-[#27ae60]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-4">
                    <p className="text-white text-xs font-semibold leading-snug line-clamp-2">{products[0].name}</p>
                    <p className="text-white/55 text-[10px] mt-0.5 truncate">{products[0].artisan.storeName}</p>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-[#e07b2a] text-white px-2 py-0.5 rounded-full shadow">
                      ✦ Feito à mão
                    </span>
                  </div>
                </Link>

                {/* Coluna com 2 cards menores + floating badge */}
                <div className="relative flex flex-col gap-3 mt-14">
                  {[products[1], products[2]].filter(Boolean).map((p, idx) => (
                    <Link
                      key={p.id}
                      href={`/produto/${p.slug}`}
                      className="group relative w-40 h-[136px] rounded-2xl overflow-hidden shadow-xl ring-2 ring-white/15 hover:ring-white/40 hover:scale-[1.02] transition-all duration-300 flex-shrink-0 block"
                    >
                      {p.images[0] ? (
                        <Image
                          src={p.images[0].url}
                          alt={p.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                          sizes="160px"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${idx === 0 ? "from-[#27ae60] to-[#17a2b8]" : "from-[#e07b2a] to-[#1e3a5f]"}`} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                      <div className="absolute bottom-0 inset-x-0 p-2.5">
                        <p className="text-white text-[10px] font-semibold leading-tight line-clamp-2">{p.name}</p>
                      </div>
                    </Link>
                  ))}

                  {/* Floating trust badge */}
                  <div className="absolute -left-14 -bottom-4 bg-white rounded-xl shadow-2xl px-3 py-2 flex items-center gap-2 z-10">
                    <div className="size-7 rounded-lg bg-[#27ae60]/10 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="size-4 text-[#27ae60]" />
                    </div>
                    <div className="leading-none">
                      <p className="text-[10px] font-bold text-[#1e3a5f]">Compra Verificada</p>
                      <p className="text-[9px] text-neutral-400 mt-0.5">Artesãos autênticos</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Wave separator — transição suave para a seção de stats */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none leading-none">
          <svg
            viewBox="0 0 1440 64"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            style={{ display: "block", width: "100%", height: "64px" }}
          >
            <path d="M0,64 C480,8 960,8 1440,64 L1440,64 L0,64Z" fill="#f7f3ed" />
          </svg>
        </div>
      </section>

      {/* ── Stats — creme com números em cor, sem peso extra após hero ────── */}
      <section className="bg-[#f7f3ed] border-b border-[#1e3a5f]/8 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: Users,       color: "#27ae60", label: "Artesãos ativos",      value: totalArtisans > 0 ? `${totalArtisans}+` : "Em breve" },
              { icon: Package,     color: "#1e3a5f", label: "Produtos disponíveis", value: totalProducts > 0 ? `${totalProducts}+` : "Em breve" },
              { icon: MapPin,      color: "#e07b2a", label: "Estados do Brasil",    value: "Todo BR" },
              { icon: ShieldCheck, color: "#27ae60", label: "Compra garantida",     value: "100%" },
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
              <div className="h-px w-12 bg-[#27ae60]/40" />
              <span className="text-xs font-semibold uppercase tracking-widest text-[#27ae60]">Nossa essência</span>
              <div className="h-px w-12 bg-[#27ae60]/40" />
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
                accent: "#27ae60",
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
              <p className="text-xs font-semibold uppercase tracking-widest text-[#27ae60] mb-1">Navegue</p>
              <h2 className="text-2xl font-bold text-[#1e3a5f]">Categorias</h2>
            </div>
            <Button variant="ghost" asChild className="text-[#27ae60] hover:text-[#1e9150] hover:bg-[#27ae60]/10">
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
            <div className="rounded-2xl border border-dashed border-[#27ae60]/30 bg-white py-14 text-center px-6">
              <Package className="size-10 text-[#27ae60]/30 mx-auto mb-3" />
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
      <section className="py-20 bg-gradient-to-r from-[#27ae60] to-[#17a2b8] relative overflow-hidden">
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
            <Button size="lg" variant="outline" asChild className="border-[#f7f3ed]/70 text-[#f7f3ed] bg-white/10 hover:bg-white/20 hover:border-white">
              <Link href="/planos">Ver planos</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
