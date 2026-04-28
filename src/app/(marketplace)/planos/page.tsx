import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, X, Info, Zap, Star, Sparkles } from "lucide-react";
import {
  SUBSCRIPTION_PRICES,
  SUBSCRIPTION_LIMITS,
  COMMISSION_BY_PLAN,
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
    name: "Grátis",
    icon: Zap,
    color: "#27ae60",
    price: SUBSCRIPTION_PRICES.FREE,
    commission: COMMISSION_BY_PLAN.FREE,
    productLimit: SUBSCRIPTION_LIMITS.FREE,
    highlight: false,
    badge: null,
    description: "Para quem quer testar a plataforma antes de se comprometer.",
    features: [
      { label: `Até ${SUBSCRIPTION_LIMITS.FREE} produtos ativos`, included: true },
      { label: "Perfil público da loja", included: true },
      { label: "Painel básico de pedidos", included: true },
      { label: "Suporte por e-mail", included: true },
      { label: "Perfil em destaque", included: false },
      { label: "Chat com clientes", included: false },
      { label: "Analytics de vendas", included: false },
      { label: "Destaque na página inicial", included: false },
      { label: "Suporte prioritário", included: false },
    ],
    cta: "Começar grátis",
    ctaHref: "/seja-artesao",
  },
  {
    id: "BASIC",
    name: "Básico",
    icon: Star,
    color: "#1e3a5f",
    price: SUBSCRIPTION_PRICES.BASIC,
    commission: COMMISSION_BY_PLAN.BASIC,
    productLimit: SUBSCRIPTION_LIMITS.BASIC,
    highlight: true,
    badge: "Mais popular",
    description: "Para artesãos que querem crescer com visibilidade e ferramentas reais.",
    features: [
      { label: `Até ${SUBSCRIPTION_LIMITS.BASIC} produtos ativos`, included: true },
      { label: "Perfil público da loja", included: true },
      { label: "Painel completo de pedidos", included: true },
      { label: "Suporte por e-mail", included: true },
      { label: "Perfil em destaque nas buscas", included: true },
      { label: "Chat com clientes", included: true },
      { label: "Analytics de vendas", included: true },
      { label: "Destaque na página inicial", included: false },
      { label: "Suporte prioritário", included: false },
    ],
    cta: "Assinar Básico",
    ctaHref: "/seja-artesao",
  },
  {
    id: "PRO",
    name: "Pro",
    icon: Sparkles,
    color: "#e07b2a",
    price: SUBSCRIPTION_PRICES.PRO,
    commission: COMMISSION_BY_PLAN.PRO,
    productLimit: SUBSCRIPTION_LIMITS.PRO,
    highlight: false,
    badge: "Menor comissão",
    description: "Para quem quer o máximo de exposição, recursos e a menor comissão da plataforma.",
    features: [
      { label: "Produtos ilimitados", included: true },
      { label: "Perfil público da loja", included: true },
      { label: "Painel completo de pedidos", included: true },
      { label: "Suporte prioritário 24h", included: true },
      { label: "Perfil em destaque nas buscas", included: true },
      { label: "Chat com clientes", included: true },
      { label: "Analytics avançado de vendas", included: true },
      { label: "Destaque garantido na página inicial", included: true },
      { label: "Relatórios exportáveis (CSV)", included: true },
    ],
    cta: "Assinar Pro",
    ctaHref: "/seja-artesao",
  },
];

/** Simula o valor líquido recebido para um produto de R$ 100 */
function calcNet(price: number, commission: number) {
  const commissionAmt = price * commission;
  const processingAmt = price * PAYMENT_PROCESSING_FEE + PAYMENT_PROCESSING_FIXED;
  const net = price - commissionAmt - processingAmt;
  return { commissionAmt, processingAmt, net };
}

const comparisonRows = [
  { label: "Produtos ativos", free: `Até ${SUBSCRIPTION_LIMITS.FREE}`, basic: `Até ${SUBSCRIPTION_LIMITS.BASIC}`, pro: "Ilimitados" },
  { label: "Comissão por venda", free: `${(COMMISSION_BY_PLAN.FREE * 100).toFixed(0)}%`, basic: `${(COMMISSION_BY_PLAN.BASIC * 100).toFixed(0)}%`, pro: `${(COMMISSION_BY_PLAN.PRO * 100).toFixed(0)}%` },
  { label: "Taxa de processamento*", free: `${(PAYMENT_PROCESSING_FEE * 100).toFixed(2)}% + R$${PAYMENT_PROCESSING_FIXED.toFixed(2)}`, basic: `${(PAYMENT_PROCESSING_FEE * 100).toFixed(2)}% + R$${PAYMENT_PROCESSING_FIXED.toFixed(2)}`, pro: `${(PAYMENT_PROCESSING_FEE * 100).toFixed(2)}% + R$${PAYMENT_PROCESSING_FIXED.toFixed(2)}` },
  { label: "Taxa de listagem", free: "Grátis", basic: "Grátis", pro: "Grátis" },
  { label: "Perfil em destaque", free: "—", basic: "✓", pro: "✓" },
  { label: "Chat com clientes", free: "—", basic: "✓", pro: "✓" },
  { label: "Analytics", free: "—", basic: "Básico", pro: "Avançado" },
  { label: "Destaque na home", free: "—", basic: "—", pro: "✓" },
  { label: "Suporte", free: "E-mail", basic: "E-mail", pro: "Prioritário 24h" },
];

export default function PlansPage() {
  const example = 100; // R$ 100 de venda para exemplo
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
            Sem surpresas. Todos os custos são transparentes — mensalidade, comissão e taxa de processamento detalhados abaixo.
          </p>
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
                  <div className="flex items-center gap-3 mb-4">
                    <div className="size-10 rounded-xl flex items-center justify-center" style={{ background: `${plan.color}18` }}>
                      <Icon className="size-5" style={{ color: plan.color }} />
                    </div>
                    <h2 className="text-xl font-bold text-[#1e3a5f]">{plan.name}</h2>
                  </div>

                  {/* Price */}
                  <div className="mb-2">
                    {plan.price === 0 ? (
                      <span className="text-4xl font-bold text-[#1e3a5f]">Grátis</span>
                    ) : (
                      <div className="flex items-end gap-1">
                        <span className="text-sm text-neutral-400 mb-1">R$</span>
                        <span className="text-4xl font-bold text-[#1e3a5f]">
                          {plan.price.toFixed(2).replace(".", ",")}
                        </span>
                        <span className="text-sm text-neutral-400 mb-1">/mês</span>
                      </div>
                    )}
                  </div>

                  {/* Commission highlight */}
                  <div
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full mb-4"
                    style={{ background: `${plan.color}15`, color: plan.color }}
                  >
                    <span>{(plan.commission * 100).toFixed(0)}% de comissão por venda</span>
                  </div>

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

        {/* ── Simulador de ganhos ──────────────────────────────────────── */}
        <section className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#1e3a5f]">O que você recebe por venda de R$ 100</h2>
            <p className="text-neutral-500 mt-1 text-sm">
              Exemplo com produto de R$ 100,00 — todos os descontos já calculados
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-[#1e3a5f]/10 overflow-hidden shadow-sm">
            <div className="grid grid-cols-4 bg-[#f7f3ed] border-b border-[#1e3a5f]/8">
              <div className="p-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Custo</div>
              {plans.map((p) => (
                <div key={p.id} className="p-4 text-center text-sm font-bold text-[#1e3a5f]">{p.name}</div>
              ))}
            </div>

            {/* Preço de venda */}
            <div className="grid grid-cols-4 border-b border-[#1e3a5f]/6">
              <div className="p-4 text-sm text-neutral-600 flex items-center gap-1.5">
                Preço de venda
              </div>
              {plans.map((p) => (
                <div key={p.id} className="p-4 text-center text-sm font-medium text-neutral-700">R$ 100,00</div>
              ))}
            </div>

            {/* Comissão plataforma */}
            <div className="grid grid-cols-4 border-b border-[#1e3a5f]/6 bg-[#e07b2a]/5">
              <div className="p-4 text-sm text-neutral-600 flex items-center gap-1.5">
                Comissão da plataforma
              </div>
              {plans.map((p) => (
                <div key={p.id} className="p-4 text-center text-sm text-[#e07b2a] font-medium">
                  − R$ {nets[p.id as keyof typeof nets].commissionAmt.toFixed(2).replace(".", ",")}
                  <span className="block text-xs text-[#e07b2a]/60">({(COMMISSION_BY_PLAN[p.id] * 100).toFixed(0)}%)</span>
                </div>
              ))}
            </div>

            {/* Taxa de processamento */}
            <div className="grid grid-cols-4 border-b border-[#1e3a5f]/6 bg-[#e07b2a]/5">
              <div className="p-4 text-sm text-neutral-600 flex items-center gap-1.5">
                Taxa de pagamento*
              </div>
              {plans.map((p) => (
                <div key={p.id} className="p-4 text-center text-sm text-[#e07b2a] font-medium">
                  − R$ {nets[p.id as keyof typeof nets].processingAmt.toFixed(2).replace(".", ",")}
                  <span className="block text-xs text-[#e07b2a]/60">(2,99% + R$0,39)</span>
                </div>
              ))}
            </div>

            {/* Mensalidade */}
            <div className="grid grid-cols-4 border-b border-[#1e3a5f]/6 bg-[#e07b2a]/5">
              <div className="p-4 text-sm text-neutral-600">Mensalidade do plano</div>
              {plans.map((p) => (
                <div key={p.id} className="p-4 text-center text-sm text-[#e07b2a] font-medium">
                  {p.price === 0 ? (
                    <span className="text-[#27ae60]">Grátis</span>
                  ) : (
                    <>− R$ {p.price.toFixed(2).replace(".", ",")}/mês</>
                  )}
                </div>
              ))}
            </div>

            {/* Valor líquido */}
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
            * Taxa de processamento cobrada pelo gateway de pagamento (igual em todos os planos).
            Não inclui a mensalidade no cálculo de "você recebe" acima para facilitar a comparação por venda.
          </p>
        </section>

        {/* ── Tabela comparativa completa ──────────────────────────────── */}
        <section className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#1e3a5f]">Comparativo completo</h2>
          </div>

          <div className="bg-white rounded-2xl border border-[#1e3a5f]/10 overflow-hidden shadow-sm">
            <div className="grid grid-cols-4 bg-[#f7f3ed] border-b border-[#1e3a5f]/8">
              <div className="p-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Recurso</div>
              {plans.map((p) => (
                <div key={p.id} className="p-4 text-center">
                  <span className="text-sm font-bold text-[#1e3a5f]">{p.name}</span>
                  {p.price > 0 && (
                    <span className="block text-xs text-neutral-400">
                      R$ {p.price.toFixed(0)}/mês
                    </span>
                  )}
                </div>
              ))}
            </div>

            {comparisonRows.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-4 border-b border-[#1e3a5f]/6 last:border-0 ${i % 2 === 0 ? "" : "bg-[#f7f3ed]/40"}`}
              >
                <div className="p-4 text-sm text-neutral-600 font-medium">{row.label}</div>
                <div className="p-4 text-center text-sm text-neutral-500">{row.free}</div>
                <div className="p-4 text-center text-sm text-neutral-700">{row.basic}</div>
                <div className="p-4 text-center text-sm text-neutral-700 font-medium">{row.pro}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ rápido ───────────────────────────────────────────────── */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            {
              q: "Existe taxa de listagem por produto?",
              a: "Não. Ao contrário de algumas plataformas internacionais, não cobramos por cada produto cadastrado. Você paga apenas a mensalidade do plano (ou nada, no plano gratuito) e a comissão quando vende.",
            },
            {
              q: "A comissão incide sobre frete também?",
              a: "Não. A comissão é calculada apenas sobre o valor do produto, excluindo o frete cobrado do cliente.",
            },
            {
              q: "Posso mudar de plano a qualquer momento?",
              a: "Sim. Você pode fazer upgrade ou downgrade do seu plano quando quiser. O valor é proporcional aos dias restantes no mês.",
            },
            {
              q: "Quando recebo o pagamento das vendas?",
              a: "Após a confirmação da entrega pelo cliente, o valor líquido é liberado para saque em até 2 dias úteis. Para PIX o repasse é instantâneo após liberação.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="bg-white rounded-2xl p-6 border border-[#1e3a5f]/8 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-[#1e3a5f] mb-2 text-sm">{q}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{a}</p>
            </div>
          ))}
        </section>

        {/* ── CTA final ────────────────────────────────────────────────── */}
        <section className="mt-14 bg-[#27ae60] rounded-2xl p-10 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none rounded-2xl"
            style={{ backgroundImage: "radial-gradient(circle, #f7f3ed 1px, transparent 1px)", backgroundSize: "20px 20px" }}
          />
          <div className="relative">
            <h2 className="text-2xl font-bold text-[#f7f3ed] mb-2">Pronto para abrir sua vitrine?</h2>
            <p className="text-[#f7f3ed]/65 mb-7 max-w-sm mx-auto">
              Comece grátis. Sem cartão de crédito. Sem tempo mínimo de contrato.
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
