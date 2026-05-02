import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Adesão do Vendedor | Feito de Gente",
  description: "Termos e condições para artesãos que desejam vender na plataforma Feito de Gente.",
};

export default function TermosDoVendedorPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1e3a5f]">Termos de Adesão do Vendedor</h1>
        <p className="text-neutral-500 mt-2 text-sm">
          Última atualização: maio de 2025
        </p>
      </div>

      <p className="text-neutral-600 leading-relaxed">
        Ao se cadastrar como artesão na plataforma <strong>Feito de Gente</strong>, você declara
        ter lido, compreendido e concordado com todos os termos e condições descritos neste
        documento. O aceite é obrigatório para utilizar os serviços de venda da plataforma.
      </p>

      <Section title="1. Quem pode vender">
        <p>
          Qualquer pessoa física ou jurídica que produza artesanato de forma autoral — incluindo
          cerâmica, tecelagem, bordado, marcenaria, joias, esculturas, itens de decoração e demais
          produtos feitos à mão — pode solicitar cadastro como artesão.
        </p>
        <p className="mt-3">
          A aprovação do cadastro está sujeita à análise da equipe da plataforma, que verificará
          autenticidade das informações e adequação dos produtos aos princípios da plataforma.
          Reservamo-nos o direito de recusar ou cancelar cadastros sem necessidade de justificativa.
        </p>
      </Section>

      <Section title="2. Produtos permitidos e proibidos">
        <p>São permitidos:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-neutral-600">
          <li>Produtos artesanais produzidos pelo próprio vendedor</li>
          <li>Produtos com matéria-prima de procedência legal e comprovável</li>
          <li>Produtos personalizados sob encomenda</li>
        </ul>
        <p className="mt-3">São proibidos:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-neutral-600">
          <li>Produtos industrializados ou de revenda sem transformação artesanal</li>
          <li>Réplicas, cópias ou produtos que infrinjam direitos autorais de terceiros</li>
          <li>Produtos feitos com materiais proibidos por lei (madeira sem certificação IBAMA, animais silvestres etc.)</li>
          <li>Qualquer produto ilegal no território nacional</li>
        </ul>
        <p className="mt-3">
          A plataforma pode remover produtos que violem estas regras a qualquer momento,
          sem aviso prévio.
        </p>
      </Section>

      <Section title="3. Comissões e pagamentos">
        <p>
          A plataforma retém uma comissão sobre cada venda concluída, conforme o plano de
          assinatura do artesão:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-neutral-600">
          <li><strong>Plano Grátis:</strong> 15% de comissão por venda</li>
          <li><strong>Plano Básico:</strong> 10% de comissão por venda</li>
          <li><strong>Plano Pro:</strong> 7% de comissão por venda</li>
        </ul>
        <p className="mt-3">
          Os pagamentos são processados pela plataforma Asaas. O saldo líquido (valor da venda
          menos comissão e frete) fica disponível para saque em até <strong>7 dias úteis</strong>{" "}
          após a confirmação da entrega pelo comprador.
        </p>
        <p className="mt-3">
          O valor mínimo para solicitação de saque é de <strong>R$ 50,00</strong>. Para receber,
          o artesão deve manter CPF ou CNPJ válido e dados bancários atualizados no painel.
        </p>
        <p className="mt-3">
          Em caso de estorno, chargeback ou cancelamento solicitado pelo comprador, o valor
          correspondente será debitado do saldo disponível do artesão.
        </p>
      </Section>

      <Section title="4. Frete e envio">
        <p>
          O custo do frete é calculado automaticamente pela plataforma com base no CEP do
          comprador e no estado de origem do artesão, sendo cobrado integralmente do comprador
          no momento da compra.
        </p>
        <p className="mt-3">O artesão se compromete a:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-neutral-600">
          <li>Embalar o produto de forma adequada para transporte, protegendo contra avarias</li>
          <li>Postar o produto nos Correios em até <strong>3 dias úteis</strong> após a confirmação do pedido</li>
          <li>Inserir o código de rastreamento no painel da plataforma assim que disponível</li>
          <li>Comunicar ao comprador e à plataforma qualquer atraso no envio</li>
        </ul>
        <p className="mt-3">
          Produtos danificados por embalagem inadequada são de responsabilidade exclusiva do
          artesão. A plataforma pode debitar o custo de reenvio ou reembolso do saldo do artesão.
        </p>
      </Section>

      <Section title="5. Fotos e descrições dos produtos">
        <p>
          O artesão é responsável pela qualidade e veracidade das fotos e descrições publicadas.
          São obrigatórias:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-neutral-600">
          <li>Fotos reais dos produtos produzidos pelo próprio artesão</li>
          <li>Descrições precisas incluindo materiais, dimensões e cuidados com o produto</li>
          <li>Preços corretos e atualizados</li>
        </ul>
        <p className="mt-3">
          É proibido usar fotos de terceiros sem autorização, imagens geradas por IA como
          representação do produto real, ou qualquer conteúdo que induza o comprador ao erro.
        </p>
      </Section>

      <Section title="6. Prazos de produção">
        <p>
          Produtos sob encomenda devem ter o prazo de produção claramente informado na
          descrição. O artesão deve cumprir os prazos publicados. Em caso de impossibilidade,
          deve informar o comprador e a plataforma imediatamente, permitindo o cancelamento
          sem penalidade ao comprador.
        </p>
      </Section>

      <Section title="7. Avaliações e qualidade">
        <p>
          Os compradores podem avaliar os produtos e a experiência de compra após o recebimento.
          A plataforma monitora a reputação dos artesãos e pode:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-neutral-600">
          <li>Suspender temporariamente artesãos com avaliação média abaixo de 3.0</li>
          <li>Cancelar o cadastro de artesãos com reclamações recorrentes não resolvidas</li>
          <li>Remover produtos com avaliações consistentemente negativas</li>
        </ul>
      </Section>

      <Section title="8. Planos de assinatura">
        <p>
          O artesão pode optar pelos planos Grátis, Básico ou Pro. Os planos pagos são cobrados
          mensalmente via cartão de crédito ou boleto. O cancelamento pode ser feito a qualquer
          momento pelo painel, sem multa, com vigência até o final do período já pago.
        </p>
        <p className="mt-3">
          A plataforma pode alterar os preços dos planos com aviso prévio de <strong>30 dias</strong>.
          O artesão pode cancelar a assinatura sem custo caso não concorde com os novos valores.
        </p>
      </Section>

      <Section title="9. Propriedade intelectual">
        <p>
          O artesão mantém todos os direitos sobre seus produtos e criações. Ao publicar na
          plataforma, concede à <strong>Feito de Gente</strong> licença não exclusiva e gratuita
          para usar as imagens e descrições dos produtos exclusivamente para fins de divulgação
          e operação da plataforma, enquanto o produto estiver listado.
        </p>
      </Section>

      <Section title="10. Suspensão e cancelamento">
        <p>A plataforma pode suspender ou cancelar o cadastro do artesão nos seguintes casos:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-neutral-600">
          <li>Violação de qualquer item destes termos</li>
          <li>Fraude ou tentativa de fraude</li>
          <li>Inadimplência no pagamento da assinatura por mais de 15 dias</li>
          <li>Comportamento abusivo com compradores ou com a equipe da plataforma</li>
          <li>Produtos que causem danos, reclamações ao PROCON ou processos judiciais</li>
        </ul>
        <p className="mt-3">
          Em caso de suspensão, pedidos em andamento serão concluídos e o saldo disponível
          será repassado ao artesão após o período de contestação (30 dias).
        </p>
      </Section>

      <Section title="11. Limitação de responsabilidade">
        <p>
          A <strong>Feito de Gente</strong> é uma plataforma intermediária e não se responsabiliza
          pela qualidade, autenticidade ou entrega dos produtos, sendo essa responsabilidade
          exclusiva do artesão vendedor. A plataforma atua como facilitadora da transação,
          não sendo parte do contrato de compra e venda entre artesão e comprador.
        </p>
      </Section>

      <Section title="12. Foro e legislação">
        <p>
          Este contrato é regido pelas leis da República Federativa do Brasil. Fica eleito o
          foro da comarca de São Paulo/SP para dirimir quaisquer controvérsias decorrentes
          deste instrumento.
        </p>
      </Section>

      <div className="border-t border-neutral-200 pt-6 text-sm text-neutral-500">
        <p>
          Dúvidas? Entre em contato pelo{" "}
          <a href="/contato" className="text-[#1e3a5f] underline hover:text-[#e07b2a] transition-colors">
            formulário de contato
          </a>{" "}
          ou pelo e-mail{" "}
          <a href="mailto:contato@feitodegente.com.br" className="text-[#1e3a5f] underline hover:text-[#e07b2a] transition-colors">
            contato@feitodegente.com.br
          </a>
          .
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold text-[#1e3a5f]">{title}</h2>
      <div className="text-neutral-600 leading-relaxed text-sm">{children}</div>
    </section>
  );
}
