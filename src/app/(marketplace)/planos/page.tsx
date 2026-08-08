import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, X, Info, Zap, Star, Sparkles, BadgeCheck } from "lucide-react";
import {
  SUBSCRIPTION_PRICES,
  SUBSCRIPTION_LAUNCH_PRICES,
  SUBSCRIPTION_LIMITS,
  COMMISSION_BY_PLAN,
  PHOTO_LIMITS,
  PLAN_PROFILES,
  PAYMENT_PROCESSING_FEE,
  PAYMENT_PROCESSING_FIXED,
} from "@/lib/utils";

export const metadata: Metadata = {
  title: "Planos e Preços — Feito de Gente",
  description: "Escolha o plano ideal para sua loja e comece a vender artesanato para todo o Brasil.",
};

const plans = [
  {
    id: "FREE",
    name: "Inicial",
    icon: Zap,
    color: "#27ae60",
    price: SUBSCRIPTION_PRICES.FREE,
    launchPrice: SUBSCRIPTION_LAUNCH_PRICES.FREE,
    commission: COMMISSION_BY_PLAN.FREE,
    productLimit: SUBSCRIPTION_LIMITS.FREE,
    photoLimit: PHOTO_LIMITS.FREE,
    highlight: false,
    badge: null as string | null,
    description: "Para artesãos que estão começando e querem mostrar seu trabalho com qualidade.",
    features: [
      { label: "Até 20 produtos cadastrados", included: true },
      { label: "4 fotos por produto", included: true },
      { label: "Loja básica personalizada", included: true },
      { label: "Selo Produto Autoral", included: true },
      { label: "Suporte por e-mail", included: true },
      { label: "Destaque na busca", included: false },
      { label: "Chat com clientes", included: false },
      { label: "Analytics de vendas", included: false },
    ],
    cta: "Assinar Inicial",
    ctaHref: "/seja-artesao",
  },
  {
    id: "BASIC",
    name: "Profissional",
    icon: Star,
    color: "#1e3a5f",
    price: SUBSCRIPTION_PRICES.BASIC,
    launchPrice: SUBSCRIPTION_LAUNCH_PRICES.BASIC,
    commission: COMMISSION_BY_PLAN.BASIC,
    productLimit: SUBSCRIPTION_LIMITS.BASIC,
    photoLimit: PHOTO_LIMITS.BASIC,
    highlight: true,
    badge: "Recomendado" as string | null,
    description: "Ideal para MEIs e vendedores ativos com produção regular que querem crescer.",
    features: [
      { label: "Até 50 produtos cadastrados", included: true },
      { label: "6 fotos por produto", included: true },
      { label: "Loja intermediária personalizada", included: true },
      { label: "Selo Produto Autoral", included: true },
      { label: "Suporte por e-mail + chat", included: true },
      { label: "Destaque ocasional na busca", included: true },
      { label: "Chat com clientes", included: true },
      { label: "Analytics de vendas", included: true },
    ],
    cta: "Assinar Profissional",
    ctaHref: "/seja-artesao",
  },
  {
    id: "PRO",
    name: "Ateliê",
    icon: Sparkles,
    color: "#e07b2a",
    price: SUBSCRIPTION_PRICES.PRO,
    launchPrice: SUBSCRIPTION_LAUNCH_PRICES.PRO,
    commission: COMMISSION_BY_PLAN.PRO,
    productLimit: SUBSCRIPTION_LIMITS.PRO,
    photoLimit: PHOTO_LIMITS.PRO,
    highlight: false,
    badge: null as string | null,
    description: "Para pequenas marcas e ateliês com maior volume de produtos e vendas.",
    features: [
      { label: "Produtos ilimitados (acima de 50)", included: true },
      { label: "10 fotos por produto", included: true },
      { label: "Loja completa personalizada", included: true },
      { label: "Selo Produto Autoral", included: true },
      { label: "Suporte prioritário", included: true },
      { label: "Destaque prioritário na busca", included: true },
      { label: "Chat com clientes", included: true },
      { label: "Analytics avançado de vendas", included: true },
    ],
    cta: "Assinar Ateliê",
    ctaHref: "/seja-artesao",
  },
];

/** Calcula valor líquido descontando comissão e taxa de pagamento */
function calcNet(price: number, commission: number) {
  const commissionAmt = price * commission;
  const processingAmt = price * PAYMENT_PROCESSING_FEE + PAYMENT_PROCESSING_FIXED;
  const net = price - commissionAmt - processingAmt;
  return { commissionAmt, processingAmt, net };
}

const comparisonRows = [
  {
    label: "Perfil",
    free: PLAN_PROFILES.FREE,
    basic: PLAN_PROFILES.BASIC,
    pro: PLAN_PROFILES.PRO,
  },
  {
    label: "Mensalidade primeiros 3 meses ★",
    free: "Grátis",
    basic: "Grátis",
    pro: "Grátis",
    highlight: true,
  },
  {
    label: "Mensalidade lançamento ★ (meses 4–6)",
    free: `R$ ${SUBSCRIPTION_LAUNCH_PRICES.FREE.toFixed(2).replace(".", ",")}/mês`,
    basic: `R$ ${SUBSCRIPTION_LAUNCH_PRICES.BASIC.toFixed(2).replace(".", ",")}/mês`,
    pro: `R$ ${SUBSCRIPTION_LAUNCH_PRICES.PRO.toFixed(2).replace(".", ",")}/mês`,
    highlight: true,
  },
  {
    label: "Mensalidade regular (a partir do mês 7)",
    free: `R$ ${SUBSCRIPTION_PRICES.FREE.toFixed(2).replace(".", ",")}/mês`,
    basic: `R$ ${SUBSCRIPTION_PRICES.BASIC.toFixed(2).replace(".", ",")}/mês`,
    pro: `R$ ${SUBSCRIPTION_PRICES.PRO.toFixed(2).replace(".", ",")}/mês`,
    highlight: false,
  },
  {
    label: "Comissão sobre vendas",
    free: `${(COMMISSION_BY_PLAN.FREE * 100).toFixed(0)}%`,
    basic: `${(COMMISSION_BY_PLAN.BASIC * 100).toFixed(0)}%`,
    pro: `${(COMMISSION_BY_PLAN.PRO * 100).toFixed(0)}%`,
    highlight: false,
  },
  {
    label: "Produtos cadastrados",
    free: `Até ${SUBSCRIPTION_LIMITS.FREE}`,
    basic: `Até ${SUBSCRIPTION_LIMITS.BASIC}`,
    pro: "Acima de 50",
  },
  {
    label: "Fotos por produto",
    free: `${PHOTO_LIMITS.FREE} fotos`,
    basic: `${PHOTO_LIMITS.BASIC} fotos`,
    pro: `${PHOTO_LIMITS.PRO} fotos`,
  },
  {
    label: "Loja personalizada",
    free: "Básica",
    basic: "Intermediária",
    pro: "Completa",
  },
  {
    label: "Destaque na busca",
    free: "—",
    basic: "Ocasional",
    pro: "Prioritário",
  },
  {
    label: "Selo Produto Autoral",
    free: "✓",
    basic: "✓",
    pro: "✓",
  },
  {
    label: "Suporte",
    free: "E-mail",
    basic: "E-mail + Chat",
    pro: "Prioritário",
  },
];

export default function PlansPage() {
  const example = 100;
  const nets = {
    FREE:  calcNet(example, COMMISSION_BY_PLAN.FREE),
    BASIC: calcNet(example, COMMISSION_BY_PLAN.BASIC),
    PRO:   calcNet(example, COMMISSION_BY_PLAN.PRO),
  };

  return (
    <div className="min-h-screen bg-[#f7f3ed]">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="bg-[#1e3a5f] py-16 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #f7f3ed 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#a8d5a2] mb-3">Para artesãos</p>
          <h1 className="text-4xl font-bold text-[#f7f3ed] mb-4">Planos e Preços</h1>
          <p className="text-[#f7f3ed]/60 text-lg max-w-xl mx-auto">
            Mensalidade + comissão por venda. Todos os custos transparentes — sem surpresas.
          </p>
        </div>
      </div>

      {/* ── Banner de lançamento ─────────────────────────────────────────── */}
      <div className="bg-[#e07b2a] py-3 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
          <span className="text-white font-bold text-sm">★ Promoção de Lançamento</span>
          <span className="text-white/85 text-sm">
            3 primeiros meses grátis (só comissão sobre vendas) + mais 3 meses com 50% de desconto na mensalidade.
            Após esse período, o valor regular entra em vigor.
          </span>
        </div>
      </div>

      {/* ── Cards de planos ──────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl overflow-hidden border transition-shadow hover:shadow-xl ${
                  plan.highlight
                    ? "border-[#1e3a5f] shadow-lg ring-2 ring-[#1e3a5f]/20"
                    : "border-[#1e3a5f]/12 shadow-sm"
                }`}
              >
                {plan.badge && (
                  <div
                    className="text-center py-1.5 text-xs font-bold uppercase tracking-wider text-white"
                    style={{ background: plan.color }}
                  >
                    {plan.badge}
                  </div>
                )}

                <div className="p-7">
                  {/* Icon + name */}
                  <div className="flex items-center gap-3 mb-1">
                    <div className="size-10 rounded-xl flex items-center justify-center" style={{ background: `${plan.color}18` }}>
                      <Icon className="size-5" style={{ color: plan.color }} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#1e3a5f]">{plan.name}</h2>
                      <p className="text-xs text-neutral-400">{PLAN_PROFILES[plan.id]}</p>
                    </div>
                  </div>

                  {/* Price — período gratuito em destaque */}
                  <div className="mt-4 mb-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-[#27ae60]">Grátis</span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      nos primeiros 3 meses · depois R$ {plan.launchPrice.toFixed(2).replace(".", ",")}/mês por mais 3 meses
                      · depois <span className="line-through">R$ {plan.price.toFixed(2).replace(".", ",")}</span>/mês
                    </p>
                  </div>

                  {/* Commission highlight */}
                  <div className="flex flex-wrap gap-2 mb-1">
                    <div
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                      style={{ background: `${plan.color}15`, color: plan.color }}
                    >
                      {(plan.commission * 100).toFixed(0)}% de comissão sobre vendas
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400 mb-5">
                    Mesma comissão sempre — sem surpresa quando a mensalidade começar a valer
                  </p>

                  <p className="text-sm text-neutral-500 leading-relaxed mb-6">{plan.description}</p>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-8">
                    {plan.features.map((f) => (
                      <li key={f.label} className="flex items-center gap-2.5 text-sm">
                        {f.included ? (
                          <Check className="size-4 text-[#27ae60] shrink-0" strokeWidth={2.5} />
                        ) : (
                          <X className="size-4 text-neutral-300 shrink-0" />
                        )}
                        <span className={f.included ? "text-neutral-700" : "text-neutral-400"}>
                          {f.label}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className="w-full font-semibold"
                    style={
                      plan.highlight
                        ? { background: "#1e3a5f", color: "#fff" }
                        : { background: `${plan.color}18`, color: plan.color }
                    }
                  >
                    <Link href={plan.ctaHref}>
                      {plan.cta} <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nota do lançamento */}
        <p className="text-xs text-neutral-400 text-center mt-5 flex items-center justify-center gap-1.5">
          <Info className="size-3.5 shrink-0" />
          ★ Promoção de lançamento: 3 meses grátis, depois mais 3 meses com 50% de desconto na mensalidade. Após o período, o preço regular entra em vigor automaticamente. A comissão de 15% não muda em nenhuma fase.
        </p>

        {/* ── Simulador de ganhos ──────────────────────────────────────── */}
        <section className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#1e3a5f]">O que você recebe por venda de R$ 100</h2>
            <p className="text-neutral-500 mt-1 text-sm">
              Comissão única de 15% sobre vendas — igual para todos os planos, sempre
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#1e3a5f]/10 overflow-hidden shadow-sm">
            <div className="grid grid-cols-4 bg-[#f7f3ed] border-b border-[#1e3a5f]/8">
              <div className="p-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Custo</div>
              {plans.map((p) => (
                <div key={p.id} className="p-4 text-center text-sm font-bold text-[#1e3a5f]">{p.name}</div>
              ))}
            </div>

            <div className="grid grid-cols-4 border-b border-[#1e3a5f]/6">
              <div className="p-4 text-sm text-neutral-600">Preço de venda</div>
              {plans.map((p) => (
                <div key={p.id} className="p-4 text-center text-sm font-medium text-neutral-700">R$ 100,00</div>
              ))}
            </div>

            <div className="grid grid-cols-4 border-b border-[#1e3a5f]/6 bg-[#e07b2a]/5">
              <div className="p-4 text-sm text-neutral-600">Comissão da plataforma</div>
              {plans.map((p) => (
                <div key={p.id} className="p-4 text-center text-sm text-[#e07b2a] font-medium">
                  − R$ {nets[p.id as keyof typeof nets].commissionAmt.toFixed(2).replace(".", ",")}
                  <span className="block text-xs text-[#e07b2a]/60">
                    ({(COMMISSION_BY_PLAN[p.id] * 100).toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 border-b border-[#1e3a5f]/6 bg-[#e07b2a]/5">
              <div className="p-4 text-sm text-neutral-600">Taxa de pagamento*</div>
              {plans.map((p) => (
                <div key={p.id} className="p-4 text-center text-sm text-[#e07b2a] font-medium">
                  − R$ {nets[p.id as keyof typeof nets].processingAmt.toFixed(2).replace(".", ",")}
                  <span className="block text-xs text-[#e07b2a]/60">(2,99% + R$0,39)</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 bg-[#f7f3ed]">
              <div className="p-4 text-sm font-bold text-[#1e3a5f]">Você recebe</div>
              {plans.map((p) => (
                <div key={p.id} className="p-4 text-center">
                  <span className="text-xl font-bold text-[#27ae60]">
                    R$ {nets[p.id as keyof typeof nets].net.toFixed(2).replace(".", ",")}
                  </span>
                  <span className="block text-xs text-neutral-400 mt-0.5">por venda</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-neutral-400 mt-3 text-center flex items-center justify-center gap-1">
            <Info className="size-3.5 shrink-0" />
            * Taxa de processamento cobrada pelo gateway (igual em todos os planos). A mensalidade é cobrada separadamente e não entra no cálculo acima.
          </p>
        </section>

        {/* ── Tabela comparativa completa ──────────────────────────────── */}
        <section className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#1e3a5f]">Comparativo completo</h2>
          </div>

          <div className="bg-white rounded-2xl border border-[#1e3a5f]/10 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="grid grid-cols-4 bg-[#f7f3ed] border-b border-[#1e3a5f]/8">
              <div className="p-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Recurso</div>
              {plans.map((p) => (
                <div key={p.id} className="p-4 text-center">
                  <span className="text-sm font-bold text-[#1e3a5f]">{p.name}</span>
                  <span className="block text-xs text-[#27ae60] font-semibold mt-0.5">
                    Grátis 3 meses ★
                  </span>
                  <span className="block text-xs text-neutral-400">
                    depois R$ {p.launchPrice.toFixed(0)}/mês · R$ {p.price.toFixed(0)}/mês regular
                  </span>
                </div>
              ))}
            </div>

            {comparisonRows.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-4 border-b border-[#1e3a5f]/6 last:border-0 ${
                  row.highlight
                    ? "bg-[#e07b2a]/5"
                    : i % 2 === 0
                    ? ""
                    : "bg-[#f7f3ed]/40"
                }`}
              >
                <div className="p-4 text-sm text-neutral-600 font-medium">
                  {row.label.replace(" ★", "")}
                  {row.highlight && (
                    <span className="ml-1.5 text-[10px] font-bold text-[#e07b2a] bg-[#e07b2a]/10 px-1.5 py-0.5 rounded-full">
                      LANÇAMENTO
                    </span>
                  )}
                </div>
                <div className="p-4 text-center text-sm text-neutral-500">{row.free}</div>
                <div className="p-4 text-center text-sm text-neutral-700">{row.basic}</div>
                <div className="p-4 text-center text-sm text-neutral-700 font-medium">{row.pro}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-[#1e3a5f]/4 border border-[#1e3a5f]/10 rounded-xl p-4 flex items-start gap-3">
            <BadgeCheck className="size-5 text-[#27ae60] shrink-0 mt-0.5" />
            <p className="text-sm text-[#1e3a5f]/80 leading-relaxed">
              <strong>Todos os planos incluem o Selo Produto Autoral</strong>, reforçando o posicionamento de exclusividade
              da plataforma e certificando que cada peça é criada por um artesão real.
            </p>
          </div>
        </section>

        {/* ── FAQ rápido ───────────────────────────────────────────────── */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            {
              q: "Como funciona a promoção de lançamento?",
              a: "Nos primeiros 3 meses após a aprovação da sua loja, você não paga mensalidade — só a comissão sobre as vendas. Nos 3 meses seguintes, a mensalidade passa a valer com 50% de desconto. Depois disso, o preço regular entra em vigor automaticamente. A comissão de 15% é a mesma em todas as fases.",
            },
            {
              q: "Existe taxa de listagem por produto?",
              a: "Não. Ao contrário de algumas plataformas internacionais, não cobramos por produto cadastrado. Você paga a mensalidade do plano e a comissão apenas quando vende.",
            },
            {
              q: "A comissão incide sobre o frete também?",
              a: "Não. A comissão é calculada apenas sobre o valor do produto, excluindo o frete cobrado do cliente.",
            },
            {
              q: "Posso mudar de plano a qualquer momento?",
              a: "Sim. Você pode fazer upgrade ou downgrade quando quiser. O valor é proporcional aos dias restantes no período atual.",
            },
            {
              q: "Quando recebo o pagamento das vendas?",
              a: "Após a confirmação da entrega, o valor líquido é liberado para saque em até 2 dias úteis. Para PIX, o repasse é feito no mesmo dia após liberação.",
            },
            {
              q: "Qual plano é indicado para quem está começando?",
              a: "O plano Inicial é ideal para artesãos Pessoa Física que querem estruturar sua loja com até 20 produtos. O plano Profissional é recomendado para MEIs com produção regular, com até 50 produtos. O Ateliê é para marcas maiores, com produtos ilimitados.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="bg-white rounded-2xl p-6 border border-[#1e3a5f]/8 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-[#1e3a5f] mb-2 text-sm">{q}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{a}</p>
            </div>
          ))}
        </section>

        {/* ── CTA final ────────────────────────────────────────────────── */}
        <section className="mt-14 bg-[#1e3a5f] rounded-2xl p-10 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none rounded-2xl"
            style={{ backgroundImage: "radial-gradient(circle, #f7f3ed 1px, transparent 1px)", backgroundSize: "20px 20px" }}
          />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#a8d5a2] mb-3">Oferta de lançamento</p>
            <h2 className="text-2xl font-bold text-[#f7f3ed] mb-2">Abra sua vitrine com 50% off</h2>
            <p className="text-[#f7f3ed]/65 mb-7 max-w-sm mx-auto">
              Por tempo limitado: mensalidade e comissão reduzidas por 3 meses completos.
            </p>
            <Button asChild size="lg" className="bg-[#e07b2a] hover:bg-[#c96a1e] text-white font-semibold shadow-lg hover:scale-105 transition-all">
              <Link href="/seja-artesao">
                Criar minha loja agora <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
