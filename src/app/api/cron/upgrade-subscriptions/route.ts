import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateAsaasSubscriptionValue } from "@/lib/asaas";
import { SUBSCRIPTION_PRICES } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("x-cron-secret") !== secret) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const due = await prisma.subscription.findMany({
    where: {
      launchPriceEndsAt: { lte: new Date() },
      asaasSubscriptionId: { not: null },
    },
  });

  let upgraded = 0;
  for (const sub of due) {
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

  return NextResponse.json({ ok: true, checked: due.length, upgraded });
}
