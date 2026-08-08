import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendOrderCancelledToCustomer, sendOrderCancelledToArtisan } from "@/lib/email";

const CANCELLABLE = ["PENDING", "PAYMENT_PENDING"];

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      customerId: true,
      status: true,
      user: { select: { name: true, email: true } },
      items: {
        select: {
          artisanId: true,
          product: {
            select: { artisan: { select: { storeName: true, user: { select: { name: true, email: true } } } } },
          },
        },
      },
    },
  });

  if (!order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  if (order.customerId !== session.user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  if (!CANCELLABLE.includes(order.status)) {
    return NextResponse.json(
      { error: "Este pedido não pode ser cancelado. Apenas pedidos pendentes ou aguardando pagamento podem ser cancelados." },
      { status: 400 }
    );
  }

  await prisma.order.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  if (order.user.email) {
    void sendOrderCancelledToCustomer({
      to: order.user.email,
      customerName: order.user.name ?? "Cliente",
      orderId: order.id,
    });
  }

  const artisanMap = new Map<string, { storeName: string; name: string; email: string }>();
  for (const item of order.items) {
    const artisan = item.product.artisan;
    if (artisan?.user?.email && !artisanMap.has(item.artisanId)) {
      artisanMap.set(item.artisanId, {
        storeName: artisan.storeName,
        name: artisan.user.name ?? artisan.storeName,
        email: artisan.user.email,
      });
    }
  }
  for (const artisan of artisanMap.values()) {
    void sendOrderCancelledToArtisan({ to: artisan.email, artisanName: artisan.name, orderId: order.id });
  }

  return NextResponse.json({ ok: true });
}
