import { prisma } from "@/lib/prisma";
import { findOrCreateCustomer, createAsaasSubscription } from "@/lib/asaas";
import { SUBSCRIPTION_LAUNCH_PRICES } from "@/lib/utils";

const LAUNCH_PERIOD_MONTHS = 3;

function nextMonthDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split("T")[0]!;
}

/**
 * Cria a cobrança recorrente real na Asaas pro plano escolhido no cadastro,
 * usando o preço de lançamento. Chamado só quando o artesão é aprovado —
 * nunca antes, pra não cobrar quem ainda pode ser rejeitado.
 */
export async function activatePaidSubscriptionOnApproval(artisanId: string): Promise<void> {
  const artisan = await prisma.artisanProfile.findUnique({
    where: { id: artisanId },
    include: { subscription: true, user: { select: { name: true, email: true } } },
  });

  const sub = artisan?.subscription;
  if (!artisan || !sub) return;
  if (sub.plan === "FREE") return;
  if (sub.asaasSubscriptionId) return; // já ativada

  const price = SUBSCRIPTION_LAUNCH_PRICES[sub.plan] ?? 0;
  if (price <= 0) return;

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
