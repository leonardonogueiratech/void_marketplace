"use client";

import { useState, useEffect, useCallback } from "react";
import { ConversationList } from "./conversation-list";
import { ChatWindow } from "./chat-window";
import { ArrowLeft, MessageSquare } from "lucide-react";

interface Conversation {
  id: string;
  updatedAt: string;
  other: { id: string; name: string; image: string | null; slug: string | null } | null;
  lastMessage: { content: string; createdAt: string } | null;
  unread: number;
}

interface ChatShellProps {
  currentUserId: string;
  initialConversationId?: string;
}

export function ChatShell({ currentUserId, initialConversationId }: ChatShellProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialConversationId ?? null);

  const fetchConversations = useCallback(async () => {
    const res = await fetch("/api/chat");
    if (!res.ok) return;
    const data = await res.json();
    setConversations(data);
  }, []);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 8000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-2xl border border-[#1e3a5f]/10 overflow-hidden">
      {/* Sidebar */}
      <div className={`w-full md:w-72 shrink-0 border-r border-[#1e3a5f]/8 flex flex-col ${selectedId ? "hidden md:flex" : "flex"}`}>
        <div className="px-5 py-4 border-b border-[#1e3a5f]/8">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4 text-[#1e3a5f]" />
            <h2 className="text-sm font-bold text-[#1e3a5f]">Mensagens</h2>
            {conversations.some((c) => c.unread > 0) && (
              <span className="size-2 rounded-full bg-[#e07b2a]" />
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </div>

      {/* Chat pane */}
      <div className={`flex-1 flex flex-col ${!selectedId ? "hidden md:flex" : "flex"}`}>
        {selectedId && selectedConversation ? (
          <>
            {/* Mobile back */}
            <div className="md:hidden px-4 py-2 border-b border-[#1e3a5f]/8">
              <button
                onClick={() => setSelectedId(null)}
                className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-[#1e3a5f] transition-colors"
              >
                <ArrowLeft className="size-3.5" /> Voltar
              </button>
            </div>
            <ChatWindow
              conversationId={selectedId}
              currentUserId={currentUserId}
              otherName={selectedConversation.other?.name ?? "Usuário"}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <MessageSquare className="size-10 text-neutral-200 mb-3" />
            <p className="text-sm text-neutral-400">Selecione uma conversa para começar</p>
          </div>
        )}
      </div>
    </div>
  );
}
