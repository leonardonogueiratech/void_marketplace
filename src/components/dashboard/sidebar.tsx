"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Package, ShoppingBag, DollarSign,
  User, Settings, LogOut, Menu, X, Star, MessageCircle,
  ExternalLink, Store, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";

interface SidebarProps {
  artisan: {
    storeName: string;
    slug: string;
    logoImage?: string | null;
    status: string;
  };
}

const navItems = [
  { href: "/dashboard",               label: "Visão Geral",     icon: LayoutDashboard, exact: true },
  { href: "/dashboard/produtos",      label: "Produtos",        icon: Package },
  { href: "/dashboard/pedidos",       label: "Pedidos",         icon: ShoppingBag },
  { href: "/dashboard/financeiro",    label: "Financeiro",      icon: DollarSign },
  { href: "/dashboard/avaliacoes",    label: "Avaliações",      icon: Star },
  { href: "/dashboard/chat",          label: "Mensagens",       icon: MessageCircle },
  { href: "/dashboard/perfil",        label: "Perfil da Loja",  icon: Store },
  { href: "/dashboard/configuracoes", label: "Configurações",   icon: Settings },
];

const STATUS_COLORS: Record<string, string> = {
  APPROVED:  "bg-green-100 text-green-700",
  PENDING:   "bg-amber-100 text-amber-700",
  REJECTED:  "bg-red-100 text-red-700",
  SUSPENDED: "bg-neutral-100 text-neutral-600",
};

const STATUS_LABELS: Record<string, string> = {
  APPROVED:  "Ativa",
  PENDING:   "Em análise",
  REJECTED:  "Rejeitada",
  SUSPENDED: "Suspensa",
};

export function DashboardSidebar({ artisan }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-border">
        <Link href="/" className="block">
          <img src="/logo.svg" alt="Feito de Gente" className="h-8 w-auto brightness-0" />
        </Link>
      </div>

      {/* Store profile */}
      <div className="px-4 py-4 border-b border-border">
        <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
          Minha Loja
        </p>
        <div className="flex items-center gap-3">
          <Avatar className="size-10 ring-2 ring-[#e07b2a]/20">
            <AvatarImage src={artisan.logoImage ?? undefined} />
            <AvatarFallback className="text-sm bg-[#e07b2a]/10 text-[#e07b2a] font-bold">
              {getInitials(artisan.storeName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate text-[#1e3a5f]">{artisan.storeName}</p>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[artisan.status]}`}>
              {STATUS_LABELS[artisan.status]}
            </span>
          </div>
        </div>
        {/* Ver loja pública */}
        <Link
          href={`/artesao/${artisan.slug}`}
          target="_blank"
          className="mt-2.5 flex items-center gap-1.5 text-xs text-neutral-400 hover:text-[#e07b2a] transition-colors"
        >
          <ExternalLink className="size-3" /> Ver loja pública
        </Link>
      </div>

      {/* Nav items */}
      <div className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#1e3a5f] text-white"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-[#1e3a5f]"
              }`}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </div>

      {/* Minha Conta + Sair */}
      <div className="px-2 py-3 border-t border-border space-y-0.5">
        <Link
          href="/conta/perfil"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-neutral-500 hover:bg-neutral-100 hover:text-[#1e3a5f] transition-colors"
        >
          <User className="size-4" />
          <span>Minha Conta</span>
          <ChevronRight className="size-3 ml-auto" />
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-neutral-500 hover:bg-red-50 hover:text-red-600 w-full transition-colors"
        >
          <LogOut className="size-4" /> Sair
        </button>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 border-r border-border bg-white flex-col sticky top-0 h-screen">
        {nav}
      </aside>

      {/* Mobile toggle */}
      <Button
        variant="outline"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-40"
        onClick={() => setOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      {/* Mobile drawer */}
      {open && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-60 bg-white z-50 flex flex-col lg:hidden shadow-xl">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3"
              onClick={() => setOpen(false)}
            >
              <X className="size-5" />
            </Button>
            {nav}
          </aside>
        </>
      )}
    </>
  );
}
