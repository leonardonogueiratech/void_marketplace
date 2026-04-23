import { auth } from "@/lib/auth";
import { ChatShell } from "@/components/chat/chat-shell";

export default async function ContaChatPage({
  searchParams,
}: {
  searchParams: Promise<{ conv?: string }>;
}) {
  const session = await auth();
  const { conv } = await searchParams;

  return (
    <ChatShell currentUserId={session!.user!.id!} initialConversationId={conv} />
  );
}
