import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gerarEtiqueta, getLabelDownloadUrl, calcularFrete, cepByState } from "@/lib/melhor-envio";
import { sendReturnShippedBackToArtisan } from "@/lib/email";

// Gera automaticamente uma etiqueta de devolução (cliente → artesão) via Melhor Envio,
// escolhendo a transportadora mais barata disponível entre as habilitadas pelo artesão.
// Complementa (não substitui) o fluxo manual de informar código de rastreio em /enviar.
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;

  try {
    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id },
      include: {
        artisan: { include: { user: { select: { name: true, email: true } } } },
        orderItem: {
          include: {
            product: { select: { name: true, weight: true } },
            order: {
              include: {
                user: { select: { name: true, email: true, phone: true } },
                customer: true,
              },
            },
          },
        },
      },
    });

    if (!returnRequest || returnRequest.customerId !== session.user.id) {
      return NextResponse.json({ error: "Solicitação não encontrada." }, { status: 404 });
    }
    if (returnRequest.status !== "APPROVED") {
      return NextResponse.json({ error: "Esta devolução ainda não foi aprovada pelo artesão." }, { status: 400 });
    }

    const order = returnRequest.orderItem.order;
    if (!order.customer) {
      return NextResponse.json({ error: "Endereço do pedido não encontrado." }, { status: 400 });
    }
    if (!returnRequest.artisan.cpfCnpj) {
      return NextResponse.json(
        { error: "O artesão ainda não cadastrou CPF/CNPJ, exigido pelo Melhor Envio para gerar a etiqueta." },
        { status: 400 }
      );
    }

    const artisanCep = returnRequest.artisan.zipCode
      ? returnRequest.artisan.zipCode.replace(/\D/g, "")
      : cepByState(returnRequest.artisan.state ?? "SP");

    const weight = Math.max(
      returnRequest.orderItem.quantity * (returnRequest.orderItem.product.weight ?? 0.3),
      0.1
    );

    const options = await calcularFrete({
      originUf: order.customer.state,
      destinationCep: artisanCep,
      weight,
      allowedCarriers: returnRequest.artisan.enabledCarriers,
    });
    if (!options.length) {
      return NextResponse.json(
        { error: "Nenhuma transportadora disponível para esta rota de devolução." },
        { status: 400 }
      );
    }

    const result = await gerarEtiqueta({
      serviceId: Number(options[0].id),
      from: {
        name: order.user.name ?? "Cliente",
        email: order.user.email,
        phone: order.user.phone ?? undefined,
        number: order.customer.number,
        postalCode: order.customer.zipCode,
        street: order.customer.street,
        district: order.customer.district,
        city: order.customer.city,
        state: order.customer.state,
        complement: order.customer.complement ?? undefined,
      },
      to: {
        name: returnRequest.artisan.storeName,
        email: returnRequest.artisan.user?.email ?? "",
        phone: returnRequest.artisan.whatsapp ?? undefined,
        document: returnRequest.artisan.cpfCnpj,
        number: returnRequest.artisan.addressNumber || "S/N",
        postalCode: artisanCep,
      },
      products: [{
        name: returnRequest.orderItem.product.name,
        quantity: returnRequest.orderItem.quantity,
        unitaryValue: returnRequest.orderItem.unitPrice,
      }],
      volume: { height: 10, width: 15, length: 20, weight },
      insuranceValue: returnRequest.orderItem.totalPrice,
      reverse: true,
    });

    const updated = await prisma.returnRequest.update({
      where: { id },
      data: {
        returnLabelUrl: result.labelUrl,
        returnMelhorEnvioOrderId: result.melhorEnvioOrderId,
        ...(result.trackingCode
          ? { returnTrackingCode: result.trackingCode, status: "SHIPPED_BACK", shippedBackAt: new Date() }
          : {}),
      },
    });

    if (result.trackingCode && returnRequest.artisan.user?.email) {
      void sendReturnShippedBackToArtisan({
        to: returnRequest.artisan.user.email,
        artisanName: returnRequest.artisan.user.name ?? returnRequest.artisan.storeName,
        productName: returnRequest.orderItem.product.name,
        trackingCode: result.trackingCode,
      });
    }

    return NextResponse.json({
      ok: true,
      labelUrl: result.labelUrl,
      trackingCode: result.trackingCode,
      status: updated.status,
    });
  } catch (err) {
    console.error("Erro ao gerar etiqueta de devolução:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao gerar etiqueta de devolução." },
      { status: 500 }
    );
  }
}

// O PDF vem de um link assinado da AWS que expira em ~30min — busca um link novo a
// cada download em vez de reaproveitar o salvo em returnLabelUrl.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;

  const returnRequest = await prisma.returnRequest.findUnique({ where: { id } });
  if (!returnRequest || returnRequest.customerId !== session.user.id) {
    return NextResponse.json({ error: "Solicitação não encontrada." }, { status: 404 });
  }
  if (!returnRequest.returnMelhorEnvioOrderId) {
    return NextResponse.json({ error: "Etiqueta ainda não foi gerada para esta devolução." }, { status: 404 });
  }

  const result = await getLabelDownloadUrl(returnRequest.returnMelhorEnvioOrderId);
  if (!result) {
    return NextResponse.json({ error: "Não foi possível obter o link da etiqueta. Tente novamente." }, { status: 502 });
  }

  await prisma.returnRequest.update({ where: { id }, data: { returnLabelUrl: result.url } });

  return NextResponse.json({ ok: true, labelUrl: result.url });
}
