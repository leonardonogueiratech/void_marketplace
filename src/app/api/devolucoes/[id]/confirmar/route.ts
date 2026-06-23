import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReturnReceivedToCustomer } from "@/lib/email";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;

  const artisan = await prisma.artisanProfile.findUnique({ where: { userId: session.user.id } });
  if (!artisan) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });

  const returnRequest = await prisma.returnRequest.findUnique({
    where: { id },
    include: {
      customer: { select: { name: true, email: true } },
      orderItem: { include: { product: { select: { name: true } } } },
    },
  });
  if (!returnRequest || returnRequest.artisanId !== artisan.id) {
    return NextResponse.json({ error: "Solicitação não encontrada." }, { status: 404 });
  }
  if (returnRequest.status !== "APPROVED" && returnRequest.status !== "SHIPPED_BACK") {
    return NextResponse.json({ error: "Esta devolução não está aguardando recebimento." }, { status: 400 });
  }

  const updated = await prisma.returnRequest.update({
    where: { id },
    data: { status: "RECEIVED", receivedAt: new Date() },
  });

  if (returnRequest.customer?.email) {
    void sendReturnReceivedToCustomer({
      to: returnRequest.customer.email,
      customerName: returnRequest.customer.name ?? "Cliente",
      productName: returnRequest.orderItem.product.name,
    });
  }

  return NextResponse.json(updated);
}
