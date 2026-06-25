import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  findOrCreateCustomer,
  createAsaasSubscription,
  cancelAsaasSubscription,
  tokenizeCreditCard,
} from "@/lib/asaas";
import { SUBSCRIPTION_PRICES } from "@/lib/utils";

const cardSchema = z.object({
  holderName: z.string().min(2),
  number: z.string().min(13),
  expiryMonth: z.string().min(1).max(2),
  expiryYear: z.string().min(4).max(4),
  ccv: z.string().min(3).max(4),
});

const schema = z.object({
  plan: z.enum(["FREE", "BASIC", "PRO"]),
  card: cardSchema.optional(),
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
    const { plan, card } = schema.parse(body);

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
    let cardToken = current?.creditCardToken ?? null;
    let cardLast4 = current?.creditCardLast4 ?? null;
    let cardBrand = current?.creditCardBrand ?? null;

    if (plan !== "FREE") {
      if (!card && !cardToken) {
        return NextResponse.json({ error: "Dados do cartão são obrigatórios para planos pagos." }, { status: 400 });
      }

      const price = SUBSCRIPTION_PRICES[plan] ?? 0;
      const customerId = await findOrCreateCustomer({
        name: session.user.name ?? artisan.storeName,
        email: session.user.email ?? "",
      });

      if (card) {
        try {
          const tokenized = await tokenizeCreditCard({
            customerId,
            card,
            holderInfo: {
              name: session.user.name ?? artisan.storeName,
              email: session.user.email ?? "",
              cpfCnpj: artisan.cpfCnpj ?? undefined,
            },
          });
          cardToken = tokenized.creditCardToken;
          cardLast4 = tokenized.creditCardNumber;
          cardBrand = tokenized.creditCardBrand;
        } catch (e) {
          console.error("Erro ao tokenizar cartão:", e);
          return NextResponse.json({ error: "Não foi possível validar o cartão." }, { status: 400 });
        }
      }

      const sub = await createAsaasSubscription({
        customerId,
        value: price,
        description: `Plano ${plan} — Feito de Gente`,
        artisanId: artisan.id,
        nextDueDate: nextMonthDate(),
        creditCardToken: cardToken!,
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
        creditCardToken: cardToken,
        creditCardLast4: cardLast4,
        creditCardBrand: cardBrand,
      },
      update: {
        plan,
        status: "ACTIVE",
        asaasSubscriptionId: plan === "FREE" ? null : asaasSubscriptionId,
        currentPeriodStart: plan === "FREE" ? null : currentPeriodStart,
        currentPeriodEnd: plan === "FREE" ? null : currentPeriodEnd,
        creditCardToken: plan === "FREE" ? null : cardToken,
        creditCardLast4: plan === "FREE" ? null : cardLast4,
        creditCardBrand: plan === "FREE" ? null : cardBrand,
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
