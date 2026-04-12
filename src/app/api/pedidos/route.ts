import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mpPayment } from "@/lib/mercadopago";
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

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = orderSchema.parse(body);

    // Validate products and get current prices
    const productIds = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "ACTIVE" },
      include: { artisan: true },
    });

    if (products.length !== data.items.length) {
      return NextResponse.json({ error: "Um ou mais produtos não estão disponíveis." }, { status: 400 });
    }

    // Check stock
    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId)!;
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Estoque insuficiente para "${product.name}".` }, { status: 400 });
      }
    }

    const subtotal = data.items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);

    // Create address
    const address = await prisma.address.create({
      data: { userId: session.user.id, ...data.address },
    });

    // Create order
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

    // Process payment with MercadoPago
    let paymentResponse;
    let pixQrCode: string | undefined;
    let pixQrCodeBase64: string | undefined;
    let boletoUrl: string | undefined;
    let boletoBarcode: string | undefined;

    const payerEmail = session.user.email ?? "comprador@artesao.com";

    if (data.paymentMethod === "PIX") {
      paymentResponse = await mpPayment.create({
        body: {
          transaction_amount: subtotal,
          payment_method_id: "pix",
          payer: { email: payerEmail },
          description: `Pedido #${order.id.slice(-8)} - Feito de Gente`,
          external_reference: order.id,
        },
      });
      pixQrCode = paymentResponse.point_of_interaction?.transaction_data?.qr_code ?? undefined;
      pixQrCodeBase64 = paymentResponse.point_of_interaction?.transaction_data?.qr_code_base64 ?? undefined;
    } else if (data.paymentMethod === "BOLETO") {
      paymentResponse = await mpPayment.create({
        body: {
          transaction_amount: subtotal,
          payment_method_id: "bolbradesco",
          payer: { email: payerEmail, first_name: session.user.name?.split(" ")[0] ?? "Cliente", last_name: session.user.name?.split(" ").slice(1).join(" ") ?? "" },
          description: `Pedido #${order.id.slice(-8)} - Feito de Gente`,
          external_reference: order.id,
        },
      });
      boletoUrl = (paymentResponse as { transaction_details?: { external_resource_url?: string } }).transaction_details?.external_resource_url ?? undefined;
      boletoBarcode = (paymentResponse as { barcode?: { content?: string } }).barcode?.content ?? undefined;
    } else {
      // Credit card - simplified (in production would use MercadoPago SDK tokenization)
      paymentResponse = { id: `mock_${Date.now()}`, status: "approved" };
    }

    const mpStatus = (paymentResponse as { status?: string }).status ?? "pending";

    // Save payment
    await prisma.payment.create({
      data: {
        orderId: order.id,
        method: data.paymentMethod,
        status: mpStatus === "approved" ? "APPROVED" : mpStatus === "in_process" ? "IN_PROCESS" : "PENDING",
        amount: subtotal,
        mpPaymentId: String((paymentResponse as { id?: number | string }).id ?? ""),
        pixQrCode,
        pixQrCodeBase64,
        boletoUrl,
        boletoBarcode,
        paidAt: mpStatus === "approved" ? new Date() : null,
        expiresAt: data.paymentMethod === "BOLETO" ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) : null,
      },
    });

    // If approved, create commissions and update stock
    if (mpStatus === "approved") {
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

    return NextResponse.json({
      orderId: order.id,
      pixQrCode,
      pixQrCodeBase64,
      boletoUrl,
      boletoBarcode,
    }, { status: 201 });

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
