"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, Search, Menu, X, User, LogOut, Store, ShieldCheck, ExternalLink } from "lucide-react";
import { useState, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useUnreadChat } from "@/hooks/use-unread-chat";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/layout/logo";

const navLinks = [
  { href: "/produtos", label: "Produtos" },
  { href: "/artesaos", label: "Artesãos" },
  { href: "/categorias", label: "Categorias" },
  { href: "/sobre", label: "Sobre" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const itemCount = useCartStore((s) => s.items.reduce((a, i) => a + i.quantity, 0));
  const hasUnreadChat = useUnreadChat();

  function handleSearch(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = searchRef.current?.value.trim();
    if (q) {
      router.push(`/produtos?q=${encodeURIComponent(q)}`);
      setSearchOpen(false);
    }
  }

  function openSearch() {
    setSearchOpen(true);
    setTimeout(() => searchRef.current?.focus(), 50);
  }

  return (
    <header className="sticky top-0 z-50 bg-brand-cream/95 backdrop-blur border-b border-brand-navy/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-18 lg:h-20 gap-4">

          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center" onClick={() => setMobileOpen(false)}>
            {/* Ícone apenas no mobile */}
            <Logo iconOnly className="w-9 h-9 sm:hidden" />
            {/* Selo completo a partir de sm */}
            <Logo variant="navy" className="hidden sm:flex text-[15px] md:text-[17px]" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    active
                      ? "text-brand-navy bg-brand-navy/8"
                      : "text-brand-navy/60 hover:text-brand-navy hover:bg-brand-navy/5"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#c1652e] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop search bar */}
          <form
            onSubmit={handleSearch}
            className={`hidden md:flex items-center transition-all duration-200 ${searchOpen ? "flex-1 max-w-xs" : "w-auto"}`}
          >
            {searchOpen ? (
              <div className="flex items-center w-full gap-1 bg-white border border-brand-navy/15 rounded-full px-3 py-1.5">
                <Search className="size-4 text-brand-navy/50 shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Buscar produtos..."
                  className="flex-1 bg-transparent text-sm text-brand-navy placeholder:text-brand-navy/35 outline-none"
                  onBlur={() => setSearchOpen(false)}
                />
                <button type="submit" className="text-xs text-brand-navy/60 font-medium hover:text-brand-navy">
                  Buscar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openSearch}
                className="flex items-center gap-2 text-sm text-brand-navy/50 bg-white border border-brand-navy/12 rounded-full px-3 py-1.5 hover:bg-brand-navy/5 hover:border-brand-navy/20 transition-colors"
              >
                <Search className="size-4 text-brand-navy/50" />
                <span className="hidden lg:inline text-xs text-brand-navy/50">Buscar...</span>
              </button>
            )}
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Mobile search */}
            <Button variant="ghost" size="icon" className="md:hidden hover:bg-brand-navy/5" asChild>
              <Link href="/produtos?q=">
                <Search className="size-5 text-brand-navy" />
              </Link>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative hover:bg-brand-navy/5" asChild>
              <Link href="/carrinho">
                <ShoppingBag className="size-5 text-brand-navy" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 size-5 flex items-center justify-center p-0 text-xs bg-[#c1652e] hover:bg-[#c1652e]">
                    {itemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User menu */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-brand-navy/5">
                    <Avatar className="size-8 ring-2 ring-brand-navy/15">
                      <AvatarImage src={session.user.image ?? undefined} />
                      <AvatarFallback className="text-xs bg-brand-navy/10 text-brand-navy">
                        {getInitials(session.user.name ?? "U")}
                      </AvatarFallback>
                    </Avatar>
                    {hasUnreadChat && (
                      <span
                        title="Você tem mensagens não lidas"
                        className="absolute top-0 right-0 size-2.5 rounded-full bg-[#c1652e] ring-2 ring-brand-cream"
                      />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-semibold text-[#071a33]">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                  </div>
                  <DropdownMenuItem asChild className="mt-1">
                    <Link href="/conta/perfil">
                      <User className="mr-2 size-4 text-[#7c9f61]" /> Minha Conta
                    </Link>
                  </DropdownMenuItem>
                  {(session.user.role === "ARTISAN" || session.user.role === "ADMIN") && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <Store className="mr-2 size-4 text-[#7c9f61]" /> Minha Loja
                        {hasUnreadChat && (
                          <span
                            title="Você tem mensagens não lidas"
                            className="ml-auto size-2 rounded-full bg-[#c1652e]"
                          />
                        )}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {session.user.role === "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <ShieldCheck className="mr-2 size-4 text-[#7c9f61]" /> Administrador
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="mr-2 size-4" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                size="sm"
                className="bg-brand-navy hover:bg-[#051224] text-white rounded-full px-5 hidden sm:flex"
              >
                <Link href="/login">Entrar</Link>
              </Button>
            )}

            {/* Mobile toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-brand-navy/5"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="size-5 text-brand-navy" /> : <Menu className="size-5 text-brand-navy" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-brand-navy/10 bg-brand-cream">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="px-4 pt-3 pb-1">
            <div className="flex items-center gap-2 bg-white border border-brand-navy/12 rounded-full px-3 py-2">
              <Search className="size-4 text-brand-navy/45 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Buscar produtos..."
                className="flex-1 bg-transparent text-sm text-brand-navy placeholder:text-brand-navy/35 outline-none"
              />
            </div>
          </form>

          <nav className="flex flex-col px-4 py-2 gap-0.5">
            {navLinks.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`py-2.5 px-3 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? "text-brand-navy bg-brand-navy/8"
                      : "text-brand-navy/60 hover:text-brand-navy hover:bg-brand-navy/5"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {!session && (
            <div className="px-4 pb-4 pt-2 border-t border-brand-navy/10 mt-2">
              <Button asChild className="w-full bg-brand-navy hover:bg-[#051224] text-white">
                <Link href="/login" onClick={() => setMobileOpen(false)}>Entrar</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
