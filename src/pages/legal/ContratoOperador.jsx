import { LegalDoc, Secao } from '../../components/legal/LegalDoc.jsx'

export function ContratoOperador() {
  return (
    <LegalDoc
      titulo="Contrato de Operador de Dados"
      atualizadoEm="2 de setembro de 2026"
    >
      <Secao titulo="1. Papéis">
        <p>
          A empresa contratante é <strong>controladora</strong> dos dados pessoais e sensíveis de
          seus colaboradores inseridos na plataforma. A IncluiPro atua como{' '}
          <strong>operadora</strong>, tratando esses dados apenas conforme as instruções da
          controladora e para as finalidades descritas na Política de Privacidade, nos termos do
          art. 39 da LGPD. Para a versão assinável deste contrato, solicite em{' '}
          <a href="mailto:contato@incluipro.com" className="font-semibold text-indigo-700 underline">
            contato@incluipro.com
          </a>
          .
        </p>
      </Secao>

      <Secao titulo="2. Obrigações da IncluiPro (operadora)">
        <ul className="list-disc space-y-1 pl-5">
          <li>Tratar os dados apenas para viabilizar a funcionalidade contratada.</li>
          <li>
            Manter controle de acesso técnico (Row Level Security por empresa e por papel de
            usuário) e não permitir acesso de uma empresa aos dados de outra.
          </li>
          <li>Notificar a controladora em caso de incidente de segurança envolvendo seus dados.</li>
          <li>
            Excluir definitivamente os dados quando solicitado pela controladora, via Minha conta
            → Excluir conta e todos os dados.
          </li>
          <li>Não sub-contratar tratamento além dos subprocessadores listados na Política de Privacidade.</li>
        </ul>
      </Secao>

      <Secao titulo="3. Obrigações da empresa contratante (controladora)">
        <ul className="list-disc space-y-1 pl-5">
          <li>Ter base legal adequada para inserir dados de seus colaboradores na plataforma.</li>
          <li>Configurar corretamente os papéis de acesso de sua equipe (admin, RH, gestor, leitura).</li>
          <li>Atender diretamente solicitações de titulares (colaboradores) sobre seus dados.</li>
        </ul>
      </Secao>

      <Secao titulo="4. Vigência">
        <p>
          Este contrato vigora enquanto durar a assinatura da plataforma pela empresa contratante.
        </p>
      </Secao>
    </LegalDoc>
  )
}
