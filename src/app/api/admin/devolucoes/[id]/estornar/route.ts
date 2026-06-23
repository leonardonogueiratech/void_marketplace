import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { refundPayment } from "@/lib/asaas";
import { sendReturnRefundedToCustomer } from "@/lib/email";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  const { id } = await params;

  const returnRequest = await prisma.returnRequest.findUnique({
    where: { id },
    include: {
      customer: { select: { name: true, email: true } },
      orderItem: {
        include: {
          product: { select: { name: true } },
          order: { include: { payment: true } },
        },
      },
    },
  });
  if (!returnRequest) return NextResponse.json({ error: "Solicitação não encontrada." }, { status: 404 });
  if (returnRequest.status !== "RECEIVED") {
    return NextResponse.json({ error: "Aguarde o artesão confirmar o recebimento antes de estornar." }, { status: 400 });
  }

  const asaasPaymentId = returnRequest.orderItem.order.payment?.asaasPaymentId;
  if (!asaasPaymentId) {
    return NextResponse.json({ error: "Pedido sem pagamento associado." }, { status: 400 });
  }

  try {
    await refundPayment(asaasPaymentId, { value: returnRequest.orderItem.totalPrice });
  } catch (e) {
    console.error("Erro ao estornar devolução na Asaas:", e);
    return NextResponse.json({ error: "Erro ao processar estorno na Asaas." }, { status: 502 });
  }

  await prisma.$transaction([
    prisma.returnRequest.update({
      where: { id },
      data: { status: "REFUNDED", refundedAt: new Date() },
    }),
    prisma.commission.deleteMany({ where: { orderItemId: returnRequest.orderItemId } }),
    prisma.product.update({
      where: { id: returnRequest.orderItem.productId },
      data: {
        stock: { increment: returnRequest.orderItem.quantity },
        salesCount: { decrement: returnRequest.orderItem.quantity },
      },
    }),
    prisma.artisanProfile.update({
      where: { id: returnRequest.artisanId },
      data: { totalSales: { decrement: returnRequest.orderItem.quantity } },
    }),
  ]);

  if (returnRequest.customer?.email) {
    void sendReturnRefundedToCustomer({
      to: returnRequest.customer.email,
      customerName: returnRequest.customer.name ?? "Cliente",
      productName: returnRequest.orderItem.product.name,
    });
  }

  return NextResponse.json({ ok: true });
}
