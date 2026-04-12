import Link from "next/link";
import { ExternalLink, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-3">
              <img src="/logo.svg" alt="Feito de Gente" className="h-14 w-auto" />
            </div>
            <p className="text-sm leading-relaxed">
              Conectamos artesãos e clientes que valorizam o feito à mão,
              o consumo afetivo e a sustentabilidade.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                <ExternalLink className="size-5" />
              </a>
              <a
                href="https://wa.me"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                <MessageCircle className="size-5" />
              </a>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h4 className="font-semibold text-white mb-4">Marketplace</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/produtos" className="hover:text-white transition-colors">Produtos</Link></li>
              <li><Link href="/artesaos" className="hover:text-white transition-colors">Artesãos</Link></li>
              <li><Link href="/categorias" className="hover:text-white transition-colors">Categorias</Link></li>
              <li><Link href="/destaques" className="hover:text-white transition-colors">Destaques</Link></li>
            </ul>
          </div>

          {/* Para Artesãos */}
          <div>
            <h4 className="font-semibold text-white mb-4">Para Artesãos</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/seja-artesao" className="hover:text-white transition-colors">Seja um Artesão</Link></li>
              <li><Link href="/planos" className="hover:text-white transition-colors">Planos e Preços</Link></li>
              <li><Link href="/guia-vendedor" className="hover:text-white transition-colors">Guia do Vendedor</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Meu Dashboard</Link></li>
            </ul>
          </div>

          {/* Ajuda */}
          <div>
            <h4 className="font-semibold text-white mb-4">Ajuda</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/sobre" className="hover:text-white transition-colors">Sobre Nós</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">Perguntas Frequentes</Link></li>
              <li><Link href="/contato" className="hover:text-white transition-colors">Contato</Link></li>
              <li><Link href="/politica-de-privacidade" className="hover:text-white transition-colors">Privacidade</Link></li>
              <li><Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-700 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} Feito de Gente. Todos os direitos reservados.</p>
          <p>Feito com ❤ para valorizar o artesanato brasileiro</p>
        </div>
      </div>
    </footer>
  );
}
