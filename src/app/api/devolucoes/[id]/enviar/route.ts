import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReturnShippedBackToArtisan } from "@/lib/email";
import { z } from "zod";

const schema = z.object({
  trackingCode: z.string().min(3).max(50),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const returnRequest = await prisma.returnRequest.findUnique({
      where: { id },
      include: {
        artisan: { include: { user: { select: { name: true, email: true } } } },
        orderItem: { include: { product: { select: { name: true } } } },
      },
    });
    if (!returnRequest || returnRequest.customerId !== session.user.id) {
      return NextResponse.json({ error: "Solicitação não encontrada." }, { status: 404 });
    }
    if (returnRequest.status !== "APPROVED") {
      return NextResponse.json({ error: "Esta devolução ainda não foi aprovada." }, { status: 400 });
    }

    const updated = await prisma.returnRequest.update({
      where: { id },
      data: {
        status: "SHIPPED_BACK",
        returnTrackingCode: data.trackingCode.trim(),
        shippedBackAt: new Date(),
      },
    });

    if (returnRequest.artisan?.user?.email) {
      void sendReturnShippedBackToArtisan({
        to: returnRequest.artisan.user.email,
        artisanName: returnRequest.artisan.user.name ?? returnRequest.artisan.storeName,
        productName: returnRequest.orderItem.product.name,
        trackingCode: data.trackingCode.trim(),
      });
    }

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao informar envio." }, { status: 500 });
  }
}
