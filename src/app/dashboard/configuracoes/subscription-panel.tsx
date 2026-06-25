"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle2, ArrowRight, AlertTriangle, CreditCard } from "lucide-react";
import {
  SUBSCRIPTION_PRICES,
  SUBSCRIPTION_LAUNCH_PRICES,
  SUBSCRIPTION_LIMITS,
  COMMISSION_BY_PLAN,
  COMMISSION_LAUNCH_BY_PLAN,
  PHOTO_LIMITS,
  PLAN_PROFILES,
  formatDate,
} from "@/lib/utils";

const PLANS = [
  {
    id: "FREE",
    name: "Inicial",
    color: "#27ae60",
    price: SUBSCRIPTION_PRICES.FREE,
    launchPrice: SUBSCRIPTION_LAUNCH_PRICES.FREE,
    commission: COMMISSION_BY_PLAN.FREE,
    launchCommission: COMMISSION_LAUNCH_BY_PLAN.FREE,
    badge: null as string | null,
    features: [
      `Até ${SUBSCRIPTION_LIMITS.FREE} produtos ativos`,
      `${PHOTO_LIMITS.FREE} fotos por produto`,
      "Loja básica personalizada",
      "Selo Produto Autoral",
    ],
  },
  {
    id: "BASIC",
    name: "Profissional",
    color: "#1e3a5f",
    price: SUBSCRIPTION_PRICES.BASIC,
    launchPrice: SUBSCRIPTION_LAUNCH_PRICES.BASIC,
    commission: COMMISSION_BY_PLAN.BASIC,
    launchCommission: COMMISSION_LAUNCH_BY_PLAN.BASIC,
    badge: "Recomendado" as string | null,
    features: [
      `Até ${SUBSCRIPTION_LIMITS.BASIC} produtos ativos`,
      `${PHOTO_LIMITS.BASIC} fotos por produto`,
      "Destaque ocasional na busca",
      "Analytics de vendas",
    ],
  },
  {
    id: "PRO",
    name: "Ateliê",
    color: "#e07b2a",
    price: SUBSCRIPTION_PRICES.PRO,
    launchPrice: SUBSCRIPTION_LAUNCH_PRICES.PRO,
    commission: COMMISSION_BY_PLAN.PRO,
    launchCommission: COMMISSION_LAUNCH_BY_PLAN.PRO,
    badge: "Menor comissão" as string | null,
    features: [
      "Produtos ilimitados",
      `${PHOTO_LIMITS.PRO} fotos por produto`,
      "Destaque prioritário na busca",
      "Suporte prioritário",
    ],
  },
] as const;

interface Props {
  currentPlan: string;
  currentStatus: string;
  periodEnd: Date | null;
  hasCardOnFile: boolean;
  cardLast4: string | null;
}

const emptyCard = { holderName: "", number: "", expiryMonth: "", expiryYear: "", ccv: "" };

export function SubscriptionPanel({ currentPlan, currentStatus, periodEnd, hasCardOnFile, cardLast4 }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cardDialogPlan, setCardDialogPlan] = useState<string | null>(null);
  const [card, setCard] = useState(emptyCard);

  async function handleChangePlan(plan: string, cardData?: typeof emptyCard) {
    setLoading(plan);
    try {
      const res = await fetch("/api/dashboard/assinatura", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, card: cardData }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao mudar plano."); return; }
      const planName = PLANS.find((p) => p.id === plan)?.name ?? plan;
      toast.success(`Plano alterado para ${planName}!`);
      setCardDialogPlan(null);
      setCard(emptyCard);
      router.refresh();
    } catch {
      toast.error("Erro ao mudar plano.");
    } finally {
      setLoading(null);
    }
  }

  function startChangePlan(plan: string) {
    if (plan !== "FREE" && !hasCardOnFile) {
      setCard(emptyCard);
      setCardDialogPlan(plan);
      return;
    }
    handleChangePlan(plan);
  }

  async function handleCancel() {
    setCancelling(true);
    try {
      const res = await fetch("/api/dashboard/assinatura", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erro ao cancelar."); return; }
      toast.success("Assinatura cancelada. Seu acesso será encerrado no fim do período atual.");
      setConfirmCancel(false);
      router.refresh();
    } catch {
      toast.error("Erro ao cancelar assinatura.");
    } finally {
      setCancelling(false);
    }
  }

  const currentPlanData = PLANS.find((p) => p.id === currentPlan);

  const statusColors: Record<string, string> = {
    ACTIVE:   "bg-[#27ae60]/10 text-[#27ae60] border-[#27ae60]/20",
    PAST_DUE: "bg-red-50 text-red-600 border-red-200",
    CANCELLED:"bg-neutral-100 text-neutral-500 border-neutral-200",
    INACTIVE: "bg-amber-50 text-amber-700 border-amber-200",
  };
  const statusLabels: Record<string, string> = {
    ACTIVE:   "Ativa",
    PAST_DUE: "Pagamento atrasado",
    CANCELLED:"Cancelada",
    INACTIVE: "Inativa",
  };

  return (
    <div className="space-y-6">
      {/* Current plan summary */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-[#f7f3ed] border border-[#1e3a5f]/10">
        <div className="flex-1">
          <p className="text-xs text-neutral-400 uppercase tracking-wide mb-0.5">Plano atual</p>
          <p className="text-lg font-bold text-[#1e3a5f]">
            {currentPlanData?.name ?? currentPlan}
          </p>
          <p className="text-xs text-neutral-400">
            {PLAN_PROFILES[currentPlan] ?? ""}
          </p>
          {periodEnd && (
            <p className="text-xs text-neutral-400 mt-0.5">
              Próxima cobrança: {formatDate(periodEnd)}
            </p>
          )}
          {hasCardOnFile && (
            <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1">
              <CreditCard className="size-3" /> Cartão final {cardLast4}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColors[currentStatus] ?? statusColors.ACTIVE}`}>
            {statusLabels[currentStatus] ?? currentStatus}
          </span>
          {currentPlanData && (
            <span className="text-xs text-neutral-400">
              R$ {currentPlanData.launchPrice.toFixed(2).replace(".", ",")}/mês ★ lançamento
            </span>
          )}
        </div>
      </div>

      {/* Launch promo notice */}
      <div className="bg-[#e07b2a]/8 border border-[#e07b2a]/20 rounded-xl px-4 py-3 text-sm text-[#e07b2a] font-medium flex items-start gap-2">
        <span className="shrink-0">★</span>
        <span>
          Preços e comissões de lançamento válidos pelos primeiros 3 meses. Após o período,
          os valores regulares entram em vigor automaticamente.
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

              {/* Launch price prominent */}
              <p className="text-xl font-bold text-[#1e3a5f] mb-0.5">
                R$ {plan.launchPrice.toFixed(2).replace(".", ",")}
                <span className="text-xs font-normal text-neutral-400">/mês ★</span>
              </p>
              <p className="text-xs text-neutral-400 mb-1">
                depois R$ {plan.price.toFixed(2).replace(".", ",")}/mês
              </p>

              <div className="flex gap-1.5 mb-3">
                <div
                  className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: `${plan.color}15`, color: plan.color }}
                >
                  {(plan.launchCommission * 100).toFixed(0)}% comis. ★
                </div>
                <div className="inline-flex items-center text-xs text-neutral-400 px-2 py-0.5 rounded-full bg-neutral-100">
                  depois {(plan.commission * 100).toFixed(0)}%
                </div>
              </div>

              <ul className="space-y-1.5 mb-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-neutral-500">
                    <CheckCircle2 className="size-3.5 text-[#27ae60] shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {!isCurrent && (
                <Button
                  size="sm"
                  onClick={() => startChangePlan(plan.id)}
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
      {currentStatus === "ACTIVE" && (
        <div className="border border-red-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-red-600 mb-1">Cancelar assinatura</p>
          <p className="text-xs text-neutral-500 mb-3">
            Seu acesso será encerrado no fim do período atual. Você não será cobrado novamente.
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

      {/* Card capture dialog — obrigatório pra ativar plano pago */}
      <Dialog open={!!cardDialogPlan} onOpenChange={(open) => !open && setCardDialogPlan(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#1e3a5f] flex items-center gap-2">
              <CreditCard className="size-4" /> Dados do cartão
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-neutral-500 -mt-2">
            Necessário pra ativar o plano pago. A cobrança é mensal e recorrente.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); if (cardDialogPlan) handleChangePlan(cardDialogPlan, card); }}
            className="space-y-3"
          >
            <div className="space-y-1.5">
              <Label>Nome impresso no cartão *</Label>
              <Input required value={card.holderName} onChange={(e) => setCard({ ...card, holderName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Número do cartão *</Label>
              <Input
                required
                placeholder="0000 0000 0000 0000"
                value={card.number}
                onChange={(e) => setCard({ ...card, number: e.target.value.replace(/\D/g, "") })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Validade (MM/AAAA) *</Label>
                <div className="flex gap-2">
                  <Input required placeholder="MM" maxLength={2} value={card.expiryMonth} onChange={(e) => setCard({ ...card, expiryMonth: e.target.value.replace(/\D/g, "") })} />
                  <Input required placeholder="AAAA" maxLength={4} value={card.expiryYear} onChange={(e) => setCard({ ...card, expiryYear: e.target.value.replace(/\D/g, "") })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>CVV *</Label>
                <Input required placeholder="000" maxLength={4} value={card.ccv} onChange={(e) => setCard({ ...card, ccv: e.target.value.replace(/\D/g, "") })} />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setCardDialogPlan(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading !== null} className="flex-1 bg-[#1e3a5f] hover:bg-[#162d4a] text-white">
                {loading !== null && <Loader2 className="mr-2 size-4 animate-spin" />}
                Confirmar e assinar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
