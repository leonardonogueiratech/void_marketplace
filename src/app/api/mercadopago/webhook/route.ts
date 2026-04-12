import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mpPayment } from "@/lib/mercadopago";
import { COMMISSION_RATE } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type !== "payment") {
      return NextResponse.json({ ok: true });
    }

    const payment = await mpPayment.get({ id: data.id });
    const orderId = payment.external_reference;
    if (!orderId) return NextResponse.json({ ok: true });

    const mpStatus = payment.status;

    if (mpStatus === "approved") {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (!order) return NextResponse.json({ ok: true });

      await prisma.payment.update({
        where: { orderId },
        data: { status: "APPROVED", paidAt: new Date(), mpPaymentId: String(payment.id) },
      });

      await prisma.order.update({
        where: { id: orderId },
        data: { status: "PAID" },
      });

      for (const item of order.items) {
        const existing = await prisma.commission.findUnique({
          where: { orderItemId: item.id },
        });

        if (!existing) {
          await prisma.commission.create({
            data: {
              artisanId: item.artisanId,
              orderItemId: item.id,
              saleAmount: item.totalPrice,
              rate: COMMISSION_RATE,
              amount: item.totalPrice * COMMISSION_RATE,
            },
          });
        }

        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            salesCount: { increment: item.quantity },
          },
        });

        await prisma.artisanProfile.update({
          where: { id: item.artisanId },
          data: { totalSales: { increment: item.quantity } },
        });
      }
    } else if (mpStatus === "cancelled" || mpStatus === "rejected") {
      await prisma.payment.update({
        where: { orderId },
        data: { status: mpStatus === "cancelled" ? "CANCELLED" : "REJECTED" },
      });
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
