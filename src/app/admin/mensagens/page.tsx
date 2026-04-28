import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { MessageActions } from "@/components/admin/message-actions";
import { MessageReplyForm } from "@/components/admin/message-reply-form";
import { Mail, MailOpen, CheckCircle2 } from "lucide-react";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: [{ read: "asc" }, { createdAt: "desc" }],
  });

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Mensagens de contato</h1>
        <p className="text-sm text-neutral-500 mt-1">
          {messages.length} mensagem(ns) · {unread} não lida(s).
        </p>
      </div>

      {messages.length === 0 ? (
        <Card className="border-[#1e3a5f]/10">
          <CardContent className="py-12 text-center">
            <Mail className="size-8 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-400">Nenhuma mensagem recebida.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <Card key={m.id} className={`border-[#1e3a5f]/10 transition-all ${!m.read ? "ring-1 ring-[#e07b2a]/25 bg-[#e07b2a]/2" : ""}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${!m.read ? "bg-[#e07b2a]/15" : "bg-neutral-100"}`}>
                      {m.read
                        ? <MailOpen className="size-4 text-neutral-400" />
                        : <Mail className="size-4 text-[#e07b2a]" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-semibold text-[#1e3a5f]">{m.name}</p>
                        <span className="text-xs text-neutral-400">{m.email}</span>
                        {!m.read && (
                          <span className="text-xs bg-[#e07b2a] text-white px-1.5 py-0.5 rounded-full font-bold">Nova</span>
                        )}
                        {m.repliedAt && (
                          <span className="inline-flex items-center gap-1 text-xs bg-[#27ae60]/10 text-[#27ae60] border border-[#27ae60]/20 px-1.5 py-0.5 rounded-full font-semibold">
                            <CheckCircle2 className="size-3" /> Respondida
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-neutral-600 mb-1">{m.subject}</p>
                      <p className="text-sm text-neutral-500 leading-relaxed">{m.message}</p>

                      {/* Resposta já enviada */}
                      {m.reply && (
                        <div className="mt-3 bg-[#1e3a5f]/4 border border-[#1e3a5f]/10 rounded-xl p-3">
                          <p className="text-xs font-semibold text-[#1e3a5f] mb-1">Sua resposta · {m.repliedAt ? formatDate(m.repliedAt) : ""}</p>
                          <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">{m.reply}</p>
                        </div>
                      )}

                      <p className="text-xs text-neutral-300 mt-2">{formatDate(m.createdAt)}</p>

                      {/* Form de resposta */}
                      <MessageReplyForm id={m.id} hasReply={!!m.reply} />
                    </div>
                  </div>
                  <MessageActions id={m.id} read={m.read} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
