import { prisma } from "@/lib/prisma";
import { findOrCreateCustomer, createAsaasSubscription } from "@/lib/asaas";
import { SUBSCRIPTION_LAUNCH_PRICES } from "@/lib/utils";

const FREE_PERIOD_MONTHS = 3;
const LAUNCH_PERIOD_MONTHS = 3;

function nextMonthDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split("T")[0]!;
}

/**
 * Chamado na aprovação do artesão. Não cobra nada ainda — apenas marca o fim do
 * período gratuito de lançamento (3 meses, só comissão sobre vendas, sem mensalidade).
 * A cobrança de fato começa depois, via activateSubscriptionAfterFreePeriod (cron).
 */
export async function scheduleSubscriptionOnApproval(artisanId: string): Promise<void> {
  const artisan = await prisma.artisanProfile.findUnique({
    where: { id: artisanId },
    include: { subscription: true },
  });

  const sub = artisan?.subscription;
  if (!artisan || !sub) return;
  if (artisan.subscriptionExempt) return;
  if (sub.asaasSubscriptionId || sub.freePriceEndsAt) return; // já agendada/ativada

  const freePriceEndsAt = new Date();
  freePriceEndsAt.setMonth(freePriceEndsAt.getMonth() + FREE_PERIOD_MONTHS);

  await prisma.subscription.update({
    where: { artisanId: artisan.id },
    data: { freePriceEndsAt },
  });
}

/**
 * Cria a cobrança recorrente real na Asaas pro plano escolhido no cadastro, usando o
 * preço de lançamento (50% off por mais 3 meses). Chamado pelo cron diário quando o
 * período gratuito de um artesão termina.
 */
export async function activateSubscriptionAfterFreePeriod(artisanId: string): Promise<void> {
  const artisan = await prisma.artisanProfile.findUnique({
    where: { id: artisanId },
    include: { subscription: true, user: { select: { name: true, email: true } } },
  });

  const sub = artisan?.subscription;
  if (!artisan || !sub) return;
  if (artisan.subscriptionExempt) return;
  if (sub.asaasSubscriptionId) return; // já ativada

  const price = SUBSCRIPTION_LAUNCH_PRICES[sub.plan] ?? 0;
  if (price <= 0) return;

  if (!sub.creditCardToken) {
    console.error(`Artesão ${artisanId}: sem cartão tokenizado, não foi possível ativar assinatura.`);
    return;
  }

  const customerId = await findOrCreateCustomer({
    name: artisan.user?.name ?? artisan.storeName,
    email: artisan.user?.email ?? "",
  });

  const asaasSub = await createAsaasSubscription({
    customerId,
    value: price,
    description: `Plano ${sub.plan} (lançamento) — Feito de Gente`,
    artisanId: artisan.id,
    nextDueDate: nextMonthDate(),
    creditCardToken: sub.creditCardToken,
  });

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  const launchPriceEndsAt = new Date(now);
  launchPriceEndsAt.setMonth(launchPriceEndsAt.getMonth() + LAUNCH_PERIOD_MONTHS);

  await prisma.subscription.update({
    where: { artisanId: artisan.id },
    data: {
      status: "ACTIVE",
      asaasSubscriptionId: asaasSub.id,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      launchPriceEndsAt,
    },
  });
}
