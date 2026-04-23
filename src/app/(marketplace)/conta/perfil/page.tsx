import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./profile-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Meus dados — Feito de Gente" };

export default async function ContaPerfilPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    select: { id: true, name: true, email: true, phone: true, createdAt: true },
  });
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Meus dados</h1>
        <p className="text-sm text-neutral-500 mt-1">Informações da sua conta de comprador.</p>
      </div>
      <ProfileForm user={user} />
    </div>
  );
}
