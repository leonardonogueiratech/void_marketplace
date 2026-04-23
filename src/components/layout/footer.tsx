import Link from "next/link";
import { Share2, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#1e3a5f] text-[#f7f3ed]/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <img src="/logo.svg" alt="Feito de Gente" className="h-10 w-auto sm:h-12 md:h-14 brightness-0 invert" />
            </div>
            <p className="text-sm leading-relaxed text-[#f7f3ed]/70">
              Conectamos artesãos e clientes que valorizam o feito à mão,
              o consumo afetivo e a sustentabilidade.
            </p>
            <div className="flex gap-4 mt-5">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="size-9 rounded-full border border-[#f7f3ed]/20 flex items-center justify-center hover:bg-[#f7f3ed]/10 transition-colors"
                aria-label="Redes sociais"
              >
                <Share2 className="size-4 text-[#f7f3ed]" />
              </a>
              <a
                href="https://wa.me"
                target="_blank"
                rel="noopener noreferrer"
                className="size-9 rounded-full border border-[#f7f3ed]/20 flex items-center justify-center hover:bg-[#f7f3ed]/10 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="size-4 text-[#f7f3ed]" />
              </a>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h4 className="font-semibold text-[#f7f3ed] mb-4 text-sm uppercase tracking-wider">Marketplace</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/produtos" className="hover:text-[#f7f3ed] transition-colors">Produtos</Link></li>
              <li><Link href="/artesaos" className="hover:text-[#f7f3ed] transition-colors">Artesãos</Link></li>
              <li><Link href="/categorias" className="hover:text-[#f7f3ed] transition-colors">Categorias</Link></li>
              <li><Link href="/sobre" className="hover:text-[#f7f3ed] transition-colors">Sobre Nós</Link></li>
            </ul>
          </div>

          {/* Para Artesãos */}
          <div>
            <h4 className="font-semibold text-[#f7f3ed] mb-4 text-sm uppercase tracking-wider">Para Artesãos</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/seja-artesao" className="hover:text-[#f7f3ed] transition-colors">Seja um Artesão</Link></li>
              <li><Link href="/planos" className="hover:text-[#f7f3ed] transition-colors">Planos e Preços</Link></li>
              <li><Link href="/guia-vendedor" className="hover:text-[#f7f3ed] transition-colors">Guia do Vendedor</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#f7f3ed] transition-colors">Meu Dashboard</Link></li>
            </ul>
          </div>

          {/* Ajuda */}
          <div>
            <h4 className="font-semibold text-[#f7f3ed] mb-4 text-sm uppercase tracking-wider">Ajuda</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/faq" className="hover:text-[#f7f3ed] transition-colors">Perguntas Frequentes</Link></li>
              <li><Link href="/contato" className="hover:text-[#f7f3ed] transition-colors">Contato</Link></li>
              <li><Link href="/politica-de-privacidade" className="hover:text-[#f7f3ed] transition-colors">Privacidade</Link></li>
              <li><Link href="/termos" className="hover:text-[#f7f3ed] transition-colors">Termos de Uso</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#f7f3ed]/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#f7f3ed]/40">
          <p>© {new Date().getFullYear()} Feito de Gente. Todos os direitos reservados.</p>
          <p>Feito com ❤ para valorizar o artesanato brasileiro</p>
        </div>
      </div>
    </footer>
  );
}
