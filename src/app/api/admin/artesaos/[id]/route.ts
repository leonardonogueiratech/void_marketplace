import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendArtisanApproved, sendArtisanRejected } from "@/lib/email";
import { createArtisanAccount } from "@/lib/asaas";

const schema = z.object({
  action: z.enum(["approve", "reject", "suspend"]),
  reason: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { action, reason } = schema.parse(body);

    const statusMap = { approve: "APPROVED", reject: "REJECTED", suspend: "SUSPENDED" } as const;

    const artisan = await prisma.artisanProfile.update({
      where: { id },
      data: {
        status: statusMap[action],
        ...(action === "reject" && reason ? { rejectedNote: reason } : {}),
      },
      include: { user: { select: { name: true, email: true } } },
    });

    // create Asaas subconta on approval (fire-and-forget, non-blocking)
    if (action === "approve" && artisan.cpfCnpj && !artisan.asaasAccountId) {
      void (async () => {
        try {
          const { accountId, walletId } = await createArtisanAccount({
            name: artisan.user?.name ?? artisan.storeName,
            email: artisan.user?.email ?? "",
            cpfCnpj: artisan.cpfCnpj!,
            mobilePhone: artisan.whatsapp ?? undefined,
          });
          await prisma.artisanProfile.update({
            where: { id },
            data: { asaasAccountId: accountId, asaasWalletId: walletId },
          });
        } catch (e) {
          console.error("Asaas subconta creation failed:", e);
        }
      })();
    }

    // fire-and-forget email
    const email = artisan.user?.email;
    const name = artisan.user?.name ?? artisan.storeName;
    if (email) {
      if (action === "approve") {
        void sendArtisanApproved({ to: email, artisanName: name, storeName: artisan.storeName });
      } else if (action === "reject") {
        void sendArtisanRejected({ to: email, artisanName: name, storeName: artisan.storeName, reason });
      }
    }

    return NextResponse.json({ ok: true, artisan });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro ao atualizar." }, { status: 500 });
  }
}
