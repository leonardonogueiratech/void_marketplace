"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, User, MapPin, MessageCircle, Store } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { useUnreadChat } from "@/hooks/use-unread-chat";

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null };
  role?: string;
}

const navItems = [
  { href: "/conta/pedidos", label: "Meus pedidos", icon: ShoppingBag },
  { href: "/conta/perfil", label: "Meus dados", icon: User },
  { href: "/conta/enderecos", label: "Endereços", icon: MapPin },
  { href: "/conta/chat", label: "Mensagens", icon: MessageCircle },
];

export function ContaSidebar({ user, role }: Props) {
  const pathname = usePathname();
  const hasUnreadChat = useUnreadChat();

  return (
    <aside className="lg:w-56 shrink-0">
      {/* User card */}
      <div className="bg-white rounded-2xl border border-[#071a33]/10 p-4 mb-3 flex items-center gap-3">
        <div className="size-10 rounded-full bg-[#071a33] text-white flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden">
          {user.image
            ? <img src={user.image} alt="" className="w-full h-full object-cover" />
            : getInitials(user.name ?? "U")}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#071a33] truncate">{user.name ?? "Usuário"}</p>
          <p className="text-xs text-neutral-400 truncate">{user.email}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="bg-white rounded-2xl border border-[#071a33]/10 overflow-hidden">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors border-b border-[#071a33]/6 last:border-0 ${
                active
                  ? "bg-[#071a33]/6 text-[#071a33] font-semibold"
                  : "text-neutral-500 hover:text-[#071a33] hover:bg-[#071a33]/4"
              }`}
            >
              <Icon className="size-4 shrink-0" />
              {label}
              {href === "/conta/chat" && hasUnreadChat && !active && (
                <span
                  title="Você tem mensagens não lidas"
                  className="ml-auto size-2 rounded-full bg-[#c1652e]"
                />
              )}
              {active && <span className="ml-auto w-1 h-4 rounded-full bg-[#c1652e]" />}
            </Link>
          );
        })}
      </nav>

      {/* Become artisan CTA */}
      {role === "CUSTOMER" && (
        <Link
          href="/conta/seja-artesao"
          className="mt-3 flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-dashed border-[#c1652e]/40 bg-[#c1652e]/4 hover:bg-[#c1652e]/8 hover:border-[#c1652e]/60 transition-all group"
        >
          <div className="size-7 rounded-lg bg-[#c1652e]/10 flex items-center justify-center shrink-0 group-hover:bg-[#c1652e]/20 transition-colors">
            <Store className="size-4 text-[#c1652e]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#c1652e] leading-tight">Quero ser artesão</p>
            <p className="text-xs text-neutral-400 leading-tight">Abra sua loja</p>
          </div>
        </Link>
      )}
    </aside>
  );
}
