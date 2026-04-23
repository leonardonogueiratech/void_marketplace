import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isApproved, isCancelled, type AsaasPaymentStatus } from "@/lib/asaas";
import { COMMISSION_RATE } from "@/lib/utils";

interface AsaasWebhookPayload {
  event: string;
  payment: {
    id: string;
    externalReference?: string;
    status: AsaasPaymentStatus;
    value: number;
    billingType: string;
    subscription?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN;
    if (webhookToken) {
      const incomingToken = req.headers.get("asaas-access-token");
      if (incomingToken !== webhookToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = (await req.json()) as AsaasWebhookPayload;
    const { event, payment } = body;

    const ref = payment.externalReference ?? "";

    // ── Subscription payment (externalReference = "sub_{artisanId}") ──────────
    if (ref.startsWith("sub_")) {
      const artisanId = ref.slice(4);

      if (isApproved(payment.status)) {
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        await prisma.subscription.updateMany({
          where: { artisanId },
          data: {
            status: "ACTIVE",
            currentPeriodStart: new Date(),
            currentPeriodEnd: periodEnd,
          },
        });
      } else if (event === "PAYMENT_OVERDUE") {
        await prisma.subscription.updateMany({
          where: { artisanId },
          data: { status: "PAST_DUE" },
        });
      } else if (isCancelled(payment.status)) {
        await prisma.subscription.updateMany({
          where: { artisanId },
          data: { status: "CANCELLED", canceledAt: new Date() },
        });
      }

      return NextResponse.json({ ok: true });
    }

    // ── Order payment ─────────────────────────────────────────────────────────
    const orderId = ref;
    if (!orderId) return NextResponse.json({ ok: true });

    const dbPayment = await prisma.payment.findUnique({ where: { orderId } });
    if (!dbPayment) return NextResponse.json({ ok: true });

    if (isApproved(payment.status)) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (!order) return NextResponse.json({ ok: true });

      await prisma.payment.update({
        where: { orderId },
        data: { status: "APPROVED", paidAt: new Date(), asaasPaymentId: payment.id },
      });

      await prisma.order.update({ where: { id: orderId }, data: { status: "PAID" } });

      for (const item of order.items) {
        const existing = await prisma.commission.findUnique({ where: { orderItemId: item.id } });
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
          data: { stock: { decrement: item.quantity }, salesCount: { increment: item.quantity } },
        });
        await prisma.artisanProfile.update({
          where: { id: item.artisanId },
          data: { totalSales: { increment: item.quantity } },
        });
      }
    } else if (isCancelled(payment.status) || event === "PAYMENT_OVERDUE") {
      await prisma.payment.update({
        where: { orderId },
        data: { status: isCancelled(payment.status) ? "CANCELLED" : "PENDING" },
      });
      if (isCancelled(payment.status)) {
        await prisma.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Asaas webhook error:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
