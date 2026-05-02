import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  findOrCreateCustomer,
  createPixPayment,
  createBoletoPayment,
  createCreditCardPayment,
  isApproved,
  type SplitEntry,
} from "@/lib/asaas";
import { COMMISSION_BY_PLAN } from "@/lib/utils";
import {
  sendOrderConfirmedToCustomer,
  sendNewOrderToArtisan,
} from "@/lib/email";
import { z } from "zod";

const orderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      artisanId: z.string(),
      quantity: z.number().min(1),
      unitPrice: z.number().positive(),
    })
  ).min(1),
  address: z.object({
    street: z.string(),
    number: z.string(),
    complement: z.string().optional(),
    district: z.string(),
    city: z.string(),
    state: z.string().length(2),
    zipCode: z.string(),
  }),
  paymentMethod: z.enum(["CREDIT_CARD", "PIX", "BOLETO"]),
  shippingCost: z.number().min(0).default(0),
  shippingServiceId: z.number().int().optional(),
  cardData: z.object({
    number: z.string(),
    name: z.string(),
    expiry: z.string(),
    cvv: z.string(),
    installments: z.string(),
  }).optional(),
});

function todayPlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0]!;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = orderSchema.parse(body);

    const products = await prisma.product.findMany({
      where: { id: { in: data.items.map((i) => i.productId) }, status: "ACTIVE" },
      include: {
        artisan: {
          include: {
            user: { select: { name: true, email: true } },
            subscription: { select: { plan: true } },
          },
        },
      },
    });

    if (products.length !== data.items.length) {
      return NextResponse.json({ error: "Um ou mais produtos não estão disponíveis." }, { status: 400 });
    }

    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId)!;
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Estoque insuficiente para "${product.name}".` }, { status: 400 });
      }
    }

    const subtotal = data.items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
    const total = subtotal + data.shippingCost;

    // Retenção: artesão só pode sacar 15 dias após pagamento (tempo de entrega + disputa)
    const DAYS_TO_CLEAR = 15;

    // Build split array: one entry per artisan with their net amount after commission
    // Shipping stays with platform — split only covers product net amounts
    const splitMap = new Map<string, number>();
    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId)!;
      const plan = product.artisan.subscription?.plan ?? "FREE";
      const commissionRate = COMMISSION_BY_PLAN[plan] ?? COMMISSION_BY_PLAN.FREE;
      const walletId = product.artisan.asaasWalletId;
      if (!walletId) continue;
      const net = Math.round((item.unitPrice * item.quantity * (1 - commissionRate)) * 100) / 100;
      splitMap.set(walletId, (splitMap.get(walletId) ?? 0) + net);
    }
    const split: SplitEntry[] = Array.from(splitMap.entries()).map(([walletId, fixedValue]) => ({
      walletId,
      fixedValue,
      daysToClearAfterPaid: DAYS_TO_CLEAR,
    }));

    const address = await prisma.address.create({
      data: { userId: session.user.id, ...data.address },
    });

    const order = await prisma.order.create({
      data: {
        customerId: session.user.id,
        addressId: address.id,
        status: "PAYMENT_PENDING",
        subtotal,
        shippingCost: data.shippingCost,
        total,
        shippingServiceId: data.shippingServiceId,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            artisanId: item.artisanId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
          })),
        },
      },
      include: { items: true, user: true },
    });

    const payerName = session.user.name ?? "Cliente";
    const payerEmail = session.user.email ?? "comprador@artesao.com";
    const description = `Pedido #${order.id.slice(-8)} – Feito de Gente`;
    const dueDate = todayPlusDays(data.paymentMethod === "BOLETO" ? 3 : 1);

    const customerId = await findOrCreateCustomer({ name: payerName, email: payerEmail });

    let asaasPaymentId = "";
    let asaasPaymentLink: string | undefined;
    let pixQrCode: string | undefined;
    let pixQrCodeBase64: string | undefined;
    let boletoUrl: string | undefined;
    let approved = false;

    if (data.paymentMethod === "PIX") {
      const { payment, pix } = await createPixPayment({
        customerId,
        value: total,
        description,
        orderId: order.id,
        dueDate,
        split,
      });
      asaasPaymentId = payment.id;
      pixQrCode = pix.payload;
      pixQrCodeBase64 = pix.encodedImage;
      approved = isApproved(payment.status);
    } else if (data.paymentMethod === "BOLETO") {
      const payment = await createBoletoPayment({
        customerId,
        value: total,
        description,
        orderId: order.id,
        dueDate,
        name: payerName,
        split,
      });
      asaasPaymentId = payment.id;
      boletoUrl = payment.bankSlipUrl ?? payment.invoiceUrl;
      approved = isApproved(payment.status);
    } else {
      const expiry = data.cardData?.expiry ?? "12/99";
      const [expiryMonth, expiryYear] = expiry.split("/");
      const installments = parseInt(data.cardData?.installments ?? "1", 10);

      const payment = await createCreditCardPayment({
        customerId,
        value: total,
        description,
        orderId: order.id,
        dueDate,
        installmentCount: installments,
        split,
        card: {
          holderName: data.cardData?.name ?? payerName,
          number: (data.cardData?.number ?? "").replace(/\s/g, ""),
          expiryMonth: expiryMonth ?? "12",
          expiryYear: expiryYear ?? "2099",
          ccv: data.cardData?.cvv ?? "",
        },
        cardHolderInfo: { name: payerName, email: payerEmail },
      });
      asaasPaymentId = payment.id;
      asaasPaymentLink = payment.invoiceUrl;
      approved = isApproved(payment.status);
    }

    await prisma.payment.create({
      data: {
        orderId: order.id,
        method: data.paymentMethod,
        status: approved ? "APPROVED" : "PENDING",
        amount: total,
        asaasPaymentId,
        asaasPaymentLink,
        pixQrCode,
        pixQrCodeBase64,
        boletoUrl,
        paidAt: approved ? new Date() : null,
        expiresAt: data.paymentMethod === "BOLETO"
          ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
          : null,
      },
    });

    if (approved) {
      await prisma.order.update({ where: { id: order.id }, data: { status: "PAID" } });

      for (const item of order.items) {
        const product = products.find((p) => p.id === item.productId)!;
        const plan = product.artisan.subscription?.plan ?? "FREE";
        const commissionRate = COMMISSION_BY_PLAN[plan] ?? COMMISSION_BY_PLAN.FREE;
        await prisma.commission.create({
          data: {
            artisanId: item.artisanId,
            orderItemId: item.id,
            saleAmount: item.totalPrice,
            rate: commissionRate,
            amount: item.totalPrice * commissionRate,
          },
        });
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity }, salesCount: { increment: item.quantity } },
        });
      }

      // fire-and-forget emails
      const itemSummary = order.items.map((item) => {
        const p = products.find((p) => p.id === item.productId)!;
        return { name: p.name, quantity: item.quantity, totalPrice: item.totalPrice };
      });
      const firstArtisan = products[0]?.artisan;

      void sendOrderConfirmedToCustomer({
        to: payerEmail,
        customerName: payerName,
        orderId: order.id,
        items: itemSummary,
        total: subtotal,
        storeName: firstArtisan?.storeName ?? "Artesão",
      });

      // one email per artisan
      const artisanMap = new Map<string, typeof firstArtisan>();
      for (const p of products) { artisanMap.set(p.artisanId, p.artisan); }
      for (const [artisanId, artisan] of artisanMap) {
        if (!artisan?.user?.email) continue;
        const artisanItems = order.items
          .filter((i) => i.artisanId === artisanId)
          .map((i) => {
            const p = products.find((p) => p.id === i.productId)!;
            return { name: p.name, quantity: i.quantity, totalPrice: i.totalPrice };
          });
        void sendNewOrderToArtisan({
          to: artisan.user.email,
          artisanName: artisan.user.name ?? artisan.storeName,
          storeName: artisan.storeName,
          orderId: order.id,
          items: artisanItems,
          subtotal: artisanItems.reduce((s, i) => s + i.totalPrice, 0),
          customerCity: data.address.city,
          customerState: data.address.state,
        });
      }
    }

    return NextResponse.json({ orderId: order.id, pixQrCode, pixQrCodeBase64, boletoUrl }, { status: 201 });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao processar pedido." }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    include: {
      items: { include: { product: { include: { images: { take: 1 } } } } },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}
