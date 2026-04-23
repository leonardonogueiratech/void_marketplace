import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  findOrCreateCustomer,
  createAsaasSubscription,
  cancelAsaasSubscription,
} from "@/lib/asaas";
import { SUBSCRIPTION_PRICES } from "@/lib/utils";

const schema = z.object({
  plan: z.enum(["FREE", "BASIC", "PRO"]),
});

function nextMonthDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split("T")[0]!;
}

function periodEnd(): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d;
}

// ─── GET — current subscription ──────────────────────────────────────────────

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId: session.user.id },
    include: { subscription: true },
  });

  if (!artisan) return NextResponse.json({ error: "Artesão não encontrado." }, { status: 404 });

  return NextResponse.json(artisan.subscription);
}

// ─── PATCH — upgrade / downgrade plan ────────────────────────────────────────

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  try {
    const body = await req.json();
    const { plan } = schema.parse(body);

    const artisan = await prisma.artisanProfile.findUnique({
      where: { userId: session.user.id },
      include: { subscription: true },
    });

    if (!artisan) return NextResponse.json({ error: "Artesão não encontrado." }, { status: 404 });

    const current = artisan.subscription;
    if (current?.plan === plan) {
      return NextResponse.json({ error: "Você já está neste plano." }, { status: 400 });
    }

    // Cancel existing paid subscription on Asaas
    if (current?.asaasSubscriptionId && current.plan !== "FREE") {
      await cancelAsaasSubscription(current.asaasSubscriptionId).catch(() => null);
    }

    let asaasSubscriptionId: string | null = current?.asaasSubscriptionId ?? null;
    let currentPeriodStart: Date | null = null;
    let currentPeriodEnd: Date | null = null;

    if (plan !== "FREE") {
      const price = SUBSCRIPTION_PRICES[plan] ?? 0;
      const customerId = await findOrCreateCustomer({
        name: session.user.name ?? artisan.storeName,
        email: session.user.email ?? "",
      });

      const sub = await createAsaasSubscription({
        customerId,
        value: price,
        description: `Plano ${plan} — Feito de Gente`,
        artisanId: artisan.id,
        nextDueDate: nextMonthDate(),
      });

      asaasSubscriptionId = sub.id;
      currentPeriodStart = new Date();
      currentPeriodEnd = periodEnd();
    }

    const updated = await prisma.subscription.upsert({
      where: { artisanId: artisan.id },
      create: {
        artisanId: artisan.id,
        plan,
        status: "ACTIVE",
        asaasSubscriptionId,
        currentPeriodStart,
        currentPeriodEnd,
      },
      update: {
        plan,
        status: "ACTIVE",
        asaasSubscriptionId: plan === "FREE" ? null : asaasSubscriptionId,
        currentPeriodStart: plan === "FREE" ? null : currentPeriodStart,
        currentPeriodEnd: plan === "FREE" ? null : currentPeriodEnd,
        canceledAt: null,
      },
    });

    return NextResponse.json({ ok: true, subscription: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao atualizar plano." }, { status: 500 });
  }
}

// ─── DELETE — cancel subscription ────────────────────────────────────────────

export async function DELETE() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const artisan = await prisma.artisanProfile.findUnique({
    where: { userId: session.user.id },
    include: { subscription: true },
  });

  if (!artisan?.subscription) {
    return NextResponse.json({ error: "Assinatura não encontrada." }, { status: 404 });
  }

  const sub = artisan.subscription;

  if (sub.plan === "FREE") {
    return NextResponse.json({ error: "Plano gratuito não pode ser cancelado." }, { status: 400 });
  }

  if (sub.asaasSubscriptionId) {
    await cancelAsaasSubscription(sub.asaasSubscriptionId).catch(() => null);
  }

  const updated = await prisma.subscription.update({
    where: { artisanId: artisan.id },
    data: {
      plan: "FREE",
      status: "CANCELLED",
      asaasSubscriptionId: null,
      canceledAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, subscription: updated });
}
