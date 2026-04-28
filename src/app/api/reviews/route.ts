import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  orderId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const { orderId, rating, comment } = parsed.data;

  const order = await prisma.order.findUnique({
    where: { id: orderId, customerId: session.user.id },
    include: {
      items: { select: { artisanId: true }, take: 1 },
      reviews: { select: { id: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }
  if (order.status !== "DELIVERED") {
    return NextResponse.json({ error: "Só é possível avaliar pedidos entregues." }, { status: 400 });
  }
  if (order.reviews.length > 0) {
    return NextResponse.json({ error: "Você já avaliou este pedido." }, { status: 409 });
  }

  const artisanId = order.items[0]?.artisanId ?? null;

  await prisma.review.create({
    data: {
      userId: session.user.id,
      orderId,
      artisanId,
      rating,
      comment: comment?.trim() || null,
    },
  });

  if (artisanId) {
    const agg = await prisma.review.aggregate({
      where: { artisanId, published: true },
      _avg: { rating: true },
    });
    await prisma.artisanProfile.update({
      where: { id: artisanId },
      data: { rating: agg._avg.rating ?? 0 },
    });
  }

  return NextResponse.json({ ok: true });
}
