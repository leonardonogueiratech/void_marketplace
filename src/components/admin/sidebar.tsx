"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Users, Store, ShoppingBag,
  MessageSquare, LogOut, ShieldCheck, Tag,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Visão Geral", icon: LayoutDashboard, exact: true },
  { href: "/admin/artesaos", label: "Artesãos", icon: Store },
  { href: "/admin/categorias", label: "Categorias", icon: Tag },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/mensagens", label: "Mensagens", icon: MessageSquare },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 hidden lg:flex flex-col bg-[#1e3a5f] min-h-screen">
      {/* Logo area */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-[#e07b2a] flex items-center justify-center">
            <ShieldCheck className="size-4 text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-bold">Admin</p>
            <p className="text-white/40 text-xs">Feito de Gente</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-white/15 text-white"
                  : "text-white/55 hover:text-white hover:bg-white/8"
              }`}
            >
              <Icon className="size-4 shrink-0" />
              {label}
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#e07b2a]" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/55 hover:text-white hover:bg-white/8 transition-all w-full"
        >
          <LogOut className="size-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
