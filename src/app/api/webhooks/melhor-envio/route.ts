import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TRACKING_EVENT_INFO, verifyMelhorEnvioSignature } from "@/lib/melhor-envio";
import { sendOrderShippedToCustomer, sendOrderDeliveredToCustomer } from "@/lib/email";

// Status a partir dos quais SHIPPED/DELIVERED automáticos ainda podem ser aplicados —
// evita que um webhook atrasado regrida um pedido já cancelado/estornado/entregue.
const SHIPPABLE_FROM = new Set(["PAID", "PROCESSING", "SHIPPED"]);
const DELIVERABLE_FROM = new Set(["PAID", "PROCESSING", "SHIPPED"]);

interface MelhorEnvioWebhookPayload {
  event?: string;
  data?: {
    id?: string;
    tracking?: string | null;
  };
}

// Melhor Envio exige resposta rápida (timeout de 6s) e faz retry em caso de erro —
// por isso este handler sempre responde 200 depois de persistir o evento, mesmo
// quando o pedido correspondente não é encontrado (etiqueta gerada fora do app).
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-me-signature");

  if (!verifyMelhorEnvioSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
  }

  let payload: MelhorEnvioWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const { event, data } = payload;
  const info = event ? TRACKING_EVENT_INFO[event] : undefined;
  if (!info || !data?.id) {
    return NextResponse.json({ ok: true });
  }

  const order = await prisma.order.findFirst({
    where: { melhorEnvioOrderId: data.id },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { include: { artisan: { select: { storeName: true } } } } } },
    },
  });
  if (!order) {
    return NextResponse.json({ ok: true });
  }

  await prisma.trackingEvent.create({
    data: { orderId: order.id, status: event!, description: info.description },
  });

  const updateData: { trackingStatus: string; trackingUpdatedAt: Date; trackingCode?: string; status?: "SHIPPED" | "DELIVERED"; deliveredAt?: Date } = {
    trackingStatus: event!,
    trackingUpdatedAt: new Date(),
  };
  if (data.tracking) updateData.trackingCode = data.tracking;

  let transitioned: "SHIPPED" | "DELIVERED" | null = null;
  if (info.orderStatus === "SHIPPED" && SHIPPABLE_FROM.has(order.status) && order.status !== "SHIPPED") {
    updateData.status = "SHIPPED";
    transitioned = "SHIPPED";
  } else if (info.orderStatus === "DELIVERED" && DELIVERABLE_FROM.has(order.status)) {
    updateData.status = "DELIVERED";
    updateData.deliveredAt = new Date();
    transitioned = "DELIVERED";
  }

  await prisma.order.update({ where: { id: order.id }, data: updateData });

  const customerEmail = order.user?.email;
  const customerName = order.user?.name ?? "Cliente";
  const storeName = order.items[0]?.product.artisan.storeName ?? "Artesão";
  const trackingCode = updateData.trackingCode ?? order.trackingCode;

  if (customerEmail) {
    if (transitioned === "SHIPPED" && trackingCode) {
      void sendOrderShippedToCustomer({ to: customerEmail, customerName, orderId: order.id, storeName, trackingCode });
    } else if (transitioned === "DELIVERED") {
      void sendOrderDeliveredToCustomer({ to: customerEmail, customerName, orderId: order.id, storeName });
    }
  }

  return NextResponse.json({ ok: true });
}
