"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function useUnreadChat() {
  const { data: session } = useSession();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    async function checkUnread() {
      try {
        const res = await fetch("/api/chat/unread-count");
        const data = await res.json();
        setHasUnread((data.count ?? 0) > 0);
      } catch {
        // ignore
      }
    }
    checkUnread();
    const interval = setInterval(checkUnread, 30000);
    return () => clearInterval(interval);
  }, [session?.user]);

  return hasUnread;
}
