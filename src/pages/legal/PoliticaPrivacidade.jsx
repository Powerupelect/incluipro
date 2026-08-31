import { LegalDoc, Secao } from '../../components/legal/LegalDoc.jsx'

export function PoliticaPrivacidade() {
  return (
    <LegalDoc
      titulo="Política de Privacidade"
      atualizadoEm="31 de agosto de 2026"
      aviso={
        <>
          <strong>Minuta técnica — pendente de revisão jurídica.</strong> Este documento descreve
          como a IncluiPro trata dados pessoais hoje, mas ainda não foi revisado por um advogado.
          Não deve ser considerado uma declaração legal definitiva até essa revisão ser concluída.
        </>
      }
    >
      <Secao titulo="1. Quem somos">
        <p>
          A IncluiPro Soluções oferece uma plataforma (IncluiPro Avalia, IncluiPro Lidera) para
          empresas gerenciarem inclusão de pessoas com deficiência: relatórios técnicos, cota
          legal, documentação e solicitações de acessibilidade.
        </p>
      </Secao>

      <Secao titulo="2. Quais dados tratamos">
        <p>Dependendo do uso, tratamos:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Dados da empresa contratante (razão social, CNPJ, quadro de funcionários).</li>
          <li>Dados de identificação da conta responsável (nome, e-mail).</li>
          <li>
            Dados de colaboradores com deficiência cadastrados pela empresa — nome, cargo, tipo de
            deficiência, observações sobre a condição, laudos e comprovantes. Este é{' '}
            <strong>dado sensível de saúde</strong>, nos termos do art. 5º, II, e art. 11 da LGPD
            (Lei 13.709/2018).
          </li>
          <li>Registros de solicitações de acessibilidade e seu histórico de atendimento.</li>
        </ul>
      </Secao>

      <Secao titulo="3. Finalidade e base legal">
        <p>
          Os dados são tratados exclusivamente para viabilizar o cumprimento da cota legal de
          pessoas com deficiência (Lei 8.213/1991, art. 93), a gestão de adaptações razoáveis no
          ambiente de trabalho e a geração de relatórios e documentos de conformidade para a
          empresa contratante. A base legal para dado sensível de saúde é o consentimento do
          titular, obtido pela empresa contratante junto ao colaborador, e o cumprimento de
          obrigação legal da empresa quanto à cota.
        </p>
      </Secao>

      <Secao titulo="4. Onde os dados ficam armazenados">
        <p>
          Os dados são armazenados em banco de dados gerenciado pela Supabase (infraestrutura
          Postgres), com controle de acesso por linha (Row Level Security) — cada empresa só
          acessa seus próprios dados, e dentro da empresa, o acesso é limitado pelo papel de cada
          pessoa (admin, RH, gestor ou leitura). Arquivos anexados (laudos, comprovantes) ficam em
          um bucket de armazenamento privado, com as mesmas regras de acesso.
        </p>
      </Secao>

      <Secao titulo="5. Com quem compartilhamos (subprocessadores)">
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Supabase</strong> — banco de dados e armazenamento de arquivos.</li>
          <li><strong>Netlify</strong> — hospedagem da aplicação.</li>
          <li><strong>Hotmart</strong> — processamento de pagamento da assinatura.</li>
          <li><strong>Resend</strong> — envio de e-mails transacionais (confirmação de acesso).</li>
        </ul>
        <p>Não vendemos dados a terceiros, nem os usamos para publicidade.</p>
      </Secao>

      <Secao titulo="6. Retenção e exclusão">
        <p>
          Os dados ficam armazenados enquanto a conta da empresa estiver ativa. A empresa pode
          solicitar a exclusão definitiva de todos os seus dados a qualquer momento em Minha conta
          → Excluir conta e todos os dados — a exclusão é imediata e não pode ser desfeita.
        </p>
      </Secao>

      <Secao titulo="7. Direitos do titular">
        <p>
          Nos termos do art. 18 da LGPD, o titular dos dados pode solicitar confirmação de
          tratamento, acesso, correção, anonimização, portabilidade ou eliminação de seus dados.
          Como a IncluiPro trata os dados de colaboradores por indicação da empresa contratante
          (operador, não controlador desses dados), pedidos de titulares devem ser direcionados
          primeiro à empresa em que trabalham; a IncluiPro atende as solicitações que a empresa
          repassar.
        </p>
      </Secao>

      <Secao titulo="8. Contato">
        <p>
          Dúvidas sobre esta política:{' '}
          <a href="mailto:contato@incluipro.com" className="font-semibold text-signal-700 hover:text-signal-800">
            contato@incluipro.com
          </a>
        </p>
      </Secao>
    </LegalDoc>
  )
}
