import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAdminEntregasAtrasadas } from "@/lib/email";

// Pedidos enviados há mais desse tanto de dias sem confirmação de entrega
const DAYS_THRESHOLD = 10;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  return req.headers.get("x-cron-secret") === secret;
}

async function checkEntregasAtrasadas(): Promise<NextResponse> {
  const cutoff = new Date(Date.now() - DAYS_THRESHOLD * 24 * 60 * 60 * 1000);

  const orders = await prisma.order.findMany({
    where: { status: "SHIPPED", updatedAt: { lte: cutoff } },
    include: {
      user: { select: { name: true } },
      items: { take: 1, include: { product: { select: { artisan: { select: { storeName: true } } } } } },
    },
  });

  if (orders.length === 0) {
    return NextResponse.json({ ok: true, alerted: false, count: 0 });
  }

  await sendAdminEntregasAtrasadas({
    orders: orders.map((o) => ({
      id: o.id,
      storeName: o.items[0]?.product.artisan.storeName ?? "Artesão",
      customerName: o.user?.name ?? "Cliente",
      shippedAt: o.updatedAt,
      daysSinceShipped: Math.floor((Date.now() - o.updatedAt.getTime()) / (24 * 60 * 60 * 1000)),
    })),
  });

  return NextResponse.json({ ok: true, alerted: true, count: orders.length });
}

// GET para permitir chamada simples via curl/crontab no VPS
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  return checkEntregasAtrasadas();
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  return checkEntregasAtrasadas();
}
