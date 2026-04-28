"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageCircle, Loader2 } from "lucide-react";

interface Props {
  artisanUserId: string;
  artisanName: string;
  isLoggedIn: boolean;
}

export function ContactArtisanButton({ artisanUserId, artisanName, isLoggedIn }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!isLoggedIn) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otherUserId: artisanUserId }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error("Erro ao abrir conversa."); return; }
      router.push(`/conta/chat?conv=${data.id}`);
    } catch {
      toast.error("Erro ao abrir conversa.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="w-full inline-flex items-center justify-center gap-2 border border-[#1e3a5f]/20 text-[#1e3a5f] font-semibold text-sm px-6 py-3 rounded-xl hover:bg-[#1e3a5f]/5 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : <MessageCircle className="size-4" />}
      Falar com {artisanName}
    </button>
  );
}
