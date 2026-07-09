import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { gerarEtiqueta, getLabelDownloadUrl } from "@/lib/melhor-envio";
import { cepByState } from "@/lib/melhor-envio";

const schema = z.object({
  serviceId: z.number().int().positive(),
  weight: z.number().positive(),
  height: z.number().positive(),
  width: z.number().positive(),
  length: z.number().positive(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id: orderId } = await params;

  try {
    const body = await req.json();
    const data = schema.parse(body);

    // Load artisan profile
    const artisan = await prisma.artisanProfile.findUnique({
      where: { userId: session.user.id },
      include: { user: { select: { name: true, email: true } } },
    });
    if (!artisan) {
      return NextResponse.json({ error: "Perfil de artesão não encontrado." }, { status: 404 });
    }

    // Load order with items and buyer address — must belong to this artisan
    const orderItem = await prisma.orderItem.findFirst({
      where: { artisanId: artisan.id, orderId },
    });
    if (!orderItem) {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { name: true, email: true, phone: true, cpfCnpj: true } },
        customer: true,
        items: {
          where: { artisanId: artisan.id },
          include: { product: { select: { name: true } } },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }

    if (!order.customer) {
      return NextResponse.json({ error: "Endereço de entrega não encontrado no pedido." }, { status: 400 });
    }

    if (!order.user.cpfCnpj) {
      return NextResponse.json({ error: "Cliente não possui CPF/CNPJ cadastrado, exigido pelo Melhor Envio para gerar a etiqueta." }, { status: 400 });
    }

    // Resolve origin CEP
    const fromPostalCode = artisan.zipCode
      ? artisan.zipCode.replace(/\D/g, "")
      : cepByState(artisan.state ?? "SP");

    const insuranceValue = order.items.reduce((s, i) => s + i.totalPrice, 0);

    const result = await gerarEtiqueta({
      serviceId: data.serviceId,
      from: {
        name: artisan.user?.name ?? artisan.storeName,
        email: artisan.user?.email ?? "",
        phone: artisan.whatsapp ?? undefined,
        number: artisan.addressNumber || "S/N",
        postalCode: fromPostalCode,
      },
      to: {
        name: order.user.name ?? "Cliente",
        email: order.user.email,
        phone: order.user.phone ?? undefined,
        document: order.user.cpfCnpj,
        street: order.customer.street,
        number: order.customer.number,
        complement: order.customer.complement ?? undefined,
        district: order.customer.district,
        city: order.customer.city,
        state: order.customer.state,
        postalCode: order.customer.zipCode,
      },
      products: order.items.map((i) => ({
        name: i.product.name,
        quantity: i.quantity,
        unitaryValue: i.unitPrice,
      })),
      volume: {
        height: data.height,
        width: data.width,
        length: data.length,
        weight: data.weight,
      },
      insuranceValue,
    });

    // Save label info and update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        melhorEnvioOrderId: result.melhorEnvioOrderId,
        labelUrl: result.labelUrl,
        ...(result.trackingCode ? { trackingCode: result.trackingCode, status: "SHIPPED" } : {}),
      },
    });

    return NextResponse.json({
      ok: true,
      labelUrl: result.labelUrl,
      trackingCode: result.trackingCode,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
    }
    console.error("Erro ao gerar etiqueta:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar etiqueta." },
      { status: 500 }
    );
  }
}

// O PDF da etiqueta vem de um link assinado da AWS que expira em ~30min — busca um
// link novo a cada download em vez de reaproveitar o salvo em Order.labelUrl.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { id: orderId } = await params;

  const artisan = await prisma.artisanProfile.findUnique({ where: { userId: session.user.id } });
  if (!artisan) {
    return NextResponse.json({ error: "Perfil de artesão não encontrado." }, { status: 404 });
  }

  const orderItem = await prisma.orderItem.findFirst({ where: { artisanId: artisan.id, orderId } });
  if (!orderItem) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order?.melhorEnvioOrderId) {
    return NextResponse.json({ error: "Etiqueta ainda não foi gerada para este pedido." }, { status: 404 });
  }

  const result = await getLabelDownloadUrl(order.melhorEnvioOrderId);
  if (!result) {
    return NextResponse.json({ error: "Não foi possível obter o link da etiqueta. Tente novamente." }, { status: 502 });
  }

  await prisma.order.update({ where: { id: orderId }, data: { labelUrl: result.url } });

  return NextResponse.json({ ok: true, labelUrl: result.url });
}
