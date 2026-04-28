import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidade — Feito de Gente",
  description: "Saiba como o Feito de Gente coleta, usa e protege seus dados pessoais conforme a LGPD.",
};

const sections = [
  {
    id: "controlador",
    title: "1. Controlador dos Dados",
    content: `A Void Technologies, responsável pela operação da plataforma Feito de Gente ("Plataforma"), é a controladora dos dados pessoais coletados dos usuários ("Titular"), nos termos da Lei Geral de Proteção de Dados — LGPD (Lei 13.709/18).

Para exercer seus direitos ou tirar dúvidas sobre o tratamento de seus dados, utilize os canais indicados na seção "Contato e DPO" ao final deste documento.`,
  },
  {
    id: "dados-coletados",
    title: "2. Dados Pessoais Coletados",
    content: `Coletamos os seguintes dados, conforme a natureza do uso:

2.1. Dados fornecidos pelo Titular
• Cadastro: nome completo, endereço de e-mail, senha (armazenada com hash criptográfico), número de telefone/WhatsApp e foto de perfil;
• Endereço de entrega: logradouro, número, complemento, bairro, cidade, estado e CEP;
• Dados do artesão: nome da loja, biografia, cidade/estado, Instagram e informações bancárias para recebimento de repasses;
• Comunicações: mensagens trocadas no chat da plataforma e e-mails enviados ao suporte.

2.2. Dados coletados automaticamente
• Dados de acesso: endereço IP, tipo de navegador, sistema operacional, páginas visitadas, data e hora de acesso;
• Cookies e tecnologias similares: identificadores de sessão, preferências e dados de uso (detalhado na seção de Cookies);
• Dados de transação: valor, data, status, produto e método de pagamento de cada pedido.

2.3. Dados de terceiros
Quando o Titular faz login via Google (OAuth), recebemos nome, e-mail e foto de perfil conforme as permissões autorizadas pelo Titular naquela plataforma.`,
  },
  {
    id: "finalidades",
    title: "3. Finalidades do Tratamento",
    content: `Tratamos seus dados pessoais para as seguintes finalidades:

• Criação e gestão de conta: permitir cadastro, autenticação e personalização da experiência;
• Processamento de pedidos: gerenciar compras, pagamentos, envios e devoluções;
• Comunicações transacionais: enviar confirmações de pedido, atualizações de status e notificações de conta;
• Suporte ao usuário: responder dúvidas, resolver problemas e processar solicitações;
• Segurança e prevenção a fraudes: detectar acessos suspeitos, verificar identidades e proteger a integridade da plataforma;
• Cumprimento de obrigações legais: emissão de documentos fiscais, reporte a autoridades quando exigido por lei;
• Melhoria dos serviços: análise de uso agregado e anonimizado para aprimorar funcionalidades;
• Marketing (com consentimento): envio de newsletters, promoções e novidades — apenas para Titulares que expressamente optarem por receber.`,
  },
  {
    id: "bases-legais",
    title: "4. Bases Legais (LGPD)",
    content: `Realizamos o tratamento de dados pessoais com base nas seguintes hipóteses legais previstas na LGPD:

• Execução de contrato (art. 7º, V): dados necessários para fornecer os serviços contratados pelo Titular, como processar pedidos e gerenciar conta;
• Cumprimento de obrigação legal (art. 7º, II): dados exigidos pela legislação tributária, contábil ou por autoridades competentes;
• Legítimo interesse (art. 7º, IX): dados utilizados para segurança da plataforma, prevenção de fraudes e melhoria dos serviços, sempre ponderados em relação aos direitos do Titular;
• Consentimento (art. 7º, I): comunicações de marketing e uso de cookies não essenciais — o Titular pode revogar o consentimento a qualquer momento.`,
  },
  {
    id: "compartilhamento",
    title: "5. Compartilhamento de Dados",
    content: `Seus dados pessoais podem ser compartilhados com:

5.1. Parceiros de operação
• Processador de pagamentos (Asaas Pagamentos S.A.): dados necessários para processar cobranças e repasses;
• Provedores de infraestrutura em nuvem (Neon Tech, Vercel): hospedagem segura de banco de dados e aplicação;
• Serviço de e-mail transacional: envio de notificações e comunicações da plataforma.

5.2. Artesãos
Ao realizar uma compra, seus dados de nome, endereço de entrega e informações do pedido são compartilhados com o Artesão responsável pelo envio.

5.3. Autoridades
Podemos compartilhar dados com autoridades governamentais, judiciais ou regulatórias quando exigido por ordem judicial, lei ou regulamento aplicável.

5.4. Vedações
Não vendemos, alugamos nem compartilhamos seus dados com terceiros para fins publicitários próprios desses terceiros.`,
  },
  {
    id: "retencao",
    title: "6. Retenção dos Dados",
    content: `Mantemos seus dados pessoais pelo tempo necessário para cumprir as finalidades descritas nesta Política:

• Dados de conta ativa: durante todo o período em que a conta estiver ativa;
• Dados de transações e pedidos: 5 (cinco) anos após a conclusão, conforme exigência fiscal e contábil (Lei 9.613/98 e Código Tributário Nacional);
• Dados de comunicações de suporte: 2 (dois) anos após o encerramento do atendimento;
• Logs de acesso: 6 (seis) meses, conforme Marco Civil da Internet (Lei 12.965/14);
• Dados para cumprimento de obrigação legal: pelo prazo exigido pela legislação aplicável.

Após o encerramento da conta, os dados são anonimizados ou excluídos, exceto quando a retenção for legalmente obrigatória.`,
  },
  {
    id: "direitos",
    title: "7. Direitos do Titular",
    content: `Nos termos da LGPD (art. 18), você tem os seguintes direitos em relação aos seus dados pessoais:

• Confirmação e acesso: confirmar se tratamos seus dados e acessar uma cópia deles;
• Correção: solicitar a correção de dados incompletos, inexatos ou desatualizados;
• Anonimização, bloqueio ou eliminação: para dados desnecessários, excessivos ou tratados em desconformidade;
• Portabilidade: receber seus dados em formato estruturado e interoperável;
• Eliminação: solicitar a exclusão de dados tratados com base no consentimento;
• Informação sobre compartilhamento: saber com quais entidades compartilhamos seus dados;
• Revogação do consentimento: retirar consentimento dado para finalidades específicas, a qualquer momento;
• Oposição: opor-se ao tratamento baseado em legítimo interesse.

Para exercer qualquer desses direitos, envie sua solicitação para privacidade@feitodegente.com.br. Responderemos em até 15 (quinze) dias.`,
  },
  {
    id: "cookies",
    title: "8. Cookies e Tecnologias Similares",
    content: `Utilizamos cookies e tecnologias semelhantes para operar e melhorar a Plataforma:

8.1. Cookies essenciais
Necessários para o funcionamento básico — autenticação, sessão e segurança. Não podem ser desativados sem impactar a navegação.

8.2. Cookies de desempenho
Coletam dados anônimos sobre como os usuários interagem com a Plataforma, nos ajudando a identificar e corrigir problemas. Usados apenas de forma agregada.

8.3. Cookies de preferências
Lembram escolhas do usuário (ex.: idioma, região) para personalizar a experiência.

8.4. Gestão de cookies
Você pode gerenciar suas preferências de cookies nas configurações do navegador. A desativação de cookies essenciais pode afetar funcionalidades críticas da Plataforma.`,
  },
  {
    id: "seguranca",
    title: "9. Segurança dos Dados",
    content: `Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados pessoais contra acesso não autorizado, perda, destruição, alteração ou divulgação indevida, incluindo:

• Criptografia de senhas com algoritmo bcrypt;
• Transmissão de dados via HTTPS/TLS;
• Banco de dados em ambiente isolado com acesso restrito;
• Autenticação segura via NextAuth com suporte a OAuth;
• Monitoramento contínuo de acessos e atividades suspeitas;
• Acesso interno aos dados restrito ao mínimo necessário (princípio do menor privilégio).

Em caso de incidente de segurança que possa acarretar risco ou dano relevante ao Titular, comunicaremos a ocorrência à Autoridade Nacional de Proteção de Dados (ANPD) e aos Titulares afetados no prazo legal.`,
  },
  {
    id: "transferencias",
    title: "10. Transferências Internacionais",
    content: `Alguns dos nossos provedores de serviço (como infraestrutura de nuvem e processamento de e-mail) podem estar localizados fora do Brasil. Nesses casos, garantimos que as transferências internacionais de dados ocorrem em conformidade com a LGPD, por meio de:

• Cláusulas contratuais específicas de proteção de dados;
• Certificações internacionais reconhecidas (ex.: ISO/IEC 27001);
• Adequação ao nível de proteção exigido pela legislação brasileira.`,
  },
  {
    id: "menores",
    title: "11. Crianças e Adolescentes",
    content: `A Plataforma não é destinada a menores de 18 anos sem supervisão de responsável legal. Não coletamos intencionalmente dados de crianças e adolescentes.

Caso identifiquemos que coletamos dados de menores sem o devido consentimento parental, excluiremos esses dados imediatamente. Se você acredita que coletamos dados de um menor sem autorização, entre em contato conosco.`,
  },
  {
    id: "alteracoes",
    title: "12. Alterações nesta Política",
    content: `Podemos atualizar esta Política periodicamente para refletir mudanças em nossas práticas ou na legislação. A data da última revisão estará sempre indicada no topo deste documento.

Alterações materiais serão comunicadas por e-mail e/ou notificação na Plataforma com antecedência mínima de 10 (dez) dias. O uso continuado após a vigência das alterações constitui aceitação da nova versão.`,
  },
  {
    id: "dpo",
    title: "13. Contato e Encarregado (DPO)",
    content: `Para exercer seus direitos, tirar dúvidas ou registrar reclamações sobre o tratamento de seus dados pessoais, entre em contato com nosso Encarregado pelo Tratamento de Dados (DPO):

• E-mail: privacidade@feitodegente.com.br
• Formulário: feitodegente.com.br/contato
• Prazo de resposta: até 15 (quinze) dias corridos

Você também pode encaminhar reclamações à Autoridade Nacional de Proteção de Dados (ANPD): www.gov.br/anpd`,
  },
];

export default function PrivacidadePage() {
  const lastUpdate = "24 de abril de 2026";

  return (
    <div className="min-h-screen bg-[#f7f3ed]">
      {/* Header */}
      <div className="bg-[#1e3a5f] text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-white/50 text-sm mb-5">
            <Link href="/" className="hover:text-white transition-colors">Início</Link>
            <ChevronRight className="size-3.5" />
            <span className="text-white/80">Política de Privacidade</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Política de Privacidade</h1>
              <p className="text-white/60 text-sm mt-1">Última atualização: {lastUpdate}</p>
            </div>
          </div>
          <p className="text-white/70 text-sm max-w-2xl leading-relaxed">
            Sua privacidade é importante para nós. Esta Política explica quais dados coletamos,
            como os usamos e quais são seus direitos conforme a LGPD.
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
            {/* LGPD badge */}
            <div className="bg-[#4a7c3f]/8 border border-[#4a7c3f]/20 rounded-2xl p-5 text-sm text-[#1e3a5f] leading-relaxed">
              <strong>Adequado à LGPD.</strong> Esta política foi elaborada em conformidade com a Lei Geral de
              Proteção de Dados (Lei 13.709/18) e reflete nosso compromisso com a transparência e o respeito
              aos direitos dos titulares de dados.
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
              <p className="text-sm text-neutral-500 mb-3">Dúvidas sobre sua privacidade?</p>
              <Link
                href="/contato"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#1e3a5f] hover:text-[#e07b2a] transition-colors"
              >
                Entre em contato <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
