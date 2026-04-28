import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendOrderShippedToCustomer, sendOrderDeliveredToCustomer } from "@/lib/email";

const statusSchema = z.object({
  status: z.enum([
    "PENDING", "PAYMENT_PENDING", "PAID", "PROCESSING",
    "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED",
  ]),
  trackingCode: z.string().optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  try {
    const body = await req.json();
    const { status, trackingCode } = statusSchema.parse(body);
    const { id } = await context.params;

    const artisan = await prisma.artisanProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, storeName: true },
    });
    if (!artisan) return NextResponse.json({ error: "Artesão não encontrado." }, { status: 404 });

    const orderItem = await prisma.orderItem.findFirst({
      where: { orderId: id, artisanId: artisan.id },
    });
    if (!orderItem) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });

    const updateData: Record<string, unknown> = { status };
    if (status === "SHIPPED" && trackingCode?.trim()) {
      updateData.trackingCode = trackingCode.trim();
    }
    if (status === "DELIVERED") {
      updateData.deliveredAt = new Date();
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    // fire-and-forget emails
    const customerEmail = order.user?.email;
    const customerName = order.user?.name ?? "Cliente";

    if (customerEmail) {
      if (status === "SHIPPED" && trackingCode?.trim()) {
        void sendOrderShippedToCustomer({
          to: customerEmail,
          customerName,
          orderId: order.id,
          storeName: artisan.storeName,
          trackingCode: trackingCode.trim(),
        });
      } else if (status === "DELIVERED") {
        void sendOrderDeliveredToCustomer({
          to: customerEmail,
          customerName,
          orderId: order.id,
          storeName: artisan.storeName,
        });
      }
    }

    return NextResponse.json({ id: order.id, status: order.status, trackingCode: order.trackingCode });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Erro ao atualizar pedido." }, { status: 500 });
  }
}
