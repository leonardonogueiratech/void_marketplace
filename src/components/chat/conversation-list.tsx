"use client";

import { formatDateTime } from "@/lib/utils";
import { MessageCircle } from "lucide-react";

interface Conversation {
  id: string;
  updatedAt: string;
  other: { id: string; name: string; image: string | null; slug: string | null } | null;
  lastMessage: { content: string; createdAt: string } | null;
  unread: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <MessageCircle className="size-8 text-neutral-200 mb-3" />
        <p className="text-sm text-neutral-400">Nenhuma conversa ainda.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#1e3a5f]/6">
      {conversations.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={`w-full text-left px-4 py-3.5 hover:bg-[#f7f3ed]/60 transition-colors ${selectedId === c.id ? "bg-[#f7f3ed]" : ""}`}
        >
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-[#1e3a5f] text-white text-xs font-bold flex items-center justify-center shrink-0">
              {(c.other?.name ?? "?").slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-sm font-semibold text-[#1e3a5f] truncate">{c.other?.name ?? "Usuário"}</p>
                {c.lastMessage && (
                  <span className="text-xs text-neutral-400 shrink-0 ml-2">{formatDateTime(c.lastMessage.createdAt)}</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-400 truncate">
                  {c.lastMessage?.content ?? "Iniciar conversa"}
                </p>
                {c.unread > 0 && (
                  <span className="ml-2 size-4 rounded-full bg-[#e07b2a] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {c.unread > 9 ? "9+" : c.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
