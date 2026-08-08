import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateAsaasSubscriptionValue } from "@/lib/asaas";
import { SUBSCRIPTION_PRICES } from "@/lib/utils";
import { activateSubscriptionAfterFreePeriod } from "@/lib/subscriptions";

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("x-cron-secret") !== secret) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  // Fase 1 → Fase 2: fim do período gratuito de lançamento — começa a cobrar
  // (preço promocional, com 50% de desconto pelos próximos 3 meses).
  const freeEnded = await prisma.subscription.findMany({
    where: {
      freePriceEndsAt: { lte: new Date() },
      asaasSubscriptionId: null,
    },
  });

  let activated = 0;
  for (const sub of freeEnded) {
    try {
      await activateSubscriptionAfterFreePeriod(sub.artisanId);
      activated++;
    } catch (e) {
      console.error(`Falha ao ativar assinatura ${sub.id} após período gratuito:`, e);
    }
  }

  // Fim do preço de lançamento — reajusta para o preço regular.
  const launchEnded = await prisma.subscription.findMany({
    where: {
      launchPriceEndsAt: { lte: new Date() },
      asaasSubscriptionId: { not: null },
    },
  });

  let upgraded = 0;
  for (const sub of launchEnded) {
    const regularPrice = SUBSCRIPTION_PRICES[sub.plan] ?? 0;
    try {
      if (sub.asaasSubscriptionId) {
        await updateAsaasSubscriptionValue(sub.asaasSubscriptionId, regularPrice);
      }
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { launchPriceEndsAt: null },
      });
      upgraded++;
    } catch (e) {
      console.error(`Falha ao reajustar assinatura ${sub.id}:`, e);
    }
  }

  return NextResponse.json({
    ok: true,
    freePeriodChecked: freeEnded.length,
    activated,
    launchChecked: launchEnded.length,
    upgraded,
  });
}
