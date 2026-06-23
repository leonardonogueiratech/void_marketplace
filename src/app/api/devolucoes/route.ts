import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReturnRequestToArtisan } from "@/lib/email";
import { z } from "zod";

const NOT_LIKED_WINDOW_DAYS = 7;
const DEFECT_WINDOW_DAYS = 30;

const createSchema = z.object({
  orderItemId: z.string(),
  reason: z.enum(["NOT_LIKED", "DEFECTIVE", "DAMAGED", "WRONG_ITEM", "OTHER"]),
  description: z.string().max(1000).optional(),
  photos: z.array(z.string().url()).max(5).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: data.orderItemId },
      include: {
        order: { select: { customerId: true, status: true, deliveredAt: true } },
        product: { select: { name: true } },
        returnRequest: { select: { id: true } },
      },
    });

    if (!orderItem || orderItem.order.customerId !== session.user.id) {
      return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
    }
    if (orderItem.order.status !== "DELIVERED" || !orderItem.order.deliveredAt) {
      return NextResponse.json({ error: "Só é possível solicitar devolução de pedidos entregues." }, { status: 400 });
    }
    if (orderItem.returnRequest) {
      return NextResponse.json({ error: "Já existe uma solicitação de devolução para este item." }, { status: 400 });
    }

    const windowDays = data.reason === "NOT_LIKED" ? NOT_LIKED_WINDOW_DAYS : DEFECT_WINDOW_DAYS;
    const deadline = new Date(orderItem.order.deliveredAt);
    deadline.setDate(deadline.getDate() + windowDays);
    if (new Date() > deadline) {
      return NextResponse.json({ error: `Prazo de ${windowDays} dias após a entrega já passou.` }, { status: 400 });
    }

    const returnRequest = await prisma.returnRequest.create({
      data: {
        orderItemId: orderItem.id,
        customerId: session.user.id,
        artisanId: orderItem.artisanId,
        reason: data.reason,
        description: data.description,
        photos: JSON.stringify(data.photos ?? []),
      },
    });

    const artisan = await prisma.artisanProfile.findUnique({
      where: { id: orderItem.artisanId },
      include: { user: { select: { name: true, email: true } } },
    });

    if (artisan?.user?.email) {
      void sendReturnRequestToArtisan({
        to: artisan.user.email,
        artisanName: artisan.user.name ?? artisan.storeName,
        customerName: session.user.name ?? "Cliente",
        productName: orderItem.product.name,
        reason: data.reason,
        description: data.description,
        orderId: orderItem.orderId,
      });
    }

    return NextResponse.json(returnRequest, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao solicitar devolução." }, { status: 500 });
  }
}
