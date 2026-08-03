# IncluiPro Soluções

Aplicação web (Vite + React + Tailwind CSS) para a IncluiPro Soluções — consultoria especializada
em inclusão de pessoas com deficiência (PCD) no mercado de trabalho, com metodologia própria
apoiada por IA.

## Stack

- **Vite + React** (JavaScript, `.jsx`)
- **Tailwind CSS v4** (via `@tailwindcss/vite`), com sistema de design próprio em `src/index.css`
- **react-router-dom** para navegação
- **react-markdown** para renderizar os relatórios gerados por IA
- **jsPDF** para exportar o relatório do IncluiPro Avalia em PDF, seguindo o modelo visual
  validado (`src/lib/pdf.js`)

## Estrutura

```
src/
  pages/          páginas públicas (Home, Diagnóstico, Produtos, Login, Cadastro)
  pages/app/       páginas da área logada (Avalia, Lidera, Conta)
  components/      layout (header/footer/sidebar) e componentes de UI
  lib/             auth mockada, diagnóstico, integração com API da Anthropic, storage local
```

## Rodando o projeto

```bash
npm install
npm run dev
```

Opcionalmente, copie `.env.example` para `.env` e informe uma chave de API da Anthropic em
`VITE_ANTHROPIC_API_KEY` para usar o IncluiPro Avalia sem precisar configurá-la pela tela
"Minha conta". A chave configurada em "Minha conta" tem prioridade sobre a variável de ambiente.

## Fluxo de navegação

`/` (Home) → `/diagnostico` (diagnóstico gratuito com captura de lead) → `/produtos` (planos) →
`/cadastro` ou `/login` (autenticação mockada) → `/app/avalia` (gera relatórios com IA) e
`/app/lidera` (biblioteca de kits de treinamento).

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

## IncluiPro Avalia — relatório em PDF

O relatório gerado pela IA pode ser **editado livremente** antes de ser finalizado (botões
"✏️ Editar Relatório" / "💾 Salvar Alterações") e exportado como **PDF** (📄) seguindo o modelo
visual validado da IncluiPro: cabeçalho com logo, título e frase de abertura fixos, barras de
seção alternando entre as cores da marca, tabelas de identificação/deficiência e rodapé fixo com
os avisos legais. A lógica de geração fica em `src/lib/pdf.js` — ela lê o texto atual do
relatório (original ou editado) e monta o PDF programaticamente com jsPDF, sem depender de
serviço externo.

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
- **Termo de uso e política de privacidade específicos**, informando aos candidatos que seus
  dados serão tratados por uma ferramenta com apoio de IA, com base legal adequada (geralmente
  consentimento explícito, dado o caráter sensível da informação).
- Controle de acesso por empresa/conta, para que uma empresa nunca veja relatórios de candidatos
  avaliados por outra.

### Exposição da chave de API da Anthropic

A chamada ao **IncluiPro Avalia** é feita **diretamente do front-end** para
`https://api.anthropic.com/v1/messages` (ver `src/lib/anthropic.js`), o que expõe a chave de API
no navegador de quem estiver logado. Isso é **aceitável apenas para prototipagem**. Para
produção, é necessário mover essa chamada para um backend ou proxy (ex: função serverless) que
guarde a chave de API de forma segura e nunca a exponha ao cliente.

### Autenticação, banco de dados e pagamentos mockados

Como listado acima, autenticação, persistência de dados e cobrança de assinatura estão
simulados nesta primeira versão. O objetivo é validar o fluxo completo de experiência —
diagnóstico → cadastro/login → geração de relatórios → biblioteca de treinamentos — antes de
investir em integrações com serviços reais.
