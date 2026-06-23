import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendReturnDecisionToCustomer } from "@/lib/email";
import { z } from "zod";

const decisionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  note: z.string().max(500).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;

  const artisan = await prisma.artisanProfile.findUnique({ where: { userId: session.user.id } });
  if (!artisan) return NextResponse.json({ error: "Não autorizado." }, { status: 403 });

  try {
    const body = await req.json();
    const data = decisionSchema.parse(body);

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
    if (returnRequest.status !== "PENDING") {
      return NextResponse.json({ error: "Esta solicitação já foi respondida." }, { status: 400 });
    }

    const updated = await prisma.returnRequest.update({
      where: { id },
      data: {
        status: data.action === "approve" ? "APPROVED" : "REJECTED",
        artisanNote: data.note,
      },
    });

    if (returnRequest.customer?.email) {
      void sendReturnDecisionToCustomer({
        to: returnRequest.customer.email,
        customerName: returnRequest.customer.name ?? "Cliente",
        productName: returnRequest.orderItem.product.name,
        approved: data.action === "approve",
        artisanNote: data.note,
      });
    }

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao processar." }, { status: 500 });
  }
}
