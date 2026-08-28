import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { CheckCircle2, XCircle, Clock, Store } from "lucide-react";
import { ArtisanApprovalActions } from "./approval-actions";

export default async function AprovarArtesaoPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const artisan = await prisma.artisanProfile.findUnique({
    where: { approvalToken: token },
    include: { user: { select: { name: true, email: true } }, subscription: true },
  });

  if (!artisan) notFound();

  const planLabel: Record<string, string> = { FREE: "Inicial", BASIC: "Profissional", PRO: "Ateliê" };
  const location = [artisan.city, artisan.state].filter(Boolean).join("/");

  return (
    <div className="min-h-screen bg-[#f2ede0] py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="size-14 rounded-full bg-[#071a33]/8 flex items-center justify-center mx-auto mb-4">
            <Store className="size-6 text-[#071a33]" />
          </div>
          <h1 className="text-xl font-bold uppercase text-[#071a33]">Cadastro de artesão</h1>
          <p className="text-sm text-neutral-500 mt-1">Enviado em {formatDate(artisan.createdAt)}</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#071a33]/10 p-5 mb-5">
          <table className="w-full text-sm">
            <tbody>
              <tr><td className="py-1.5 text-neutral-400 w-28 align-top">Loja</td><td className="py-1.5 font-semibold text-[#071a33]">{artisan.storeName}</td></tr>
              <tr><td className="py-1.5 text-neutral-400 align-top">Nome</td><td className="py-1.5 text-neutral-700">{artisan.user?.name}</td></tr>
              <tr><td className="py-1.5 text-neutral-400 align-top">E-mail</td><td className="py-1.5 text-neutral-700">{artisan.user?.email}</td></tr>
              <tr><td className="py-1.5 text-neutral-400 align-top">Plano</td><td className="py-1.5 text-neutral-700">{planLabel[artisan.subscription?.plan ?? "FREE"]}</td></tr>
              {location && <tr><td className="py-1.5 text-neutral-400 align-top">Local</td><td className="py-1.5 text-neutral-700">{location}</td></tr>}
              {artisan.whatsapp && <tr><td className="py-1.5 text-neutral-400 align-top">WhatsApp</td><td className="py-1.5 text-neutral-700">{artisan.whatsapp}</td></tr>}
              {artisan.cpfCnpj && <tr><td className="py-1.5 text-neutral-400 align-top">CPF/CNPJ</td><td className="py-1.5 text-neutral-700">{artisan.cpfCnpj}</td></tr>}
            </tbody>
          </table>
          {artisan.bio && (
            <div className="mt-3 pt-3 border-t border-neutral-100">
              <p className="text-xs text-neutral-400 mb-1">Sobre</p>
              <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">{artisan.bio}</p>
            </div>
          )}
        </div>

        {artisan.status === "PENDING" ? (
          <ArtisanApprovalActions token={token} />
        ) : (
          <div className="bg-white rounded-2xl border border-neutral-100 p-5 text-center">
            {artisan.status === "APPROVED" ? (
              <>
                <CheckCircle2 className="size-6 text-[#7c9f61] mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#7c9f61]">Este cadastro já foi aprovado</p>
              </>
            ) : artisan.status === "REJECTED" ? (
              <>
                <XCircle className="size-6 text-red-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-red-500">Este cadastro já foi rejeitado</p>
              </>
            ) : (
              <>
                <Clock className="size-6 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-neutral-500">Já processado ({artisan.status})</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
