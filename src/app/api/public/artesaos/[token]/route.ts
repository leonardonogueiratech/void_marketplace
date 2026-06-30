import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendArtisanApproved, sendArtisanRejected } from "@/lib/email";
import { createArtisanAccount } from "@/lib/asaas";
import { activatePaidSubscriptionOnApproval } from "@/lib/subscriptions";
import { z } from "zod";

const schema = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const body = await req.json();
    const { action, reason } = schema.parse(body);

    const existing = await prisma.artisanProfile.findUnique({ where: { approvalToken: token } });
    if (!existing) {
      return NextResponse.json({ error: "Link inválido." }, { status: 404 });
    }
    if (existing.status !== "PENDING") {
      return NextResponse.json({ error: "Este cadastro já foi processado." }, { status: 400 });
    }

    const artisan = await prisma.artisanProfile.update({
      where: { id: existing.id },
      data: {
        status: action === "approve" ? "APPROVED" : "REJECTED",
        approvalToken: null,
        ...(action === "reject" && reason ? { rejectedNote: reason } : {}),
      },
      include: { user: { select: { name: true, email: true } } },
    });

    if (action === "approve" && artisan.cpfCnpj && !artisan.asaasAccountId) {
      void (async () => {
        try {
          const { accountId, walletId, apiKey } = await createArtisanAccount({
            name: artisan.user?.name ?? artisan.storeName,
            email: artisan.user?.email ?? "",
            cpfCnpj: artisan.cpfCnpj!,
            mobilePhone: artisan.whatsapp ?? undefined,
            birthDate: artisan.birthDate ? artisan.birthDate.toISOString().split("T")[0] : undefined,
            postalCode: artisan.zipCode ?? undefined,
            addressNumber: artisan.addressNumber ?? undefined,
            incomeValue: artisan.incomeValue ?? undefined,
          });
          await prisma.artisanProfile.update({
            where: { id: artisan.id },
            data: { asaasAccountId: accountId, asaasWalletId: walletId, asaasApiKey: apiKey },
          });
        } catch (e) {
          console.error("Asaas subconta creation failed:", e);
        }
      })();
    }

    if (action === "approve") {
      activatePaidSubscriptionOnApproval(artisan.id).catch((e) =>
        console.error("Asaas subscription activation failed:", e)
      );
    }

    const email = artisan.user?.email;
    const name = artisan.user?.name ?? artisan.storeName;
    if (email) {
      if (action === "approve") {
        void sendArtisanApproved({ to: email, artisanName: name, storeName: artisan.storeName });
      } else {
        void sendArtisanRejected({ to: email, artisanName: name, storeName: artisan.storeName, reason });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Erro ao processar." }, { status: 500 });
  }
}
