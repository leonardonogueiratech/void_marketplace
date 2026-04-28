import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddressManager } from "./address-manager";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Endereços — Feito de Gente" };

export default async function ContaEnderecosPage() {
  const session = await auth();
  const addresses = await prisma.address.findMany({
    where: { userId: session!.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Endereços</h1>
        <p className="text-sm text-neutral-500 mt-1">Gerencie seus endereços de entrega.</p>
      </div>
      <AddressManager initialAddresses={addresses} />
    </div>
  );
}
