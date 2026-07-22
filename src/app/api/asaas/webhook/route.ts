import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isApproved, isCancelled, type AsaasPaymentStatus } from "@/lib/asaas";
import { COMMISSION_RATE, COMMISSION_BY_PLAN } from "@/lib/utils";
import { sendOrderConfirmedToCustomer, sendNewOrderToArtisan } from "@/lib/email";

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
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  artisan: { select: { storeName: true, user: { select: { name: true, email: true } } } },
                },
              },
            },
          },
          user: { select: { name: true, email: true } },
        },
      });
      if (!order) return NextResponse.json({ ok: true });

      // aprovação síncrona (ex.: cartão aprovado na hora) já mandou os e-mails na criação do pedido —
      // só disparar aqui na transição assíncrona (PIX pago depois, cartão saindo de análise, boleto pago)
      const alreadyNotified = order.status === "PAID";

      await prisma.payment.update({
        where: { orderId },
        data: { status: "APPROVED", paidAt: new Date(), asaasPaymentId: payment.id },
      });

      await prisma.order.update({ where: { id: orderId }, data: { status: "PAID" } });

      const artisanIds = [...new Set(order.items.map((i) => i.artisanId))];
      const subscriptions = await prisma.subscription.findMany({
        where: { artisanId: { in: artisanIds } },
        select: { artisanId: true, plan: true },
      });
      const planByArtisan = new Map(subscriptions.map((s) => [s.artisanId, s.plan]));

      for (const item of order.items) {
        const existing = await prisma.commission.findUnique({ where: { orderItemId: item.id } });
        if (existing) continue; // já processado (webhook duplicado ou aprovação síncrona anterior)

        const plan = planByArtisan.get(item.artisanId);
        const rate = (plan && COMMISSION_BY_PLAN[plan]) ?? COMMISSION_RATE;
        await prisma.commission.create({
          data: {
            artisanId: item.artisanId,
            orderItemId: item.id,
            saleAmount: item.totalPrice,
            rate,
            amount: item.totalPrice * rate,
          },
        });
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity }, salesCount: { increment: item.quantity } },
        });
        await prisma.artisanProfile.update({
          where: { id: item.artisanId },
          data: { totalSales: { increment: item.quantity } },
        });
      }

      if (!alreadyNotified) {
        const customerEmail = order.user?.email;
        if (customerEmail) {
          const itemSummary = order.items.map((i) => ({
            name: i.product.name,
            quantity: i.quantity,
            totalPrice: i.totalPrice,
          }));
          void sendOrderConfirmedToCustomer({
            to: customerEmail,
            customerName: order.user?.name ?? "Cliente",
            orderId: order.id,
            items: itemSummary,
            total: order.subtotal,
            storeName: order.items[0]?.product.artisan.storeName ?? "Artesão",
          });
        }

        const artisanMap = new Map<string, (typeof order.items)[number]["product"]["artisan"]>();
        for (const item of order.items) artisanMap.set(item.artisanId, item.product.artisan);
        for (const [artisanId, artisan] of artisanMap) {
          if (!artisan?.user?.email) continue;
          const artisanItems = order.items
            .filter((i) => i.artisanId === artisanId)
            .map((i) => ({ name: i.product.name, quantity: i.quantity, totalPrice: i.totalPrice }));
          void sendNewOrderToArtisan({
            to: artisan.user.email,
            artisanName: artisan.user.name ?? artisan.storeName,
            storeName: artisan.storeName,
            orderId: order.id,
            items: artisanItems,
            subtotal: artisanItems.reduce((s, i) => s + i.totalPrice, 0),
          });
        }
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
