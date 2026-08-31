import { LegalDoc, Secao } from '../../components/legal/LegalDoc.jsx'

export function Seguranca() {
  return (
    <LegalDoc titulo="Segurança" atualizadoEm="31 de agosto de 2026">
      <p>
        Esta página descreve o que existe de fato na infraestrutura da IncluiPro hoje — sem selo,
        sem promessa genérica.
      </p>

      <Secao titulo="Onde os dados ficam">
        <p>
          Banco de dados Postgres gerenciado pela Supabase. Arquivos anexados (laudos, comprovantes
          de adaptação) ficam em um bucket de armazenamento privado, também na Supabase.
        </p>
      </Secao>

      <Secao titulo="Quem acessa">
        <p>
          O controle de acesso é feito por Row Level Security (RLS) no próprio banco de dados —
          não é uma checagem só na tela, é uma regra que o banco aplica em toda consulta. Cada
          empresa só enxerga seus próprios dados. Dentro da empresa, o acesso varia por papel:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Admin</strong> — acesso completo, inclusive convidar e remover pessoas.</li>
          <li><strong>RH</strong> — cria e edita colaboradores, relatórios, laudos e solicitações.</li>
          <li><strong>Gestor</strong> — mesmo acesso de RH, restrito à sua unidade.</li>
          <li><strong>Leitura</strong> — visualiza e baixa, sem editar. Não vê a Central de Acessibilidade, por conter dado sensível de outra natureza (pedidos individuais).</li>
        </ul>
        <p>A equipe da IncluiPro não acessa os dados das empresas no uso normal do produto.</p>
      </Secao>

      <Secao titulo="Backup">
        <p>
          Além do backup gerenciado pela Supabase na própria infraestrutura, a plataforma oferece
          um backup manual em JSON (Minha conta → Backup de dados), que a empresa pode exportar e
          guardar por conta própria a qualquer momento.
        </p>
      </Secao>

      <Secao titulo="Exclusão">
        <p>
          A empresa pode excluir definitivamente todos os seus dados (colaboradores, relatórios,
          laudos, solicitações) em Minha conta → Excluir conta e todos os dados. A exclusão é
          imediata no banco de dados e não pode ser desfeita depois de confirmada.
        </p>
      </Secao>

      <Secao titulo="Subprocessadores">
        <ul className="list-disc space-y-1 pl-5">
          <li>Supabase — banco de dados e armazenamento de arquivos.</li>
          <li>Netlify — hospedagem.</li>
          <li>Hotmart — pagamento.</li>
          <li>Resend — e-mail transacional.</li>
        </ul>
      </Secao>

      <Secao titulo="O que ainda não fizemos">
        <p>
          Sendo direto: ainda não passamos por uma auditoria de segurança externa formal (pentest).
          Isso está no radar, não é uma promessa com data. Se você é do time de TI e quer detalhes
          técnicos adicionais antes de aprovar o uso, fale com{' '}
          <a href="mailto:contato@incluipro.com" className="font-semibold text-signal-700 hover:text-signal-800">
            contato@incluipro.com
          </a>
          .
        </p>
      </Secao>
    </LegalDoc>
  )
}
