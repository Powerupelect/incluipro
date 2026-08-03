# IncluiPro Soluções

Aplicação web (Vite + React + Tailwind CSS) para a IncluiPro Soluções — consultoria especializada
em inclusão de pessoas com deficiência (PCD) no mercado de trabalho, com metodologia própria de
avaliação social e formação de lideranças.

## Stack

- **Vite + React** (JavaScript, `.jsx`)
- **Tailwind CSS v4** (via `@tailwindcss/vite`), com sistema de design próprio em `src/index.css`
- **react-router-dom** para navegação
- **react-markdown** para renderizar os relatórios estruturados
- **jsPDF** para exportar o relatório do IncluiPro Avalia em PDF, seguindo o modelo visual
  validado (`src/lib/pdf.js`)

## Estrutura

```
src/
  pages/          páginas públicas (Home, Diagnóstico, Produtos, Login, Cadastro)
  pages/app/       páginas da área logada (Avalia, Lidera, Conta)
  components/      layout (header/footer/sidebar) e componentes de UI
  lib/             auth mockada, diagnóstico, montagem de relatórios, recursos de
                   acessibilidade por deficiência, storage local
```

## Rodando o projeto

```bash
npm install
npm run dev
```

## Fluxo de navegação

`/` (Home) → `/diagnostico` (diagnóstico gratuito com captura de lead) → `/produtos` (planos) →
`/cadastro` ou `/login` (autenticação mockada) → `/app/avalia` (monta relatórios estruturados de
avaliação social) e `/app/lidera` (biblioteca de kits de treinamento).

## O que está mockado nesta primeira versão

O objetivo desta versão é validar a experiência completa do produto antes de conectar serviços
reais. Por isso:

- **Autenticação**: cadastro/login de empresas é simulado com `localStorage`
  (`src/lib/auth.jsx`). Não há backend, hashing de senha ou verificação de e-mail.
  `// TODO: substituir por autenticação real (ex: Supabase Auth, Firebase Auth ou backend próprio)`.
- **Banco de dados**: leads do diagnóstico (`src/lib/leads.js`) e histórico de relatórios do
  IncluiPro Avalia (`src/lib/reports.js`) ficam apenas no `localStorage` do navegador.
  `// TODO: integrar com backend/CRM` e `// TODO: persistir em banco de dados real`.
- **Pagamentos**: não há nenhum botão de assinatura ou cobrança ativo nesta versão — Minha Conta
  e a página de Produtos exibem "Acesso para testes" no lugar de qualquer CTA de pagamento.
  `// TODO: integrar com Stripe Billing ou Hotmart/Kiwify quando o plano pago for ativado`.
- **Armazenamento de arquivos**: os kits do IncluiPro Lidera são os PDFs reais, servidos como
  arquivos estáticos em `public/kits/`. Isso funciona para este protótipo, mas para produção
  `// TODO: conectar com armazenamento real dos arquivos (ex: S3, Supabase Storage)` — hoje eles
  ficam no bundle publicado do site, sem controle de acesso.

## IncluiPro Avalia — montagem do relatório e PDF

O relatório é **montado de forma estruturada** a partir das anotações preenchidas pelo avaliador
em cada bloco do formulário (`src/lib/montarRelatorio.js`) — sem chamada a serviço externo. Uma
**Consulta Rápida** lateral (`src/components/ConsultaRapida.jsx`) sugere recursos e ajustes de
acessibilidade organizados por tipo de deficiência (`src/lib/accessibilityResources.js`), com
detecção automática a partir do campo "Tipo de deficiência" e seleção manual dos itens a incluir
no relatório.

O texto final pode ser **editado livremente** antes de ser finalizado (botões "✏️ Editar
Relatório" / "💾 Salvar Alterações") e exportado como **PDF** (📄) seguindo o modelo visual
validado da IncluiPro: cabeçalho com logo, título e frase de abertura fixos, barras de seção
alternando entre as cores da marca, tabelas de identificação/deficiência e rodapé fixo com os
avisos legais. A lógica de geração fica em `src/lib/pdf.js` — ela lê o texto atual do relatório
(original ou editado) e monta o PDF programaticamente com jsPDF.

O histórico de relatórios ("📂 Meus Relatórios", dentro do IncluiPro Avalia) tem busca por
candidato/empresa e ações de abrir, editar, baixar PDF e excluir por item.

## Considerações importantes

### LGPD e dados sensíveis

O **IncluiPro Avalia** processa dados sensíveis — informações de saúde, deficiência e rotina de
candidatos — o que se enquadra como dado sensível sob a LGPD (Lei 13.709/2018). Quando a
persistência de dados for implementada de verdade (banco de dados real, no lugar do
`localStorage` usado neste protótipo), é necessário, no mínimo:

- **Criptografia em repouso** para os dados armazenados (relatórios, anotações de entrevista).
- **Política de retenção de dados** definida e documentada (por quanto tempo os relatórios ficam
  armazenados, quando e como são anonimizados ou excluídos).
- **Termo de uso e política de privacidade específicos**, informando aos candidatos como seus
  dados serão tratados, com base legal adequada (geralmente consentimento explícito, dado o
  caráter sensível da informação).
- Controle de acesso por empresa/conta, para que uma empresa nunca veja relatórios de candidatos
  avaliados por outra.

### Autenticação, banco de dados e pagamentos mockados

Como listado acima, autenticação, persistência de dados e cobrança de assinatura estão
simulados nesta primeira versão. O objetivo é validar o fluxo completo de experiência —
diagnóstico → cadastro/login → geração de relatórios → biblioteca de treinamentos — antes de
investir em integrações com serviços reais.
