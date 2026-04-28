import { auth } from "@/lib/auth";
import { ChatShell } from "@/components/chat/chat-shell";

export default async function DashboardChatPage({
  searchParams,
}: {
  searchParams: Promise<{ conv?: string }>;
}) {
  const session = await auth();
  const { conv } = await searchParams;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Mensagens</h1>
        <p className="text-sm text-neutral-500 mt-1">Converse com seus compradores.</p>
      </div>
      <ChatShell currentUserId={session!.user!.id!} initialConversationId={conv} />
    </div>
  );
}
