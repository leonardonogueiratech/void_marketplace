import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, MessageCircle, ShoppingBag, Store, CreditCard, Package, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Perguntas Frequentes — Feito de Gente",
  description: "Tire suas dúvidas sobre compras, vendas, pagamentos e muito mais.",
};

const categories = [
  {
    icon: ShoppingBag,
    color: "#e07b2a",
    label: "Compradores",
    id: "compradores",
    questions: [
      {
        q: "Como faço para comprar no Feito de Gente?",
        a: "É simples: navegue pelas categorias ou use a busca para encontrar o produto que deseja. Clique em 'Adicionar ao carrinho', revise seu pedido e finalize o pagamento. Você receberá um e-mail de confirmação assim que o artesão confirmar o envio.",
      },
      {
        q: "Preciso criar uma conta para comprar?",
        a: "Sim, é necessário criar uma conta gratuita para finalizar a compra. Assim você consegue acompanhar seus pedidos, salvar favoritos e se comunicar com o artesão diretamente pela plataforma.",
      },
      {
        q: "Os produtos são realmente feitos à mão?",
        a: "Sim. Todos os artesãos passam por um processo de aprovação antes de publicar produtos. Verificamos se as peças são de fato autorais e artesanais. Produtos industrializados não são permitidos na plataforma.",
      },
      {
        q: "Posso solicitar um produto personalizado?",
        a: "Muitos artesãos aceitam encomendas personalizadas. Entre em contato diretamente com o artesão pela página do produto ou perfil da loja antes de fazer o pedido. Prazos e condições são combinados entre você e o artesão.",
      },
      {
        q: "Como funciona o prazo de entrega?",
        a: "O prazo varia de acordo com o artesão e a complexidade do produto. Peças feitas sob encomenda podem levar mais tempo. O prazo estimado é sempre exibido na página do produto. Após o envio, você acompanha tudo pelo painel de pedidos.",
      },
      {
        q: "E se eu não ficar satisfeito com o produto?",
        a: "Você tem até 7 dias após o recebimento para solicitar a devolução, conforme o Código de Defesa do Consumidor. Entre em contato com o suporte pelo chat ou e-mail e orientaremos você em cada etapa.",
      },
    ],
  },
  {
    icon: Store,
    color: "#4a7c3f",
    label: "Artesãos",
    id: "artesaos",
    questions: [
      {
        q: "Como me cadastro como artesão?",
        a: "Acesse a página 'Seja um Artesão', escolha seu plano, preencha seus dados e envie o cadastro. Nossa equipe analisará em até 2 dias úteis. Após a aprovação, você já pode publicar seus produtos.",
      },
      {
        q: "Quanto custa vender no Feito de Gente?",
        a: "Temos um plano gratuito para começar, com até 5 produtos. Os planos pagos oferecem mais recursos, maior visibilidade e comissão reduzida. Consulte a página de planos para comparar as opções.",
      },
      {
        q: "Qual é a comissão cobrada por venda?",
        a: "A comissão varia de acordo com o plano escolhido. No plano gratuito ela é maior; nos planos pagos ela é progressivamente menor. Os valores exatos estão detalhados na página de planos e preços.",
      },
      {
        q: "Como recebo o pagamento pelas minhas vendas?",
        a: "O pagamento é processado pela plataforma e repassado para sua conta bancária após a confirmação da entrega pelo cliente. O prazo de repasse é de até 2 dias úteis após a confirmação.",
      },
      {
        q: "Posso vender qualquer tipo de artesanato?",
        a: "Sim, desde que seja produção autoral e artesanal. Aceitamos artesanato em madeira, tecido, cerâmica, couro, papel, bijuteria, crochê, bordado, pintura, e muito mais. Produtos revendidos ou industrializados não são permitidos.",
      },
      {
        q: "Como funciona o envio dos produtos?",
        a: "Você é responsável pelo envio e pode usar os Correios, transportadoras ou entrega própria. Ao cadastrar o produto, informe as opções de envio disponíveis e os prazos. A plataforma facilita a geração de etiquetas em breve.",
      },
      {
        q: "Posso ter mais de uma loja?",
        a: "Cada artesão pode ter um perfil de loja vinculado à sua conta. Se você trabalha com linhas de produtos muito diferentes, recomendamos organizar por categorias dentro da mesma loja para manter a identidade coesa.",
      },
    ],
  },
  {
    icon: CreditCard,
    color: "#1e3a5f",
    label: "Pagamentos",
    id: "pagamentos",
    questions: [
      {
        q: "Quais formas de pagamento são aceitas?",
        a: "Aceitamos cartão de crédito (parcelado em até 12x), PIX e boleto bancário. Todas as transações são processadas com criptografia e segurança.",
      },
      {
        q: "Posso parcelar minha compra?",
        a: "Sim. Compras com cartão de crédito podem ser parceladas em até 12 vezes. O número de parcelas disponíveis pode variar de acordo com o valor do pedido.",
      },
      {
        q: "O pagamento via PIX tem desconto?",
        a: "Alguns artesãos oferecem desconto para pagamentos à vista via PIX. Quando disponível, isso é indicado na página do produto.",
      },
      {
        q: "Meus dados de pagamento estão seguros?",
        a: "Sim. Não armazenamos dados de cartão. Todo o processamento é feito por parceiros certificados PCI-DSS, o padrão de segurança internacional para pagamentos online.",
      },
      {
        q: "Como funciona o reembolso em caso de cancelamento?",
        a: "Em caso de cancelamento antes do envio, o reembolso integral é processado em até 5 dias úteis para cartão de crédito e em até 1 dia útil para PIX. Para boleto, o prazo é de até 10 dias úteis.",
      },
    ],
  },
  {
    icon: Package,
    color: "#e07b2a",
    label: "Pedidos e Envio",
    id: "pedidos",
    questions: [
      {
        q: "Como acompanho meu pedido?",
        a: "Após a confirmação do pagamento, acesse 'Minha Conta > Pedidos' para ver o status em tempo real. Quando o artesão enviar o produto, você receberá o código de rastreamento por e-mail e no painel.",
      },
      {
        q: "O que faço se meu pedido não chegar?",
        a: "Primeiro verifique o código de rastreamento no painel. Se o prazo estiver expirado sem atualizações, entre em contato com o suporte. Temos um processo de mediação para garantir que você receba o produto ou o reembolso.",
      },
      {
        q: "Posso cancelar um pedido após a compra?",
        a: "É possível cancelar enquanto o pedido não tiver sido enviado pelo artesão. Após o envio, o processo é de devolução conforme o prazo legal de 7 dias. Entre em contato com o suporte assim que precisar.",
      },
      {
        q: "O produto chegou danificado. O que faço?",
        a: "Fotografe o produto danificado e a embalagem antes de abrir completamente. Entre em contato com o suporte em até 7 dias do recebimento enviando as fotos. Resolveremos da melhor forma possível.",
      },
    ],
  },
  {
    icon: ShieldCheck,
    color: "#4a7c3f",
    label: "Segurança e Conta",
    id: "seguranca",
    questions: [
      {
        q: "Como crio uma conta no Feito de Gente?",
        a: "Clique em 'Entrar' no menu superior e depois em 'Criar conta'. Preencha seus dados básicos ou entre com sua conta Google. O processo leva menos de 1 minuto.",
      },
      {
        q: "Esqueci minha senha. Como recupero?",
        a: "Na tela de login, clique em 'Esqueci minha senha'. Você receberá um e-mail com o link para redefinição em até 5 minutos. Verifique também a caixa de spam.",
      },
      {
        q: "Meus dados pessoais estão protegidos?",
        a: "Sim. Seguimos a Lei Geral de Proteção de Dados (LGPD). Seus dados são usados apenas para operar a plataforma e nunca são vendidos a terceiros. Consulte nossa Política de Privacidade para mais detalhes.",
      },
      {
        q: "Como reportar um problema ou artesão suspeito?",
        a: "Use o botão 'Reportar' na página do produto ou perfil do artesão. Nossa equipe analisa todos os reportes e toma as medidas necessárias para manter a comunidade segura.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#f7f3ed]">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="bg-[#1e3a5f] py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#a8d5a2] mb-3">Ajuda</p>
          <h1 className="text-4xl font-bold text-[#f7f3ed] mb-4">Perguntas Frequentes</h1>
          <p className="text-[#f7f3ed]/60 text-lg max-w-xl mx-auto">
            Encontre respostas rápidas sobre compras, vendas, pagamentos e muito mais.
          </p>
        </div>
      </div>

      {/* ── Nav de categorias ────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#1e3a5f]/8 sticky top-[calc(3.5rem+2px)] z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {categories.map(({ icon: Icon, label, id, color }) => (
              <a
                key={id}
                href={`#${id}`}
                className="flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-full whitespace-nowrap border border-[#1e3a5f]/12 text-neutral-500 hover:border-[#1e3a5f]/30 hover:text-[#1e3a5f] transition-colors"
              >
                <Icon className="size-3.5" style={{ color }} />
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Conteúdo ─────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {categories.map(({ icon: Icon, color, label, id, questions }) => (
          <section key={id} id={id} className="scroll-mt-32">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="size-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                <Icon className="size-5" style={{ color }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#1e3a5f]">{label}</h2>
                <p className="text-xs text-neutral-400">{questions.length} perguntas</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#1e3a5f]/8 overflow-hidden shadow-sm">
              <Accordion className="divide-y divide-[#1e3a5f]/6">
                {questions.map((item, i) => (
                  <AccordionItem key={i} value={`${id}-${i}`} className="border-none">
                    <AccordionTrigger className="px-6 py-4 text-left text-sm font-semibold text-[#1e3a5f] hover:text-[#1e3a5f] hover:no-underline hover:bg-[#f7f3ed]/60 transition-colors [&[data-state=open]]:bg-[#f7f3ed]/60">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-5 pt-0 text-sm text-neutral-500 leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        ))}

        {/* ── Ainda com dúvidas? ───────────────────────────────────────── */}
        <section className="bg-[#4a7c3f] rounded-2xl p-8 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none rounded-2xl"
            style={{ backgroundImage: "radial-gradient(circle, #f7f3ed 1px, transparent 1px)", backgroundSize: "20px 20px" }}
          />
          <div className="relative">
            <MessageCircle className="size-10 text-[#f7f3ed]/60 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#f7f3ed] mb-2">Ainda com dúvidas?</h2>
            <p className="text-[#f7f3ed]/65 mb-6 max-w-sm mx-auto">
              Nossa equipe de suporte está pronta para te ajudar. Respondemos em até 24 horas.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild className="bg-[#e07b2a] hover:bg-[#c96a1e] text-white font-semibold hover:scale-105 transition-all shadow-md">
                <Link href="/contato">
                  Falar com o suporte <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-[#f7f3ed]/40 text-[#f7f3ed] hover:bg-[#f7f3ed]/10">
                <Link href="/contato">Enviar e-mail</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
