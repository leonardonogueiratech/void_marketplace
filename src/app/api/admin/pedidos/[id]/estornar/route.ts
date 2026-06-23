import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { refundPayment } from "@/lib/asaas";
import { sendOrderRefunded } from "@/lib/email";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { payment: true, items: true, user: { select: { name: true, email: true } } },
  });
  if (!order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  if (!order.payment?.asaasPaymentId) {
    return NextResponse.json({ error: "Pedido sem pagamento associado." }, { status: 400 });
  }
  if (order.status === "REFUNDED" || order.status === "CANCELLED") {
    return NextResponse.json({ error: "Pedido já foi estornado ou cancelado." }, { status: 400 });
  }

  try {
    await refundPayment(order.payment.asaasPaymentId);
  } catch (e) {
    console.error("Erro ao estornar pagamento na Asaas:", e);
    return NextResponse.json({ error: "Erro ao processar estorno na Asaas." }, { status: 502 });
  }

  const itemIds = order.items.map((i) => i.id);

  await prisma.$transaction([
    prisma.payment.update({ where: { orderId: id }, data: { status: "REFUNDED" } }),
    prisma.order.update({ where: { id }, data: { status: "REFUNDED" } }),
    prisma.commission.deleteMany({ where: { orderItemId: { in: itemIds } } }),
    ...order.items.map((item) =>
      prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity }, salesCount: { decrement: item.quantity } },
      })
    ),
    ...order.items.map((item) =>
      prisma.artisanProfile.update({
        where: { id: item.artisanId },
        data: { totalSales: { decrement: item.quantity } },
      })
    ),
  ]);

  if (order.user?.email) {
    void sendOrderRefunded({
      to: order.user.email,
      customerName: order.user.name ?? "Cliente",
      orderId: order.id,
    });
  }

  return NextResponse.json({ ok: true });
}
