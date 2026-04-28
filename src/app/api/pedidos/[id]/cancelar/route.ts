import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CANCELLABLE = ["PENDING", "PAYMENT_PENDING"];

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    select: { id: true, customerId: true, status: true },
  });

  if (!order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  if (order.customerId !== session.user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  if (!CANCELLABLE.includes(order.status)) {
    return NextResponse.json(
      { error: "Este pedido não pode ser cancelado. Apenas pedidos pendentes ou aguardando pagamento podem ser cancelados." },
      { status: 400 }
    );
  }

  await prisma.order.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({ ok: true });
}
