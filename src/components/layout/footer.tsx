"use client";

import Link from "next/link";
import { Share2, MessageCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { Logo } from "@/components/layout/logo";

export function Footer() {
  const { data: session } = useSession();
  const isArtisan = session?.user?.role === "ARTISAN";

  return (
    <footer className="bg-[#071a33] text-[#f2ede0]/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <Logo variant="white" className="text-[16px]" />
            </div>
            <p className="text-sm leading-relaxed text-[#f2ede0]/70">
              Conectamos artesãos e clientes que valorizam o feito à mão,
              o consumo afetivo e a sustentabilidade.
            </p>
            <div className="flex gap-4 mt-5">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="size-9 rounded-full border border-[#f2ede0]/20 flex items-center justify-center hover:bg-[#f2ede0]/10 transition-colors"
                aria-label="Redes sociais"
              >
                <Share2 className="size-4 text-[#f2ede0]" />
              </a>
              <a
                href="https://wa.me"
                target="_blank"
                rel="noopener noreferrer"
                className="size-9 rounded-full border border-[#f2ede0]/20 flex items-center justify-center hover:bg-[#f2ede0]/10 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="size-4 text-[#f2ede0]" />
              </a>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h4 className="font-semibold text-[#f2ede0] mb-4 text-sm uppercase tracking-wider">Marketplace</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/produtos" className="hover:text-[#f2ede0] transition-colors">Produtos</Link></li>
              <li><Link href="/artesaos" className="hover:text-[#f2ede0] transition-colors">Artesãos</Link></li>
              <li><Link href="/categorias" className="hover:text-[#f2ede0] transition-colors">Categorias</Link></li>
              <li><Link href="/sobre" className="hover:text-[#f2ede0] transition-colors">Sobre Nós</Link></li>
            </ul>
          </div>

          {/* Para Artesãos */}
          <div>
            <h4 className="font-semibold text-[#f2ede0] mb-4 text-sm uppercase tracking-wider">Para Artesãos</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/seja-artesao" className="hover:text-[#f2ede0] transition-colors">Seja um Artesão</Link></li>
              <li><Link href="/planos" className="hover:text-[#f2ede0] transition-colors">Planos e Preços</Link></li>
              <li><Link href="/guia-vendedor" className="hover:text-[#f2ede0] transition-colors">Guia do Vendedor</Link></li>
              {isArtisan && <li><Link href="/dashboard" className="hover:text-[#f2ede0] transition-colors">Meu Dashboard</Link></li>}
            </ul>
          </div>

          {/* Ajuda */}
          <div>
            <h4 className="font-semibold text-[#f2ede0] mb-4 text-sm uppercase tracking-wider">Ajuda</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/faq" className="hover:text-[#f2ede0] transition-colors">Perguntas Frequentes</Link></li>
              <li><Link href="/contato" className="hover:text-[#f2ede0] transition-colors">Contato</Link></li>
              <li><Link href="/politica-de-privacidade" className="hover:text-[#f2ede0] transition-colors">Privacidade</Link></li>
              <li><Link href="/termos" className="hover:text-[#f2ede0] transition-colors">Termos de Uso</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#f2ede0]/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#f2ede0]/40">
          <p>© {new Date().getFullYear()} Feito de Gente. Todos os direitos reservados.</p>
          <p>Feito com ❤ para valorizar o artesanato brasileiro</p>
        </div>
      </div>
    </footer>
  );
}
