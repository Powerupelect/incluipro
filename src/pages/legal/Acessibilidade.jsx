import { LegalDoc, Secao } from '../../components/legal/LegalDoc.jsx'

export function Acessibilidade() {
  return (
    <LegalDoc titulo="Declaração de Acessibilidade" atualizadoEm="31 de agosto de 2026">
      <p>
        Uma plataforma de inclusão que não é acessível é uma contradição. Esta página descreve o
        estado real da acessibilidade da IncluiPro — sem alegar uma certificação que não temos.
      </p>

      <Secao titulo="O que buscamos como referência">
        <p>
          Trabalhamos as diretrizes WCAG 2.1, nível AA, como referência de qualidade: rótulo em
          todo campo de formulário, navegação por teclado, contraste de cor adequado, indicador de
          foco visível, texto alternativo em imagens, hierarquia de cabeçalhos consistente.
        </p>
      </Secao>

      <Secao titulo="Status atual">
        <p>
          <strong>
            Ainda não passamos por uma auditoria formal de acessibilidade (manual, com leitor de
            tela real e usuários com deficiência) — por isso não declaramos conformidade WCAG 2.1
            AA completa neste momento.
          </strong>{' '}
          O que existe hoje: campos de formulário com rótulo associado, navegação e ativação de
          menus/modais por teclado nos fluxos principais, paleta de cores pensada para contraste
          adequado no texto padrão.
        </p>
      </Secao>

      <Secao titulo="Lacunas conhecidas">
        <p>
          Ainda não testamos formalmente a plataforma inteira com leitores de tela (NVDA, JAWS,
          VoiceOver), nem fizemos uma varredura de contraste em cada componente visual. Tabelas
          densas (como a matriz de compatibilidade) podem não ter a melhor experiência com leitor
          de tela ainda.
        </p>
      </Secao>

      <Secao titulo="Fale com a gente">
        <p>
          Se você encontrar uma barreira de acessibilidade usando a IncluiPro, ou é de uma equipe
          de D&I avaliando a plataforma, escreva para{' '}
          <a href="mailto:contato@incluipro.com" className="font-semibold text-signal-700 hover:text-signal-800">
            contato@incluipro.com
          </a>
          . Tratamos isso como prioridade, não como reclamação.
        </p>
      </Secao>
    </LegalDoc>
  )
}
