"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Loader2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: { id: string; name: string | null; image: string | null };
}

interface ChatWindowProps {
  conversationId: string;
  currentUserId: string;
  otherName: string;
}

export function ChatWindow({ conversationId, currentUserId, otherName }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/${conversationId}`);
      if (!res.ok) return;
      const data: Message[] = await res.json();
      setMessages(data);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
    intervalRef.current = setInterval(fetchMessages, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/chat/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text.trim() }),
      });
      if (!res.ok) return;
      const msg: Message = await res.json();
      setMessages((prev) => [...prev, msg]);
      setText("");
    } finally {
      setSending(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-5 animate-spin text-neutral-300" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[#1e3a5f]/8 bg-white shrink-0">
        <p className="text-sm font-semibold text-[#1e3a5f]">{otherName}</p>
        <p className="text-xs text-neutral-400">Conversa privada</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-[#f7f3ed]/40">
        {messages.length === 0 && (
          <p className="text-center text-xs text-neutral-400 mt-8">
            Nenhuma mensagem ainda. Diga olá!
          </p>
        )}
        {messages.map((m) => {
          const isMine = m.senderId === currentUserId;
          return (
            <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMine ? "bg-[#1e3a5f] text-white rounded-br-sm" : "bg-white text-[#1e3a5f] border border-[#1e3a5f]/8 rounded-bl-sm"}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                <p className={`text-xs mt-1 ${isMine ? "text-white/50" : "text-neutral-400"}`}>
                  {formatDateTime(m.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-[#1e3a5f]/8 bg-white shrink-0 flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder={`Mensagem para ${otherName}...`}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-[#1e3a5f]/15 px-3.5 py-2.5 text-sm text-[#1e3a5f] placeholder-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f]/40 transition-all max-h-28 overflow-y-auto"
          style={{ minHeight: "42px" }}
        />
        <button
          onClick={send}
          disabled={!text.trim() || sending}
          className="size-10 rounded-xl bg-[#1e3a5f] text-white flex items-center justify-center hover:bg-[#1e3a5f]/90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </button>
      </div>
    </div>
  );
}
