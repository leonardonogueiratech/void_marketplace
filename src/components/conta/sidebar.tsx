"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, User, MapPin, MessageCircle } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null };
}

const navItems = [
  { href: "/conta/pedidos", label: "Meus pedidos", icon: ShoppingBag },
  { href: "/conta/perfil", label: "Meus dados", icon: User },
  { href: "/conta/enderecos", label: "Endereços", icon: MapPin },
  { href: "/conta/chat", label: "Mensagens", icon: MessageCircle },
];

export function ContaSidebar({ user }: Props) {
  const pathname = usePathname();

  return (
    <aside className="lg:w-56 shrink-0">
      {/* User card */}
      <div className="bg-white rounded-2xl border border-[#1e3a5f]/10 p-4 mb-3 flex items-center gap-3">
        <div className="size-10 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden">
          {user.image
            ? <img src={user.image} alt="" className="w-full h-full object-cover" />
            : getInitials(user.name ?? "U")}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#1e3a5f] truncate">{user.name ?? "Usuário"}</p>
          <p className="text-xs text-neutral-400 truncate">{user.email}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="bg-white rounded-2xl border border-[#1e3a5f]/10 overflow-hidden">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors border-b border-[#1e3a5f]/6 last:border-0 ${
                active
                  ? "bg-[#1e3a5f]/6 text-[#1e3a5f] font-semibold"
                  : "text-neutral-500 hover:text-[#1e3a5f] hover:bg-[#1e3a5f]/4"
              }`}
            >
              <Icon className="size-4 shrink-0" />
              {label}
              {active && <span className="ml-auto w-1 h-4 rounded-full bg-[#e07b2a]" />}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
