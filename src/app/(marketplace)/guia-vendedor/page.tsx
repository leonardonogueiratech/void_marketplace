import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Store,
  Package,
  ClipboardList,
  Wallet,
  Star,
  Camera,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Guia do Vendedor — Feito de Gente",
  description:
    "Tudo o que você precisa saber para vender no Feito de Gente: cadastro, produtos, pedidos, financeiro e dicas para crescer.",
};

const steps = [
  {
    number: "01",
    icon: Store,
    color: "#1e3a5f",
    title: "Crie sua conta de artesão",
    description:
      "Acesse /seja-artesao, preencha os dados da sua loja e aguarde a aprovação da nossa equipe. O processo leva até 48 horas úteis.",
    tips: ["Use um nome de loja memorável", "Escreva uma bio autêntica", "Capriche na foto de perfil"],
  },
  {
    number: "02",
    icon: Camera,
    color: "#e07b2a",
    title: "Monte seu perfil e vitrine",
    description:
      "Configure logo, banner e descrição da sua loja no painel. Uma vitrine bem apresentada aumenta em até 3x as chances de venda.",
    tips: ["Banner em alta resolução (1200×400px)", "Descreva sua história e técnica", "Adicione localização da sua cidade"],
  },
  {
    number: "03",
    icon: Package,
    color: "#27ae60",
    title: "Cadastre seus produtos",
    description:
      "Adicione título, descrição detalhada, fotos, preço, estoque e dimensões para o cálculo de frete.",
    tips: ["Mínimo 3 fotos por produto", "Preço justo para você e o cliente", "Preencha peso e dimensões para frete automático"],
  },
  {
    number: "04",
    icon: ClipboardList,
    color: "#1e3a5f",
    title: "Gerencie seus pedidos",
    description:
      "Receba notificações por e-mail a cada novo pedido. Atualize o status conforme você embala, despacha e entrega.",
    tips: ["Confirme em até 48h", "Adicione o código de rastreio ao marcar como Enviado", "Comunique imprevistos ao cliente"],
  },
  {
    number: "05",
    icon: Wallet,
    color: "#e07b2a",
    title: "Receba seus pagamentos",
    description:
      "Os valores são liberados após a confirmação de entrega. A plataforma retém uma comissão de 10% por venda realizada.",
    tips: ["Mantenha seus dados bancários atualizados", "Solicitações de saque são processadas em 3 dias úteis", "Acompanhe seu saldo no painel financeiro"],
  },
];

const statusFlow = [
  { status: "Pendente", desc: "Pedido recebido, aguardando pagamento ser confirmado." },
  { status: "Aprovado", desc: "Pagamento confirmado. Separe e embale o produto." },
  { status: "Enviado", desc: "Produto despachado. Insira o código de rastreio." },
  { status: "Entregue", desc: "Cliente recebeu. O valor é liberado para saque." },
  { status: "Cancelado", desc: "Pedido cancelado. O cliente é reembolsado." },
];

const tips = [
  {
    icon: Camera,
    title: "Fotografe com luz natural",
    description:
      "Fotos tiradas perto de uma janela com luz difusa valorizam textura, cor e acabamento. Evite flash direto — ele achata o volume das peças.",
  },
  {
    icon: MessageCircle,
    title: "Responda avaliações",
    description:
      "Responder avaliações — positivas ou não — mostra profissionalismo e aumenta a confiança de novos compradores. Use o painel de Avaliações.",
  },
  {
    icon: TrendingUp,
    title: "Atualize o estoque sempre",
    description:
      "Produtos sem estoque somem da busca. Mantenha os números corretos para não frustrar clientes com pedidos cancelados.",
  },
  {
    icon: Star,
    title: "Caprice na descrição",
    description:
      "Conte a história da peça: o material, a técnica, quanto tempo levou. Descrições com mais de 150 palavras vendem significativamente mais.",
  },
  {
    icon: ShieldCheck,
    title: "Embale com cuidado",
    description:
      "A embalagem é a primeira impressão física que o cliente tem de você. Uma embalagem bonita e segura gera avaliações positivas e clientes recorrentes.",
  },
  {
    icon: Package,
    title: "Calcule o frete corretamente",
    description:
      "Preencha peso e dimensões reais de cada produto. Frete subestimado gera prejuízo; frete superestimado afasta compradores.",
  },
];

export default function GuiaVendedorPage() {
  return (
    <div className="min-h-screen bg-[#f7f3ed]">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#1e3a5f] relative overflow-hidden py-20 md:py-28">
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #f7f3ed 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        <div className="absolute right-0 top-0 w-1/2 h-full pointer-events-none overflow-hidden">
          <div className="absolute -right-24 -top-24 w-[480px] h-[480px] rounded-full bg-[#e07b2a]/15" />
          <div className="absolute right-16 bottom-8 w-72 h-72 rounded-full bg-[#27ae60]/10" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-10 bg-[#e07b2a]/50" />
            <span className="text-xs font-semibold uppercase tracking-widest text-[#f0b97a]">Para artesãos</span>
            <div className="h-px w-10 bg-[#e07b2a]/50" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#f7f3ed] leading-tight mb-6">
            Guia do Vendedor
            <br />
            <span className="text-[#e07b2a]">do Feito de Gente</span>
          </h1>
          <p className="text-lg text-[#f7f3ed]/70 max-w-2xl mx-auto leading-relaxed mb-10">
            Tudo o que você precisa saber para montar sua loja, cadastrar produtos,
            gerenciar pedidos e receber pelo seu trabalho — do início ao primeiro saque.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" asChild className="bg-[#e07b2a] hover:bg-[#c96a1e] text-white font-semibold shadow-lg hover:scale-105 transition-all">
              <Link href="/conta/seja-artesao">
                Quero vender agora <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-[#f7f3ed]/70 text-[#f7f3ed] bg-white/10 hover:bg-white/20 hover:border-white">
              <Link href="/dashboard">Ir para o painel</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Números rápidos ──────────────────────────────────────────────── */}
      <section className="bg-white py-10 border-b border-[#1e3a5f]/8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "10%", label: "Comissão por venda" },
              { value: "48h", label: "Aprovação de cadastro" },
              { value: "3 dias", label: "Para receber o saque" },
              { value: "0", label: "Taxa de cadastro" },
            ].map(({ value, label }) => (
              <div key={label} className="space-y-1">
                <span className="block text-3xl font-bold text-[#1e3a5f]">{value}</span>
                <span className="text-xs text-neutral-500 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Passo a passo ────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#f7f3ed]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#27ae60] mb-2">Do zero à primeira venda</p>
            <h2 className="text-3xl font-bold text-[#1e3a5f]">Como funciona passo a passo</h2>
          </div>
          <div className="space-y-6">
            {steps.map(({ number, icon: Icon, color, title, description, tips }) => (
              <div key={number} className="bg-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 border border-transparent hover:shadow-md transition-shadow">
                <div className="flex-shrink-0 flex items-start gap-4 md:w-72">
                  <div
                    className="size-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}15` }}
                  >
                    <Icon className="size-6" style={{ color }} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>{number}</span>
                    <h3 className="font-bold text-[#1e3a5f] text-lg leading-snug">{title}</h3>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-neutral-500 leading-relaxed mb-4">{description}</p>
                  <ul className="space-y-1.5">
                    {tips.map((tip) => (
                      <li key={tip} className="flex items-center gap-2 text-sm text-neutral-600">
                        <CheckCircle2 className="size-3.5 flex-shrink-0" style={{ color }} />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fluxo de status ──────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#e07b2a] mb-2">Ciclo de vida do pedido</p>
            <h2 className="text-3xl font-bold text-[#1e3a5f]">Entendendo os status</h2>
            <p className="text-neutral-500 mt-3 max-w-xl mx-auto">
              Cada pedido passa por etapas claras. Você atualiza o status pelo painel e o cliente é notificado por e-mail automaticamente.
            </p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute left-[18px] top-8 bottom-8 w-px bg-[#1e3a5f]/10" />
            <div className="space-y-4">
              {statusFlow.map(({ status, desc }, i) => {
                const colors = ["#6b7280", "#1e3a5f", "#e07b2a", "#27ae60", "#ef4444"];
                return (
                  <div key={status} className="flex items-start gap-5 group">
                    <div
                      className="size-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 bg-white z-10"
                      style={{ borderColor: colors[i] }}
                    >
                      <span className="text-xs font-bold" style={{ color: colors[i] }}>{i + 1}</span>
                    </div>
                    <div className="flex-1 bg-[#f7f3ed] rounded-xl px-5 py-4 group-hover:bg-[#f0ebe3] transition-colors">
                      <span
                        className="inline-block text-xs font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full mb-1"
                        style={{ background: `${colors[i]}18`, color: colors[i] }}
                      >
                        {status}
                      </span>
                      <p className="text-sm text-neutral-600">{desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Dicas ────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#f7f3ed]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#27ae60] mb-2">Para vender mais</p>
            <h2 className="text-3xl font-bold text-[#1e3a5f]">Dicas dos melhores vendedores</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tips.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-transparent hover:shadow-md transition-shadow">
                <div className="size-10 rounded-xl bg-[#e07b2a]/10 flex items-center justify-center mb-4">
                  <Icon className="size-5 text-[#e07b2a]" />
                </div>
                <h3 className="font-bold text-[#1e3a5f] mb-2">{title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ rápido ───────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1e3a5f] mb-2">Dúvidas frequentes</p>
            <h2 className="text-3xl font-bold text-[#1e3a5f]">Perguntas dos artesãos</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "Preciso ter CNPJ para vender?",
                a: "Não. Qualquer pessoa física pode se cadastrar e vender como artesão. CPF e dados bancários são suficientes para receber seus pagamentos.",
              },
              {
                q: "Quanto tempo leva para minha loja ser aprovada?",
                a: "Nossa equipe analisa cada cadastro em até 48 horas úteis. Você recebe um e-mail assim que a decisão for tomada.",
              },
              {
                q: "Posso vender produtos de terceiros?",
                a: "Não. O Feito de Gente é exclusivo para artesanato de produção própria. Produtos industrializados ou de revenda não são permitidos.",
              },
              {
                q: "O que acontece se o cliente devolver um produto?",
                a: "Em caso de devolução dentro do prazo legal (7 dias após recebimento), o pedido é cancelado e o valor não é liberado para saque. Avalie cada caso pelo painel.",
              },
              {
                q: "Posso ter mais de uma loja?",
                a: "Cada conta só pode ter uma loja vinculada. Se você trabalha com técnicas muito distintas, recomendamos separar em categorias dentro da mesma loja.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-[#1e3a5f]/10 overflow-hidden">
                <div className="flex items-start gap-3 p-5">
                  <ChevronRight className="size-4 text-[#e07b2a] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#1e3a5f] mb-1">{q}</p>
                    <p className="text-sm text-neutral-500 leading-relaxed">{a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#e07b2a] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Store className="size-10 text-white/80 mx-auto mb-5" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Pronto para abrir
            <br />sua loja?
          </h2>
          <p className="text-white/70 text-lg mb-10 leading-relaxed">
            Cadastro gratuito, sem mensalidade. Você só paga quando vende.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button size="lg" asChild className="bg-[#1e3a5f] hover:bg-[#162d4a] text-white font-semibold shadow-lg hover:scale-105 transition-all">
              <Link href="/conta/seja-artesao">
                Criar minha loja <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/40 text-white hover:bg-white/10">
              <Link href="/contato">Falar com o suporte</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
