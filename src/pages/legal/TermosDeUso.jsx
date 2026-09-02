import { LegalDoc, Secao } from '../../components/legal/LegalDoc.jsx'

export function TermosDeUso() {
  return (
    <LegalDoc
      titulo="Termos de Uso"
      atualizadoEm="2 de setembro de 2026"
    >
      <Secao titulo="1. Aceite">
        <p>
          Ao criar uma conta na IncluiPro, você declara que leu e concorda com estes Termos de Uso
          e com a Política de Privacidade. Se não concordar, não utilize a plataforma.
        </p>
      </Secao>

      <Secao titulo="2. O que a IncluiPro é (e o que não é)">
        <p>
          A IncluiPro é uma ferramenta de apoio à gestão de inclusão de pessoas com deficiência:
          cálculo de referência da cota legal, relatórios técnicos, triagem documental e
          organização de solicitações de acessibilidade. A IncluiPro{' '}
          <strong>não é um serviço de consultoria jurídica, médica ou de assessoria fiscal</strong>
          . Os cálculos e classificações apresentados são indicativos, calculados a partir dos
          dados informados pela própria empresa, e não substituem análise por profissional
          habilitado (advogado, médico do trabalho, perito) nem constituem garantia de conformidade
          perante a fiscalização.
        </p>
      </Secao>

      <Secao titulo="3. Conta e responsabilidade pelos dados">
        <p>
          A empresa contratante é responsável pela exatidão dos dados que cadastra, pelo controle
          de acesso interno (definindo corretamente o papel de cada pessoa da equipe) e por obter
          o consentimento adequado dos colaboradores cujos dados sensíveis de saúde são inseridos
          na plataforma.
        </p>
      </Secao>

      <Secao titulo="4. Uso aceitável">
        <p>
          É proibido usar a plataforma para fins discriminatórios, para armazenar dados de pessoas
          sem base legal adequada, ou para tentar acessar dados de outra empresa além da sua.
        </p>
      </Secao>

      <Secao titulo="5. Assinatura e pagamento">
        <p>
          O acesso à plataforma depende de assinatura ativa, processada pela Hotmart. O
          cancelamento segue as condições descritas na página de Assinatura.
        </p>
      </Secao>

      <Secao titulo="6. Disponibilidade">
        <p>
          A IncluiPro é oferecida "como está". Fazemos esforço razoável para manter o serviço
          disponível, mas não garantimos disponibilidade ininterrupta.
        </p>
      </Secao>

      <Secao titulo="7. Alterações">
        <p>
          Estes termos podem ser atualizados; alterações relevantes serão comunicadas por e-mail
          para a conta responsável.
        </p>
      </Secao>

      <Secao titulo="8. Contato">
        <p>
          <a href="mailto:contato@incluipro.com" className="font-semibold text-signal-700 hover:text-signal-800">
            contato@incluipro.com
          </a>
        </p>
      </Secao>
    </LegalDoc>
  )
}
