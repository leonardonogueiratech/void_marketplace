import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  findOrCreateCustomer,
  createPixPayment,
  createBoletoPayment,
  createCreditCardPayment,
  isApproved,
} from "@/lib/asaas";
import { COMMISSION_RATE } from "@/lib/utils";
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
      include: { artisan: true },
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

    const address = await prisma.address.create({
      data: { userId: session.user.id, ...data.address },
    });

    const order = await prisma.order.create({
      data: {
        customerId: session.user.id,
        addressId: address.id,
        status: "PAYMENT_PENDING",
        subtotal,
        total: subtotal,
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
    let boletoBarcode: string | undefined;
    let approved = false;

    if (data.paymentMethod === "PIX") {
      const { payment, pix } = await createPixPayment({
        customerId,
        value: subtotal,
        description,
        orderId: order.id,
        dueDate,
      });
      asaasPaymentId = payment.id;
      pixQrCode = pix.payload;
      pixQrCodeBase64 = pix.encodedImage;
      approved = isApproved(payment.status);
    } else if (data.paymentMethod === "BOLETO") {
      const payment = await createBoletoPayment({
        customerId,
        value: subtotal,
        description,
        orderId: order.id,
        dueDate,
        name: payerName,
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
        value: subtotal,
        description,
        orderId: order.id,
        dueDate,
        installmentCount: installments,
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
        amount: subtotal,
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
        await prisma.commission.create({
          data: {
            artisanId: item.artisanId,
            orderItemId: item.id,
            saleAmount: item.totalPrice,
            rate: COMMISSION_RATE,
            amount: item.totalPrice * COMMISSION_RATE,
          },
        });
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity }, salesCount: { increment: item.quantity } },
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
