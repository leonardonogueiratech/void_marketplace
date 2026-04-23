"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, ArrowRight, AlertTriangle } from "lucide-react";
import { SUBSCRIPTION_PRICES, SUBSCRIPTION_LIMITS, COMMISSION_BY_PLAN, formatDate } from "@/lib/utils";

const PLANS = [
  {
    id: "FREE",
    name: "Grátis",
    color: "#4a7c3f",
    price: SUBSCRIPTION_PRICES.FREE,
    commission: COMMISSION_BY_PLAN.FREE,
    badge: null as string | null,
    features: [
      `Até ${SUBSCRIPTION_LIMITS.FREE} produtos ativos`,
      "Perfil público da loja",
      "Painel básico de pedidos",
    ],
  },
  {
    id: "BASIC",
    name: "Básico",
    color: "#1e3a5f",
    price: SUBSCRIPTION_PRICES.BASIC,
    commission: COMMISSION_BY_PLAN.BASIC,
    features: [
      `Até ${SUBSCRIPTION_LIMITS.BASIC} produtos ativos`,
      "Perfil em destaque nas buscas",
      "Analytics de vendas",
    ],
    badge: "Mais popular" as string | null,
  },
  {
    id: "PRO",
    name: "Pro",
    color: "#e07b2a",
    price: SUBSCRIPTION_PRICES.PRO,
    commission: COMMISSION_BY_PLAN.PRO,
    features: [
      "Produtos ilimitados",
      "Destaque na página inicial",
      "Analytics avançado + exportação",
      "Suporte prioritário 24h",
    ],
    badge: "Menor comissão",
  },
] as const;

interface Props {
  currentPlan: string;
  currentStatus: string;
  periodEnd: Date | null;
}

export function SubscriptionPanel({ currentPlan, currentStatus, periodEnd }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  async function handleChangePlan(plan: string) {
    setLoading(plan);
    try {
      const res = await fetch("/api/dashboard/assinatura", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao mudar plano."); return; }
      toast.success(`Plano alterado para ${plan}!`);
      router.refresh();
    } catch {
      toast.error("Erro ao mudar plano.");
    } finally {
      setLoading(null);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    try {
      const res = await fetch("/api/dashboard/assinatura", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao cancelar."); return; }
      toast.success("Assinatura cancelada. Seu plano foi revertido para Grátis.");
      setConfirmCancel(false);
      router.refresh();
    } catch {
      toast.error("Erro ao cancelar assinatura.");
    } finally {
      setCancelling(false);
    }
  }

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-[#4a7c3f]/10 text-[#4a7c3f] border-[#4a7c3f]/20",
    PAST_DUE: "bg-red-50 text-red-600 border-red-200",
    CANCELLED: "bg-neutral-100 text-neutral-500 border-neutral-200",
    INACTIVE: "bg-amber-50 text-amber-700 border-amber-200",
  };
  const statusLabels: Record<string, string> = {
    ACTIVE: "Ativa", PAST_DUE: "Pagamento atrasado",
    CANCELLED: "Cancelada", INACTIVE: "Inativa",
  };

  return (
    <div className="space-y-6">
      {/* Current plan summary */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-[#f7f3ed] border border-[#1e3a5f]/10">
        <div className="flex-1">
          <p className="text-xs text-neutral-400 uppercase tracking-wide mb-0.5">Plano atual</p>
          <p className="text-lg font-bold text-[#1e3a5f]">
            {PLANS.find((p) => p.id === currentPlan)?.name ?? currentPlan}
          </p>
          {periodEnd && (
            <p className="text-xs text-neutral-400 mt-0.5">
              Próxima cobrança: {formatDate(periodEnd)}
            </p>
          )}
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColors[currentStatus] ?? statusColors.ACTIVE}`}>
          {statusLabels[currentStatus] ?? currentStatus}
        </span>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isLoading = loading === plan.id;
          const isUpgrade = plan.price > (SUBSCRIPTION_PRICES[currentPlan] ?? 0);

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-5 transition-all ${
                isCurrent
                  ? "border-[#1e3a5f] bg-[#1e3a5f]/4 shadow-md"
                  : "border-[#1e3a5f]/12 bg-white"
              }`}
            >
              {plan.badge && !isCurrent && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-3 py-0.5 rounded-full whitespace-nowrap"
                  style={{ background: plan.color }}
                >
                  {plan.badge}
                </span>
              )}
              {isCurrent && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1e3a5f] text-white text-xs font-bold px-3 py-0.5 rounded-full whitespace-nowrap">
                  Plano atual
                </span>
              )}

              <p className="font-bold text-[#1e3a5f] mb-0.5">{plan.name}</p>
              <p className="text-xl font-bold text-[#1e3a5f] mb-1">
                {plan.price === 0 ? "Grátis" : (
                  <>R$ {plan.price.toFixed(2).replace(".", ",")}
                    <span className="text-xs font-normal text-neutral-400">/mês</span>
                  </>
                )}
              </p>

              <div
                className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full mb-3"
                style={{ background: `${plan.color}15`, color: plan.color }}
              >
                {(plan.commission * 100).toFixed(0)}% de comissão
              </div>

              <ul className="space-y-1.5 mb-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-neutral-500">
                    <CheckCircle2 className="size-3.5 text-[#4a7c3f] shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {!isCurrent && (
                <Button
                  size="sm"
                  onClick={() => handleChangePlan(plan.id)}
                  disabled={isLoading || loading !== null}
                  className={`w-full text-xs font-semibold ${
                    isUpgrade
                      ? "bg-[#e07b2a] hover:bg-[#c96a1e] text-white"
                      : "bg-neutral-100 hover:bg-neutral-200 text-neutral-600"
                  }`}
                >
                  {isLoading && <Loader2 className="mr-1.5 size-3 animate-spin" />}
                  {isUpgrade ? "Fazer upgrade" : "Fazer downgrade"}
                  {!isLoading && isUpgrade && <ArrowRight className="ml-1.5 size-3" />}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Cancel subscription */}
      {currentPlan !== "FREE" && (
        <div className="border border-red-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-red-600 mb-1">Cancelar assinatura</p>
          <p className="text-xs text-neutral-500 mb-3">
            Seu plano será revertido para Grátis imediatamente. Você não será cobrado novamente.
          </p>

          {!confirmCancel ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmCancel(true)}
              className="border-red-200 text-red-500 hover:bg-red-50 text-xs"
            >
              Cancelar assinatura
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-red-600">
                <AlertTriangle className="size-4" /> Tem certeza?
              </div>
              <Button
                size="sm"
                onClick={handleCancel}
                disabled={cancelling}
                className="bg-red-500 hover:bg-red-600 text-white text-xs"
              >
                {cancelling && <Loader2 className="mr-1.5 size-3 animate-spin" />}
                Confirmar cancelamento
              </Button>
              <button
                onClick={() => setConfirmCancel(false)}
                className="text-xs text-neutral-400 hover:text-neutral-600"
              >
                Voltar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
