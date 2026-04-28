import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Termos de Uso — Feito de Gente",
  description: "Leia os Termos de Uso da plataforma Feito de Gente antes de utilizar nossos serviços.",
};

const sections = [
  {
    id: "aceitacao",
    title: "1. Aceitação dos Termos",
    content: `Ao acessar ou utilizar a plataforma Feito de Gente ("Plataforma"), operada pela Void Technologies ("Empresa", "nós", "nosso"), você ("Usuário") declara ter lido, compreendido e concordado integralmente com estes Termos de Uso ("Termos"), bem como com nossa Política de Privacidade.

Caso não concorde com qualquer disposição destes Termos, pedimos que não utilize a Plataforma. O uso continuado após a publicação de atualizações constitui aceitação das versões revisadas.

Estes Termos se aplicam a todos os usuários, sejam compradores ("Clientes") ou vendedores ("Artesãos"), e complementam quaisquer contratos específicos celebrados entre o Usuário e a Empresa.`,
  },
  {
    id: "servicos",
    title: "2. Descrição dos Serviços",
    content: `O Feito de Gente é um marketplace digital que conecta Artesãos brasileiros a Clientes interessados em produtos artesanais. A Plataforma disponibiliza:

• Vitrine digital para exposição e venda de produtos artesanais;
• Sistema de processamento de pagamentos integrado;
• Ferramentas de gestão de pedidos, estoque e financeiro;
• Canal de comunicação entre Artesãos e Clientes;
• Painel analítico para acompanhamento de desempenho.

A Empresa atua exclusivamente como intermediária tecnológica, não sendo parte nas transações comerciais entre Artesãos e Clientes, nem responsável pela qualidade, autenticidade ou entrega dos produtos, salvo nos casos expressamente previstos nestes Termos ou na legislação vigente.`,
  },
  {
    id: "cadastro",
    title: "3. Cadastro e Conta",
    content: `3.1. Requisitos
Para se cadastrar, o Usuário deve ter pelo menos 18 anos ou ser emancipado. Menores de 18 anos podem utilizar a Plataforma sob supervisão de responsável legal que aceite estes Termos em seu nome.

3.2. Dados verídicos
O Usuário se compromete a fornecer informações verídicas, precisas e atualizadas no momento do cadastro e a mantê-las atualizadas. Informações falsas ou incorretas podem resultar no cancelamento da conta.

3.3. Segurança da conta
O Usuário é responsável pela confidencialidade de sua senha e por todas as atividades realizadas em sua conta. Em caso de uso não autorizado, o Usuário deve comunicar imediatamente a Empresa através dos canais de suporte.

3.4. Uma conta por pessoa
É vedado o cadastro de mais de uma conta por pessoa física ou jurídica, salvo autorização expressa da Empresa.`,
  },
  {
    id: "artesaos",
    title: "4. Cadastro de Artesãos",
    content: `4.1. Aprovação
O cadastro como Artesão está sujeito à análise e aprovação da equipe Feito de Gente em até 2 (dois) dias úteis. Reservamo-nos o direito de reprovar cadastros que não atendam aos critérios da plataforma, sem obrigação de justificativa.

4.2. Produtos permitidos
São permitidos exclusivamente produtos de origem artesanal, produzidos manualmente, de forma criativa e com identidade autoral. São vedados: produtos industrializados, revendas de terceiros sem produção própria, itens falsificados ou que violem direitos de terceiros.

4.3. Descrições e imagens
O Artesão é inteiramente responsável pela veracidade das descrições, especificações e imagens de seus produtos. Informações enganosas ou que induzam o Cliente ao erro são vedadas e podem resultar em suspensão imediata.

4.4. Estoque e disponibilidade
O Artesão deve manter o estoque atualizado na plataforma. Vendas de produtos esgotados ou com prazo de entrega irreal podem resultar em penalidades e/ou suspensão da conta.

4.5. Prazo de envio
O Artesão se compromete a enviar o pedido no prazo informado em seu anúncio. Em caso de imprevistos, deve comunicar o Cliente através da Plataforma antes do vencimento do prazo.`,
  },
  {
    id: "transacoes",
    title: "5. Transações e Pagamentos",
    content: `5.1. Processamento
Os pagamentos são processados por meio de parceiro financeiro integrado à Plataforma (atualmente Asaas Pagamentos S.A.). A Empresa não armazena dados de cartões de crédito ou informações bancárias dos Usuários.

5.2. Aprovação
Pedidos somente são confirmados após a aprovação do pagamento pelo processador. O Artesão não deve iniciar a produção ou envio antes da confirmação.

5.3. Repasse ao artesão
O repasse ao Artesão ocorre após a confirmação de entrega ou após o prazo de garantia ao comprador (7 dias corridos da entrega confirmada), deduzidas as comissões e taxas aplicáveis conforme o plano contratado.

5.4. Comissões
A Empresa cobra uma comissão sobre o valor de cada venda concluída, conforme tabela vigente em cada plano de assinatura (Grátis, Básico ou Pro). Os percentuais atualizados estão disponíveis na página de Planos.

5.5. Estorno
Em caso de cancelamento de pedido devidamente aprovado pela Empresa, o valor pago pelo Cliente será estornado conforme as regras do meio de pagamento utilizado.`,
  },
  {
    id: "cancelamento-devolucao",
    title: "6. Cancelamentos e Devoluções",
    content: `6.1. Cancelamento pelo cliente
O Cliente pode cancelar pedidos no status "Pendente" ou "Pagamento pendente" diretamente pela Plataforma. Pedidos já confirmados ou em produção estão sujeitos às políticas de cada Artesão.

6.2. Direito de arrependimento
Nos termos do art. 49 do Código de Defesa do Consumidor (Lei 8.078/90), o Cliente tem direito de desistir da compra em até 7 (sete) dias corridos a contar da data de recebimento do produto, sem necessidade de justificativa, com direito ao reembolso integral.

6.3. Procedimento de devolução
Para exercer o direito de arrependimento ou solicitar devolução por defeito, o Cliente deve abrir uma solicitação pela Plataforma ou contatar o suporte. O produto deve ser devolvido em sua embalagem original, sem sinais de uso além do necessário para avaliação.

6.4. Produtos personalizados
Produtos feitos sob encomenda ou personalizados conforme especificações do Cliente não estão sujeitos ao direito de arrependimento, salvo em caso de vício oculto ou não conformidade com o combinado.`,
  },
  {
    id: "propriedade-intelectual",
    title: "7. Propriedade Intelectual",
    content: `7.1. Conteúdo da plataforma
Toda a estrutura, design, logotipos, marcas, textos e tecnologias da Plataforma são de propriedade exclusiva da Empresa e estão protegidos pela legislação de propriedade intelectual. É vedada qualquer reprodução sem autorização prévia e expressa.

7.2. Conteúdo do artesão
O Artesão declara ser o legítimo titular ou ter autorização para usar todo o conteúdo publicado (textos, fotos, descrições, arte). Ao publicar na Plataforma, o Artesão concede à Empresa licença não exclusiva, gratuita e revogável para exibir, reproduzir e divulgar esse conteúdo exclusivamente para fins de operação e divulgação da Plataforma.

7.3. Violações
Em caso de denúncia fundamentada de violação de direitos autorais ou de propriedade intelectual, a Empresa pode remover o conteúdo imediatamente, notificando o responsável.`,
  },
  {
    id: "conduta",
    title: "8. Conduta Proibida",
    content: `É expressamente vedado ao Usuário:

• Publicar ou comercializar produtos falsificados, ilegais, perigosos, proibidos ou que violem direitos de terceiros;
• Realizar transações fora da Plataforma para burlar comissões ou proteções contratuais;
• Utilizar bots, scripts ou meios automatizados para interagir com a Plataforma;
• Coletar dados de outros usuários sem autorização;
• Praticar assédio, ameaças, discriminação ou qualquer forma de abuso nas interações;
• Fornecer avaliações, feedbacks ou comentários falsos;
• Usar a Plataforma para fins ilegais, incluindo lavagem de dinheiro e fraude;
• Tentar acessar sistemas, bancos de dados ou áreas restritas da Plataforma;
• Publicar conteúdo pornográfico, violento, racista ou ofensivo.

O descumprimento pode resultar em suspensão ou exclusão permanente da conta, sem prejuízo das medidas legais cabíveis.`,
  },
  {
    id: "responsabilidade",
    title: "9. Limitação de Responsabilidade",
    content: `9.1. Intermediação
A Empresa não é responsável pela qualidade, segurança, legalidade ou veracidade dos produtos anunciados pelos Artesãos, nem pelo cumprimento das obrigações contratuais entre Artesão e Cliente.

9.2. Disponibilidade
A Plataforma é fornecida "como está" e "conforme disponível". A Empresa não garante disponibilidade ininterrupta e não se responsabiliza por danos decorrentes de falhas técnicas, manutenções programadas ou situações de força maior.

9.3. Danos indiretos
Em nenhuma hipótese a Empresa será responsável por danos indiretos, lucros cessantes, perda de dados ou danos morais decorrentes do uso ou impossibilidade de uso da Plataforma, exceto quando houver culpa exclusiva comprovada da Empresa.

9.4. Limite máximo
A responsabilidade total da Empresa perante qualquer Usuário limita-se ao valor das taxas pagas por esse Usuário à Empresa nos 12 meses anteriores ao evento que gerou o dano.`,
  },
  {
    id: "rescisao",
    title: "10. Suspensão e Encerramento",
    content: `A Empresa pode, a seu exclusivo critério, suspender ou encerrar a conta de qualquer Usuário que:

• Viole estes Termos ou a Política de Privacidade;
• Pratique fraude ou atividade suspeita;
• Receba número significativo de reclamações de outros usuários;
• Deixe de cumprir obrigações financeiras com a Plataforma.

O Usuário pode encerrar sua conta a qualquer momento pelo painel de configurações. O encerramento não exime o Usuário de obrigações já assumidas, como pedidos em andamento ou pagamentos pendentes.`,
  },
  {
    id: "alteracoes",
    title: "11. Alterações nos Termos",
    content: `A Empresa reserva-se o direito de modificar estes Termos a qualquer momento. Alterações relevantes serão comunicadas por e-mail e/ou notificação na Plataforma com antecedência mínima de 10 (dez) dias corridos.

O uso continuado da Plataforma após a entrada em vigor das alterações constitui aceitação dos novos Termos. Caso não concorde com as modificações, o Usuário deve encerrar sua conta antes da data de vigência.`,
  },
  {
    id: "legislacao",
    title: "12. Lei Aplicável e Foro",
    content: `Estes Termos são regidos pelas leis da República Federativa do Brasil, incluindo o Código de Defesa do Consumidor (Lei 8.078/90), o Marco Civil da Internet (Lei 12.965/14) e a Lei Geral de Proteção de Dados — LGPD (Lei 13.709/18).

Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer conflitos decorrentes destes Termos, com renúncia expressa a qualquer outro, por mais privilegiado que seja, salvo nos casos em que a legislação consumeirista determine foro diverso em benefício do consumidor.`,
  },
  {
    id: "contato",
    title: "13. Contato",
    content: `Em caso de dúvidas, reclamações ou solicitações relacionadas a estes Termos, entre em contato através dos seguintes canais:

• E-mail: contato@feitodegente.com.br
• Formulário: feitodegente.com.br/contato
• WhatsApp: disponível no rodapé da Plataforma

Nosso time responde em até 2 (dois) dias úteis.`,
  },
];

export default function TermosPage() {
  const lastUpdate = "24 de abril de 2026";

  return (
    <div className="min-h-screen bg-[#f7f3ed]">
      {/* Header */}
      <div className="bg-[#1e3a5f] text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-white/50 text-sm mb-5">
            <Link href="/" className="hover:text-white transition-colors">Início</Link>
            <ChevronRight className="size-3.5" />
            <span className="text-white/80">Termos de Uso</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <FileText className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Termos de Uso</h1>
              <p className="text-white/60 text-sm mt-1">Última atualização: {lastUpdate}</p>
            </div>
          </div>
          <p className="text-white/70 text-sm max-w-2xl leading-relaxed">
            Estes Termos de Uso regulam o acesso e o uso da plataforma Feito de Gente.
            Leia com atenção antes de utilizar nossos serviços.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sticky index */}
          <aside className="lg:w-56 shrink-0">
            <div className="lg:sticky lg:top-24 bg-white rounded-2xl border border-[#1e3a5f]/10 p-4">
              <p className="text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider mb-3">Sumário</p>
              <nav className="space-y-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block text-xs text-neutral-500 hover:text-[#1e3a5f] py-1 leading-snug transition-colors"
                  >
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-10">
            {/* Intro box */}
            <div className="bg-[#e07b2a]/8 border border-[#e07b2a]/20 rounded-2xl p-5 text-sm text-[#1e3a5f] leading-relaxed">
              <strong>Resumo simples:</strong> O Feito de Gente é um marketplace. Artesãos vendem seus produtos e
              Clientes compram. Nós intermediamos, cobramos uma comissão e garantimos a segurança das transações.
              Ao usar a plataforma, você concorda com estas regras.
            </div>

            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-lg font-bold text-[#1e3a5f] mb-4 pb-2 border-b border-[#1e3a5f]/10">
                  {section.title}
                </h2>
                <div className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </section>
            ))}

            <div className="bg-white rounded-2xl border border-[#1e3a5f]/10 p-6 text-center">
              <p className="text-sm text-neutral-500 mb-3">Tem alguma dúvida sobre os Termos de Uso?</p>
              <Link
                href="/contato"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#1e3a5f] hover:text-[#e07b2a] transition-colors"
              >
                Fale conosco <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
