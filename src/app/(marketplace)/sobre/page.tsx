import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, HeartHandshake, Leaf, Store, Users, Sparkles, Globe, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Sobre — Feito de Gente",
  description: "Conheça a história e o propósito do Feito de Gente, o marketplace de artesanato brasileiro.",
};

const pillars = [
  {
    icon: HeartHandshake,
    color: "#e07b2a",
    title: "Feito por mãos. Entregue com alma.",
    description:
      "Cada peça nasce de um processo autoral — com tempo, técnica e história que nenhuma máquina consegue imitar. Aqui, imperfeição não é defeito: é o que torna algo absolutamente único.",
  },
  {
    icon: Users,
    color: "#1e3a5f",
    title: "O artesão no centro de tudo.",
    description:
      "A plataforma existe para ampliar visibilidade, vendas e autonomia de quem produz. Você tem loja com a sua cara, clientes que te conhecem pelo nome e ferramentas pensadas para quem faz à mão.",
  },
  {
    icon: Leaf,
    color: "#27ae60",
    title: "Consumo que preserva cultura.",
    description:
      "Quando você compra aqui, você não está adquirindo um produto — está preservando uma técnica, apoiando uma família e mantendo viva uma cultura que vem de gerações.",
  },
  {
    icon: Store,
    color: "#e07b2a",
    title: "Descoberta com propósito.",
    description:
      "Organizamos descoberta, vitrine e confiança para que a conexão entre artesão e cliente aconteça de forma natural, afetiva e duradoura — não apenas uma transação.",
  },
  {
    icon: Globe,
    color: "#1e3a5f",
    title: "Do talento brasileiro para o mundo.",
    description:
      "O Brasil tem mais de 8 milhões de artesãos ativos. A maior parte ainda depende de feiras presenciais para sobreviver. Estamos mudando isso — sem que percam a essência do que fazem.",
  },
  {
    icon: Shield,
    color: "#27ae60",
    title: "Compra segura. Relação honesta.",
    description:
      "Transparência em cada transação. Artesãos verificados, histórias reais, avaliações verdadeiras. Você sabe exatamente o que está comprando e de quem.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f7f3ed]">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-[#27ae60] to-[#17a2b8] relative overflow-hidden py-20 md:py-28">
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #f7f3ed 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        <div className="absolute right-0 top-0 w-1/2 h-full pointer-events-none overflow-hidden">
          <div className="absolute -right-24 -top-24 w-[480px] h-[480px] rounded-full bg-[#27ae60]/15" />
          <div className="absolute right-16 bottom-8 w-72 h-72 rounded-full bg-[#e07b2a]/10" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-10 bg-[#27ae60]/50" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#f7f3ed]/80">Nossa história</span>
            <div className="h-px w-10 bg-[#27ae60]/50" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#f7f3ed] leading-tight mb-6">
            Cada peça carrega
            <br />
            <span className="text-[#e07b2a]">uma vida inteira.</span>
          </h1>
          <p className="text-lg text-[#f7f3ed]/70 max-w-2xl mx-auto leading-relaxed mb-4">
            Vivemos num mundo de produtos iguais, embalagens idênticas e marcas sem rosto.
            O <strong className="text-[#f7f3ed]">Feito de Gente</strong> existe para ser o oposto disso.
          </p>
          <p className="text-base text-[#f7f3ed]/55 max-w-xl mx-auto leading-relaxed mb-10">
            Somos a vitrine digital onde um colar foi trançado por mãos cearenses numa tarde de terça.
            Onde uma cerâmica carrega a argila do Vale do Jequitinhonha. Onde um bordado levou semanas
            e conta uma história que nenhuma máquina consegue imitar.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" asChild className="bg-[#e07b2a] hover:bg-[#c96a1e] text-white font-semibold shadow-lg hover:scale-105 transition-all">
              <Link href="/produtos">
                Explorar produtos <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-[#f7f3ed]/70 text-[#f7f3ed] bg-white/10 hover:bg-white/20 hover:border-white">
              <Link href="/seja-artesao">Quero vender aqui</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Frase de impacto ─────────────────────────────────────────────── */}
      <section className="bg-white py-14 border-b border-[#1e3a5f]/8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sparkles className="size-7 text-[#e07b2a] mx-auto mb-5" />
          <blockquote className="text-2xl md:text-3xl font-bold text-[#1e3a5f] leading-snug">
            "O artesanato brasileiro sempre foi grande.
            <br />
            <span className="text-[#27ae60]">Faltava o palco certo."</span>
          </blockquote>
          <p className="mt-5 text-neutral-500 text-base max-w-lg mx-auto leading-relaxed">
            Não é só uma loja virtual. É infraestrutura para um setor que já existe, já vende,
            e estava esperando por uma vitrine à altura do seu talento.
          </p>
        </div>
      </section>

      {/* ── Pilares ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#f7f3ed]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#27ae60] mb-2">O que nos move</p>
            <h2 className="text-3xl font-bold text-[#1e3a5f]">Por que o Feito de Gente existe</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pillars.map(({ icon: Icon, color, title, description }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-6 flex flex-col gap-4 border border-transparent hover:shadow-md hover:border-[#1e3a5f]/15 transition-all duration-200"
                style={{ borderTop: `3px solid ${color}` }}
              >
                <div className="size-11 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                  <Icon className="size-5" style={{ color }} />
                </div>
                <h3 className="font-bold text-[#1e3a5f] leading-snug">{title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Para compradores ─────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#e07b2a] mb-3">Para quem compra</p>
              <h2 className="text-3xl font-bold text-[#1e3a5f] leading-snug mb-5">
                Presente que emociona
                <br />não se acha. Se encontra aqui.
              </h2>
              <p className="text-neutral-500 leading-relaxed mb-4">
                Tem coisas que o preço não explica. O peso certo nas mãos. O cheiro da madeira trabalhada.
                A imperfeição que torna algo absolutamente perfeito.
              </p>
              <p className="text-neutral-500 leading-relaxed mb-8">
                No <strong className="text-[#1e3a5f]">Feito de Gente</strong> você encontra peças que têm alma —
                e quando você compra, você recebe junto a história de quem fez.
                Isso não tem na vitrine do shopping.
              </p>
              <Button asChild className="bg-[#e07b2a] hover:bg-[#c96a1e] text-white font-semibold">
                <Link href="/produtos">
                  Descobrir peças únicas <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "100%", label: "Artesanato verificado" },
                { value: "8M+", label: "Artesãos no Brasil" },
                { value: "0", label: "Peças repetidas" },
                { value: "∞", label: "Histórias para contar" },
              ].map(({ value, label }) => (
                <div key={label} className="bg-[#f7f3ed] rounded-2xl p-6 text-center border border-[#1e3a5f]/8">
                  <span className="block text-3xl font-bold text-[#1e3a5f] mb-1">{value}</span>
                  <span className="text-xs text-neutral-500 font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-[#27ae60] to-[#17a2b8] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #f7f3ed 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#f7f3ed] mb-4">
            Você compra um produto.
            <br />
            <span className="underline decoration-[#e07b2a] decoration-4 underline-offset-4">
              Você apoia uma vida.
            </span>
          </h2>
          <p className="text-[#f7f3ed]/65 text-lg mb-10 leading-relaxed">
            Cada transação no Feito de Gente sustenta um artesão real, de uma cidade real,
            com uma história que vale conhecer.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" asChild className="bg-[#e07b2a] hover:bg-[#c96a1e] text-white font-semibold shadow-lg hover:scale-105 transition-all">
              <Link href="/produtos">
                Explorar o marketplace <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-[#f7f3ed]/70 text-[#f7f3ed] bg-white/10 hover:bg-white/20 hover:border-white">
              <Link href="/seja-artesao">Sou artesão</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
