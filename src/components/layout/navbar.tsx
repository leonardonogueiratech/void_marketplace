"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, Search, Menu, X, User, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";
import { useState, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
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
    <header className="sticky top-0 z-50 bg-[#1e3a5f] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-18 lg:h-20 gap-4">

          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center" onClick={() => setMobileOpen(false)}>
            {/* Ícone apenas no mobile */}
            <img
              src="/logo-icon.svg"
              alt="Feito de Gente"
              className="h-11 w-auto sm:hidden"
            />
            {/* Logo completo a partir de sm */}
            <img
              src="/logo.svg"
              alt="Feito de Gente"
              className="hidden sm:block h-10 md:h-11 lg:h-12 w-auto"
            />
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
                      ? "text-white bg-white/15"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#e07b2a] rounded-full" />
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
              <div className="flex items-center w-full gap-1 bg-white/10 border border-white/20 rounded-full px-3 py-1.5">
                <Search className="size-4 text-white/60 shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Buscar produtos..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
                  onBlur={() => setSearchOpen(false)}
                />
                <button type="submit" className="text-xs text-white/70 font-medium hover:text-white">
                  Buscar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openSearch}
                className="flex items-center gap-2 text-sm text-white/50 bg-white/10 border border-white/15 rounded-full px-3 py-1.5 hover:bg-white/15 hover:border-white/25 transition-colors"
              >
                <Search className="size-4 text-white/60" />
                <span className="hidden lg:inline text-xs text-white/50">Buscar...</span>
              </button>
            )}
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Mobile search */}
            <Button variant="ghost" size="icon" className="md:hidden hover:bg-white/10" asChild>
              <Link href="/produtos?q=">
                <Search className="size-5 text-white" />
              </Link>
            </Button>

            {/* Cart */}
            <Button variant="ghost" size="icon" className="relative hover:bg-white/10" asChild>
              <Link href="/carrinho">
                <ShoppingBag className="size-5 text-white" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 size-5 flex items-center justify-center p-0 text-xs bg-[#e07b2a] hover:bg-[#e07b2a]">
                    {itemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User menu */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                    <Avatar className="size-8 ring-2 ring-white/30">
                      <AvatarImage src={session.user.image ?? undefined} />
                      <AvatarFallback className="text-xs bg-white/20 text-white">
                        {getInitials(session.user.name ?? "U")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-semibold text-[#1e3a5f]">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                  </div>
                  <DropdownMenuItem asChild className="mt-1">
                    <Link href="/conta/perfil">
                      <User className="mr-2 size-4 text-[#27ae60]" /> Minha Conta
                    </Link>
                  </DropdownMenuItem>
                  {session.user.role === "ARTISAN" && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 size-4 text-[#27ae60]" /> Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {session.user.role === "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <ShieldCheck className="mr-2 size-4 text-[#27ae60]" /> Admin
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
                className="bg-white/20 hover:bg-white/30 text-white border border-white/50 hover:border-white rounded-full px-5 hidden sm:flex"
              >
                <Link href="/login">Entrar</Link>
              </Button>
            )}

            {/* Mobile toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-white/10"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="size-5 text-white" /> : <Menu className="size-5 text-white" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#1a3356]">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="px-4 pt-3 pb-1">
            <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-2">
              <Search className="size-4 text-white/50 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Buscar produtos..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
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
                      ? "text-white bg-white/15"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {!session && (
            <div className="px-4 pb-4 pt-2 border-t border-white/10 mt-2">
              <Button asChild className="w-full bg-white/15 hover:bg-white/25 text-white border border-white/20">
                <Link href="/login" onClick={() => setMobileOpen(false)}>Entrar</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
