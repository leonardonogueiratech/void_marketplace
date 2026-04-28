import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Mail, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";

export default async function ContactReplyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const msg = await prisma.contactMessage.findUnique({ where: { token } });
  if (!msg) notFound();

  return (
    <div className="min-h-screen bg-[#f7f3ed] py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="size-14 rounded-full bg-[#1e3a5f]/8 flex items-center justify-center mx-auto mb-4">
            <Mail className="size-6 text-[#1e3a5f]" />
          </div>
          <h1 className="text-xl font-bold text-[#1e3a5f]">Sua mensagem de contato</h1>
          <p className="text-sm text-neutral-500 mt-1">Enviada em {formatDate(msg.createdAt)}</p>
        </div>

        <div className="space-y-4">
          {/* Mensagem original */}
          <div className="bg-white rounded-2xl border border-[#1e3a5f]/10 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="size-7 rounded-full bg-[#1e3a5f] text-white text-xs font-bold flex items-center justify-center">
                {msg.name.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1e3a5f]">{msg.name}</p>
                <p className="text-xs text-neutral-400">{msg.email}</p>
              </div>
              <span className="ml-auto text-xs text-neutral-300">{formatDate(msg.createdAt)}</span>
            </div>
            <p className="text-xs font-semibold text-neutral-500 mb-2">{msg.subject}</p>
            <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
          </div>

          {/* Resposta */}
          {msg.reply ? (
            <div className="bg-white rounded-2xl border border-[#27ae60]/15 ring-1 ring-[#27ae60]/10 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="size-7 rounded-lg bg-[#1e3a5f] flex items-center justify-center">
                  <CheckCircle2 className="size-3.5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1e3a5f]">Equipe Feito de Gente</p>
                  <p className="text-xs text-neutral-400">Atendimento</p>
                </div>
                <span className="ml-auto text-xs text-neutral-300">
                  {msg.repliedAt ? formatDate(msg.repliedAt) : ""}
                </span>
              </div>
              <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{msg.reply}</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#1e3a5f]/10 p-5 text-center">
              <Clock className="size-6 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-neutral-500">Aguardando resposta</p>
              <p className="text-xs text-neutral-400 mt-1">
                Nossa equipe responde em até 1 dia útil.
              </p>
            </div>
          )}
        </div>

        {/* Footer links */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-xs text-neutral-400">Tem mais dúvidas?</p>
          <Link
            href="/contato"
            className="inline-block text-sm font-semibold text-[#1e3a5f] underline underline-offset-2 hover:text-[#e07b2a] transition-colors"
          >
            Enviar nova mensagem
          </Link>
        </div>
      </div>
    </div>
  );
}
