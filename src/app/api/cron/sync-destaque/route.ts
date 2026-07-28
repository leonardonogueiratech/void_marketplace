import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  return req.headers.get("x-cron-secret") === secret;
}

// PRO: destaque prioritário (sempre ativo).
// BASIC: destaque ocasional — ativo em ~1 a cada 3 dias, escalonado por artesão
// (hash do id) pra não ligar/desligar todo mundo no mesmo dia.
// FREE ou assinatura não ativa: sem destaque.
function isOccasionalDay(artisanId: string): boolean {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  let hash = 0;
  for (const ch of artisanId) hash = (hash + ch.charCodeAt(0)) % 3;
  return (dayOfYear + hash) % 3 === 0;
}

async function syncDestaque(): Promise<NextResponse> {
  const artisans = await prisma.artisanProfile.findMany({
    where: { status: "APPROVED" },
    select: { id: true, subscription: { select: { plan: true, status: true } } },
  });

  let proCount = 0;
  let basicFeaturedCount = 0;

  for (const artisan of artisans) {
    const isActive = artisan.subscription?.status === "ACTIVE";
    const plan = isActive ? artisan.subscription!.plan : "FREE";

    const featured =
      plan === "PRO" ? true :
      plan === "BASIC" ? isOccasionalDay(artisan.id) :
      false;

    if (plan === "PRO") proCount++;
    if (plan === "BASIC" && featured) basicFeaturedCount++;

    await prisma.artisanProfile.update({ where: { id: artisan.id }, data: { featured } });
    await prisma.product.updateMany({
      where: { artisanId: artisan.id, status: "ACTIVE" },
      data: { featured },
    });
  }

  return NextResponse.json({
    ok: true,
    artisansChecked: artisans.length,
    proFeatured: proCount,
    basicFeaturedToday: basicFeaturedCount,
  });
}

// GET para permitir chamada simples via curl/crontab no VPS
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  return syncDestaque();
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  return syncDestaque();
}
