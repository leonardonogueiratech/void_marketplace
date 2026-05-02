import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Store, ExternalLink, Receipt } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SubscriptionPanel } from "./subscription-panel";
import { COMMISSION_BY_PLAN, SUBSCRIPTION_PRICES } from "@/lib/utils";

const PLAN_LABELS: Record<string, string> = { FREE: "Grátis", BASIC: "Básico", PRO: "Pro" };

export default async function DashboardSettingsPage() {
  const session = await auth();
  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId: session!.user.id },
    include: { subscription: true },
  });
  if (!artisan) return null;

  const sub = artisan.subscription;

  // Saques como proxy de histórico financeiro da conta
  const recentWithdrawals = await prisma.withdrawal.findMany({
    where: { artisanId: artisan.id, status: "PAID" },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const storeStatusLabels: Record<string, { label: string; color: string }> = {
    APPROVED: { label: "Aprovada", color: "bg-[#27ae60]/10 text-[#27ae60] border-[#27ae60]/20" },
    PENDING:  { label: "Em análise", color: "bg-amber-50 text-amber-700 border-amber-200" },
    REJECTED: { label: "Rejeitada", color: "bg-red-50 text-red-600 border-red-200" },
    SUSPENDED:{ label: "Suspensa", color: "bg-neutral-100 text-neutral-500 border-neutral-200" },
  };
  const storeStatus = storeStatusLabels[artisan.status] ?? storeStatusLabels.PENDING;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Configurações</h1>
        <p className="text-sm text-neutral-500 mt-1">Conta, plano e visibilidade da loja.</p>
      </div>

      {/* Account + store info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-[#1e3a5f]/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-[#1e3a5f] flex items-center gap-2">
              <User className="size-4" /> Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-neutral-400">Nome</p>
              <p className="font-medium text-[#1e3a5f]">{session?.user.name ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400">Email</p>
              <p className="font-medium text-[#1e3a5f] truncate">{session?.user.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400">Membro desde</p>
              <p className="font-medium text-[#1e3a5f]">{formatDate(artisan.createdAt)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#1e3a5f]/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-[#1e3a5f] flex items-center gap-2">
              <Store className="size-4" /> Loja
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-neutral-400">Status da loja</p>
              <span className={`inline-flex text-xs font-semibold px-2.5 py-0.5 rounded-full border mt-1 ${storeStatus.color}`}>
                {storeStatus.label}
              </span>
            </div>
            <div>
              <p className="text-xs text-neutral-400">URL pública</p>
              <p className="font-medium text-[#1e3a5f] text-xs">/artesao/{artisan.slug}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400">Destaque</p>
              <p className="font-medium text-[#1e3a5f]">{artisan.featured ? "Sim" : "Não"}</p>
            </div>
            <Button variant="outline" size="sm" asChild className="w-full mt-1 border-[#1e3a5f]/20 text-[#1e3a5f] text-xs">
              <Link href={`/artesao/${artisan.slug}`} target="_blank">
                <ExternalLink className="mr-1.5 size-3" /> Ver loja pública
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Subscription management */}
      <Card className="border-[#1e3a5f]/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-[#1e3a5f]">Plano e assinatura</CardTitle>
        </CardHeader>
        <CardContent>
          <SubscriptionPanel
            currentPlan={sub?.plan ?? "FREE"}
            currentStatus={sub?.status ?? "ACTIVE"}
            periodEnd={sub?.currentPeriodEnd ?? null}
          />
        </CardContent>
      </Card>

      {/* Resumo do plano atual */}
      <Card className="border-[#1e3a5f]/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-[#1e3a5f] flex items-center gap-2">
            <Receipt className="size-4" /> Detalhes do plano atual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Plano", value: PLAN_LABELS[sub?.plan ?? "FREE"] },
              {
                label: "Mensalidade",
                value: SUBSCRIPTION_PRICES[sub?.plan as keyof typeof SUBSCRIPTION_PRICES ?? "FREE"] === 0
                  ? "Grátis"
                  : formatCurrency(SUBSCRIPTION_PRICES[sub?.plan as keyof typeof SUBSCRIPTION_PRICES ?? "FREE"]),
              },
              {
                label: "Comissão por venda",
                value: `${((COMMISSION_BY_PLAN[sub?.plan as keyof typeof COMMISSION_BY_PLAN ?? "FREE"] ?? 0) * 100).toFixed(0)}%`,
              },
              {
                label: "Renovação",
                value: sub?.currentPeriodEnd ? formatDate(sub.currentPeriodEnd) : "—",
              },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-neutral-400">{label}</p>
                <p className="font-semibold text-[#1e3a5f] mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Histórico de saques recentes */}
          {recentWithdrawals.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">
                Últimos saques pagos
              </p>
              <div className="space-y-2">
                {recentWithdrawals.map((w) => (
                  <div key={w.id} className="flex items-center justify-between py-1.5 border-b border-neutral-100 last:border-0">
                    <div>
                      <p className="text-sm text-[#1e3a5f] font-medium">{formatCurrency(w.amount)}</p>
                      <p className="text-xs text-neutral-400">PIX {w.pixKey} · {formatDate(w.createdAt)}</p>
                    </div>
                    <span className="text-xs bg-[#27ae60]/10 text-[#27ae60] px-2 py-0.5 rounded-full">
                      Pago
                    </span>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" asChild className="mt-3 text-xs border-[#1e3a5f]/20 text-[#1e3a5f]">
                <Link href="/dashboard/financeiro">Ver extrato completo →</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
