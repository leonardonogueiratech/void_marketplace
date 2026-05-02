import { Metadata } from "next";
import Link from "next/link";
import {
  PackageCheck,
  Banknote,
  Truck,
  Star,
  ShoppingBag,
  Settings,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Clock,
  Phone,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Guia do Vendedor | Feito de Gente",
  description: "Tudo que você precisa saber para vender na plataforma Feito de Gente.",
};

export default function GuiaDoVendedorPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-12">

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#e07b2a] bg-[#e07b2a]/10 px-3 py-1 rounded-full mb-3">
          Para artesãos
        </div>
        <h1 className="text-3xl font-bold text-[#1e3a5f]">Guia completo do vendedor</h1>
        <p className="text-neutral-500 mt-2 leading-relaxed">
          Do cadastro ao saque: tudo que você precisa saber para vender com segurança
          e receber direitinho na plataforma Feito de Gente.
        </p>
      </div>

      {/* Índice */}
      <nav className="bg-[#f7f3ed] rounded-2xl p-5 space-y-2">
        <p className="text-sm font-semibold text-[#1e3a5f] mb-3">Neste guia:</p>
        {[
          { href: "#como-funciona", label: "Como a plataforma funciona" },
          { href: "#aprovacao", label: "Aprovação do cadastro" },
          { href: "#configurar-conta", label: "Configurar sua conta para receber" },
          { href: "#cadastrar-produtos", label: "Cadastrar produtos" },
          { href: "#recebi-um-pedido", label: "Recebi um pedido — o que fazer" },
          { href: "#como-enviar", label: "Como enviar pelos Correios" },
          { href: "#pagamentos", label: "Pagamentos e saques (Asaas)" },
          { href: "#avaliacoes", label: "Avaliações e reputação" },
          { href: "#suporte", label: "Suporte e contato" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center gap-2 text-sm text-[#1e3a5f] hover:text-[#e07b2a] transition-colors"
          >
            <ArrowRight className="size-3 shrink-0" /> {item.label}
          </a>
        ))}
      </nav>

      {/* 1. Como funciona */}
      <Section id="como-funciona" icon={<ShoppingBag className="size-5" />} title="Como a plataforma funciona">
        <p>
          A <strong>Feito de Gente</strong> é um marketplace — conectamos compradores que amam
          artesanato com artesãos de todo o Brasil. Você cuida de fazer e enviar; a gente cuida
          da loja, dos pagamentos e da divulgação.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { n: "1", title: "Você cadastra", desc: "Cria seus produtos com fotos, descrição e preço." },
            { n: "2", title: "Cliente compra", desc: "O pagamento é processado automaticamente pela plataforma." },
            { n: "3", title: "Você envia", desc: "Embala, posta nos Correios e informa o rastreio." },
          ].map((step) => (
            <div key={step.n} className="bg-[#1e3a5f]/5 rounded-xl p-4">
              <div className="size-7 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-xs font-bold mb-2">
                {step.n}
              </div>
              <p className="text-sm font-semibold text-[#1e3a5f]">{step.title}</p>
              <p className="text-xs text-neutral-500 mt-1">{step.desc}</p>
            </div>
          ))}
        </div>
        <InfoBox>
          A plataforma retém uma comissão sobre cada venda (7% a 15% dependendo do seu plano)
          e repassa o restante para você em até 7 dias úteis após confirmação da entrega.
        </InfoBox>
      </Section>

      {/* 2. Aprovação */}
      <Section id="aprovacao" icon={<Clock className="size-5" />} title="Aprovação do cadastro">
        <p>
          Após enviar o cadastro, nossa equipe analisa o seu perfil em até <strong>2 dias úteis</strong>.
          Você receberá um e-mail com o resultado.
        </p>
        <p className="mt-3">O que analisamos:</p>
        <ul className="mt-2 space-y-2">
          <CheckItem>Informações verdadeiras e completas</CheckItem>
          <CheckItem>Produtos artesanais feitos por você</CheckItem>
          <CheckItem>Fotos reais (sem imagens de internet ou geradas por IA)</CheckItem>
          <CheckItem>Descrição clara e honesta do trabalho</CheckItem>
        </ul>
        <WarnBox>
          Cadastros com informações incompletas ou produtos industrializados são reprovados.
          Você poderá corrigir e enviar novamente.
        </WarnBox>
      </Section>

      {/* 3. Configurar conta */}
      <Section id="configurar-conta" icon={<Settings className="size-5" />} title="Configurar sua conta para receber (Asaas)">
        <p>
          Os pagamentos da plataforma são processados pelo <strong>Asaas</strong>, uma fintech
          brasileira regulamentada pelo Banco Central. Para receber suas vendas, você precisa
          configurar seus dados bancários no painel.
        </p>

        <StepList>
          <StepItem n={1} title="Acesse o painel">
            Após aprovado, vá em <strong>Dashboard → Financeiro</strong>.
          </StepItem>
          <StepItem n={2} title="Cadastre seus dados bancários">
            Informe CPF ou CNPJ, banco, agência e conta corrente ou poupança.
            Conta deve estar em seu nome (CPF) ou da sua empresa (CNPJ).
          </StepItem>
          <StepItem n={3} title="Verifique sua identidade">
            O Asaas pode solicitar documento de identidade para liberar saques.
            Normalmente é automático na primeira solicitação.
          </StepItem>
          <StepItem n={4} title="Pronto para receber">
            A partir daí, seu saldo de vendas fica disponível para saque direto na sua conta.
          </StepItem>
        </StepList>

        <InfoBox>
          <strong>Importante:</strong> O Asaas não cobra taxa para receber. O único custo é a
          comissão da plataforma, que já é descontada antes do saldo chegar ao seu painel.
        </InfoBox>
      </Section>

      {/* 4. Cadastrar produtos */}
      <Section id="cadastrar-produtos" icon={<PackageCheck className="size-5" />} title="Cadastrar produtos">
        <p>Vá em <strong>Dashboard → Produtos → Novo produto</strong> e preencha:</p>
        <ul className="mt-3 space-y-2">
          <CheckItem><strong>Fotos:</strong> mínimo 3 fotos reais, boa iluminação, fundo neutro preferível. Mostre detalhes.</CheckItem>
          <CheckItem><strong>Nome:</strong> claro e descritivo. Ex: "Vaso de cerâmica pintado à mão — azul cobalto".</CheckItem>
          <CheckItem><strong>Descrição:</strong> materiais usados, dimensões, peso, cuidados de conservação.</CheckItem>
          <CheckItem><strong>Preço:</strong> inclua o custo do seu tempo, materiais e uma margem. Lembre que a plataforma desconta comissão.</CheckItem>
          <CheckItem><strong>Estoque:</strong> quantidade disponível. Coloque 0 se for sob encomenda.</CheckItem>
          <CheckItem><strong>Prazo de produção:</strong> se é encomenda, informe os dias necessários.</CheckItem>
        </ul>
        <InfoBox>
          Dica: produtos com 5+ fotos e descrição completa vendem <strong>3x mais</strong> do que
          produtos com 1 foto e descrição curta.
        </InfoBox>
      </Section>

      {/* 5. Recebi um pedido */}
      <Section id="recebi-um-pedido" icon={<CheckCircle2 className="size-5" />} title="Recebi um pedido — o que fazer">
        <p>
          Quando um cliente finalizar a compra, você receberá uma notificação por e-mail
          e o pedido aparecerá em <strong>Dashboard → Pedidos</strong>.
        </p>

        <StepList>
          <StepItem n={1} title="Confirme o pedido">
            Acesse o painel e mude o status para <strong>"Em produção"</strong> ou
            <strong>"Pronto para envio"</strong> conforme for preparando.
          </StepItem>
          <StepItem n={2} title="Prepare o produto">
            Embale com cuidado — use plástico bolha, caixa reforçada ou embalagem adequada
            ao tipo de artesanato. O produto danificado por embalagem ruim é sua responsabilidade.
          </StepItem>
          <StepItem n={3} title="Poste nos Correios em até 3 dias úteis">
            Consulte a seção abaixo sobre como enviar. Guarde o comprovante de postagem.
          </StepItem>
          <StepItem n={4} title="Informe o código de rastreamento">
            No painel, abra o pedido e insira o código de rastreio. O cliente recebe
            notificação automaticamente.
          </StepItem>
        </StepList>

        <WarnBox>
          Pedidos sem atualização de status por mais de 5 dias úteis geram reclamação
          automática ao cliente. Sempre mantenha o painel atualizado.
        </WarnBox>
      </Section>

      {/* 6. Como enviar */}
      <Section id="como-enviar" icon={<Truck className="size-5" />} title="Como enviar pelos Correios">
        <p>
          A plataforma calcula o frete automaticamente (PAC ou SEDEX) e o cliente paga
          na hora da compra. Você só precisa postar o produto no prazo.
        </p>

        <StepList>
          <StepItem n={1} title="Imprima a etiqueta ou anote o endereço">
            O endereço de entrega está disponível no painel do pedido. Escreva na caixa
            ou imprima e cole.
          </StepItem>
          <StepItem n={2} title="Vá à agência dos Correios">
            Leve o produto embalado. No balcão, informe que é encomenda para pessoa física.
            O frete já foi pago pelo cliente — você só precisa postar.
          </StepItem>
          <StepItem n={3} title="Escolha o serviço correto">
            <strong>PAC:</strong> mais barato, prazo de 4 a 12 dias úteis.<br />
            <strong>SEDEX:</strong> expresso, prazo de 1 a 5 dias úteis.<br />
            Use o mesmo serviço que o cliente escolheu na compra (aparece no pedido).
          </StepItem>
          <StepItem n={4} title="Pegue o código de rastreamento">
            O Correios fornece no comprovante. Insira no painel para o cliente acompanhar.
          </StepItem>
        </StepList>

        <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
          <p className="font-semibold mb-1">Dicas de embalagem por tipo de produto:</p>
          <ul className="space-y-1 text-xs">
            <li>🏺 <strong>Cerâmica e vidro:</strong> plástico bolha + caixa com enchimento (jornal, papel kraft)</li>
            <li>🪡 <strong>Tecidos e bordados:</strong> saco plástico + caixa ou envelope acolchoado</li>
            <li>🪵 <strong>Madeira:</strong> papel kraft + fita e caixa bem vedada</li>
            <li>💍 <strong>Joias e bijuterias:</strong> caixinha rígida + plástico bolha + caixa externa</li>
          </ul>
        </div>
      </Section>

      {/* 7. Pagamentos */}
      <Section id="pagamentos" icon={<Banknote className="size-5" />} title="Pagamentos e saques (Asaas)">
        <p>Veja como funciona o ciclo completo do dinheiro:</p>

        <div className="mt-4 space-y-3">
          {[
            {
              title: "Cliente paga",
              desc: "O pagamento é processado pelo Asaas via PIX, cartão de crédito ou boleto. A confirmação é imediata no PIX e cartão.",
            },
            {
              title: "Plataforma desconta a comissão",
              desc: "A comissão (7%, 10% ou 15% conforme seu plano) é descontada automaticamente.",
            },
            {
              title: "Saldo fica retido",
              desc: "O valor líquido fica em aguardo por segurança até a confirmação da entrega pelo comprador.",
            },
            {
              title: "Saldo liberado em até 7 dias úteis",
              desc: "Após confirmação da entrega (ou prazo máximo de entrega estimado), o saldo é liberado para saque.",
            },
            {
              title: "Você solicita o saque",
              desc: "No painel financeiro, solicite o saque. O mínimo é R$ 50,00. O Asaas transfere em 1 dia útil para sua conta.",
            },
          ].map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="size-6 rounded-full bg-[#e07b2a] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1e3a5f]">{item.title}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <WarnBox>
          <strong>Estornos e chargebacks:</strong> se o comprador cancelar ou contestar a compra,
          o valor é debitado do seu saldo. Por isso, sempre guarde comprovantes de postagem
          e fotos do produto embalado antes de enviar.
        </WarnBox>
      </Section>

      {/* 8. Avaliações */}
      <Section id="avaliacoes" icon={<Star className="size-5" />} title="Avaliações e reputação">
        <p>
          Após receber o produto, o comprador pode avaliar de 1 a 5 estrelas e deixar um comentário.
          Sua média aparece no perfil público da loja.
        </p>
        <ul className="mt-3 space-y-2">
          <CheckItem>Avaliação média abaixo de 3.0 pode suspender temporariamente sua loja</CheckItem>
          <CheckItem>Você pode responder às avaliações no painel — isso mostra cuidado ao cliente</CheckItem>
          <CheckItem>Artesãos com 4.5+ estrelas ganham o selo "Muito bem avaliado" e aparecem primeiro nas buscas</CheckItem>
        </ul>
        <InfoBox>
          A melhor forma de ter boas avaliações é simples: produto igual à foto, embalado com cuidado
          e entregue no prazo.
        </InfoBox>
      </Section>

      {/* 9. Suporte */}
      <Section id="suporte" icon={<Phone className="size-5" />} title="Suporte e contato">
        <p>Tem dúvida ou problema? Fale com a gente:</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/contato"
            className="flex items-center gap-3 p-4 rounded-xl border border-[#1e3a5f]/15 hover:border-[#1e3a5f]/40 hover:bg-[#1e3a5f]/3 transition-all"
          >
            <div className="size-9 rounded-lg bg-[#1e3a5f]/8 flex items-center justify-center">
              <Phone className="size-4 text-[#1e3a5f]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1e3a5f]">Formulário de contato</p>
              <p className="text-xs text-neutral-500">Resposta em até 1 dia útil</p>
            </div>
          </Link>
          <a
            href="mailto:contato@feitodegente.com.br"
            className="flex items-center gap-3 p-4 rounded-xl border border-[#1e3a5f]/15 hover:border-[#1e3a5f]/40 hover:bg-[#1e3a5f]/3 transition-all"
          >
            <div className="size-9 rounded-lg bg-[#1e3a5f]/8 flex items-center justify-center">
              <Settings className="size-4 text-[#1e3a5f]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1e3a5f]">E-mail direto</p>
              <p className="text-xs text-neutral-500">contato@feitodegente.com.br</p>
            </div>
          </a>
        </div>
      </Section>

      {/* CTA */}
      <div className="bg-[#1e3a5f] rounded-2xl p-6 text-center space-y-3">
        <h2 className="text-white font-bold text-lg">Pronto para começar?</h2>
        <p className="text-white/70 text-sm">Cadastre-se gratuitamente e comece a vender em minutos.</p>
        <Link
          href="/seja-artesao"
          className="inline-flex items-center gap-2 bg-[#e07b2a] hover:bg-[#c96a1e] text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors"
        >
          Quero ser artesão <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

// ─── Componentes auxiliares ───────────────────────────────────────────────────

function Section({
  id, icon, title, children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-xl bg-[#1e3a5f]/8 flex items-center justify-center text-[#1e3a5f]">
          {icon}
        </div>
        <h2 className="text-xl font-bold text-[#1e3a5f]">{title}</h2>
      </div>
      <div className="text-neutral-600 leading-relaxed text-sm pl-12">{children}</div>
    </section>
  );
}

function StepList({ children }: { children: React.ReactNode }) {
  return <ol className="mt-4 space-y-4">{children}</ol>;
}

function StepItem({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <div className="size-6 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
        {n}
      </div>
      <div>
        <p className="text-sm font-semibold text-[#1e3a5f]">{title}</p>
        <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{children}</p>
      </div>
    </li>
  );
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <CheckCircle2 className="size-4 text-[#27ae60] shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 flex gap-3 bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-700">
      <AlertCircle className="size-4 shrink-0 mt-0.5" />
      <p>{children}</p>
    </div>
  );
}

function WarnBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 flex gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm text-amber-700">
      <AlertCircle className="size-4 shrink-0 mt-0.5" />
      <p>{children}</p>
    </div>
  );
}
