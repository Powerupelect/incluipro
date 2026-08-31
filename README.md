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
- **Netlify Functions + Netlify Blobs** (`netlify/functions/`) — backend real (não mockado) para
  liberação de acesso via webhook da Hotmart e painel administrativo. Ver seção
  [Pagamentos e liberação de acesso (Hotmart)](#pagamentos-e-liberação-de-acesso-hotmart) abaixo.

## Estrutura

```
src/
  pages/           páginas públicas (Home, Diagnóstico, Produtos, Assinatura, Login, Cadastro)
  pages/app/       páginas da área logada (Avalia, Lidera, Conta)
  pages/admin/     login e painel administrativo (liberação manual de acesso)
  components/      layout (header/footer/sidebar) e componentes de UI
  lib/             auth mockada, diagnóstico, montagem de relatórios, recursos de
                   acessibilidade por deficiência, cliente da API, storage local
netlify/
  functions/       backend real: webhook da Hotmart, checagem de acesso, painel admin
```

## Rodando o projeto

```bash
npm install
npm run dev
```

Isso roda apenas o front-end (Vite) — as rotas `/api/*` (Netlify Functions) não respondem nesse
modo. Para testar o fluxo completo de pagamento/acesso localmente é necessário `netlify dev` (ver
seção de deploy abaixo); sem isso, `/app` mostra "Não foi possível verificar seu acesso", que é o
comportamento esperado e seguro (o sistema nunca libera acesso quando não consegue confirmar).

## Fluxo de navegação

`/` (Home) → `/diagnostico` (diagnóstico gratuito com captura de lead) → `/produtos` ou
`/assinatura` (planos e pagamento real via Hotmart) → `/cadastro` ou `/login` (autenticação
mockada) → `/app/avalia` (monta relatórios estruturados de avaliação social) e `/app/lidera`
(biblioteca de kits de treinamento). `/admin` é a área restrita da equipe IncluiPro para liberação
manual de acesso.

## O que está mockado nesta versão

- **Autenticação**: cadastro/login de empresas é simulado com `localStorage`
  (`src/lib/auth.jsx`). Não há backend, hashing de senha ou verificação de e-mail.
  `// TODO: substituir por autenticação real (ex: Supabase Auth, Firebase Auth ou backend próprio)`.
  A liberação de **acesso à plataforma**, por outro lado, já é real — ver seção de pagamentos.
- **Banco de dados de relatórios**: leads do diagnóstico (`src/lib/leads.js`) e histórico de
  relatórios do IncluiPro Avalia (`src/lib/reports.js`) ficam apenas no `localStorage` do
  navegador. `// TODO: integrar com backend/CRM` e `// TODO: persistir em banco de dados real`.
- **Armazenamento de arquivos**: os kits do IncluiPro Lidera são os PDFs reais, servidos como
  arquivos estáticos em `public/kits/`. Isso funciona para este protótipo, mas para produção
  `// TODO: conectar com armazenamento real dos arquivos (ex: S3, Supabase Storage)` — hoje eles
  ficam no bundle publicado do site, sem controle de acesso.

## Pagamentos e liberação de acesso (Hotmart)

A assinatura (`/assinatura`) e o Produtos (`/produtos`) usam links reais de pagamento da Hotmart:

- **Mensal — R$ 69,90**: `https://pay.hotmart.com/W106997348I`
- **Vitalício — R$ 247**: `https://pay.hotmart.com/B106997595Q?bid=1785730636924`

O acesso a `/app` é controlado por um backend real em `netlify/functions/`, com os registros de
quem está liberado guardados em **Netlify Blobs** (armazenamento embutido do Netlify — não exige
criar conta em outro serviço de banco de dados).

### Como funciona

1. **`netlify/functions/hotmart-webhook.mjs`** recebe as notificações da Hotmart. No evento
   `PURCHASE_APPROVED`, libera automaticamente o e-mail do comprador e envia o e-mail de
   confirmação. Nos eventos de cancelamento/reembolso/chargeback, bloqueia o acesso.
2. **`netlify/functions/access-check.mjs`** é usado pela página `/assinatura` e por `ProtectedRoute`
   (`src/components/ProtectedRoute.jsx`) para verificar se um e-mail está liberado antes de
   permitir a entrada em `/app`.
3. **`/admin`** (login em `/admin/login`) permite cadastrar, bloquear ou remover acesso
   manualmente — útil como fallback para casos que não vieram pela Hotmart, ou para liberar
   alguém antes do pagamento cair. O e-mail `esterpop.59@gmail.com` (configurável via
   `ADMIN_EMAIL`) sempre tem acesso total a `/app`, sem depender de nenhum registro de pagamento.

### O que você precisa configurar após o deploy

Nenhuma dessas informações pode ser preenchida por quem desenvolveu o código — são credenciais da
sua conta. Configure em **Netlify → Site settings → Environment variables**:

| Variável | Para que serve | Onde conseguir |
| --- | --- | --- |
| `HOTMART_HOTTOK` | Valida que o webhook realmente veio da Hotmart | Painel Hotmart → Ferramentas → Webhook, ao cadastrar a URL `https://SEUSITE.netlify.app/api/hotmart-webhook`. Copie o mesmo valor para cá. |
| `ADMIN_EMAIL` | E-mail com acesso total, sem precisar de pagamento | `esterpop.59@gmail.com` (padrão já no código, só precisa definir se quiser trocar) |
| `ADMIN_PASSWORD` | Senha de login em `/admin` | Escolha uma senha forte |
| `ADMIN_SECRET` | Chave usada para assinar o token de sessão do admin | Qualquer string longa e aleatória |
| `RESEND_API_KEY` | Envio do e-mail de confirmação de pagamento | Conta gratuita em [resend.com](https://resend.com) → API Keys |
| `RESEND_FROM` (opcional) | Remetente do e-mail | Padrão `IncluiPro <onboarding@resend.dev>` — troque depois de verificar um domínio próprio no Resend |

**Sem `RESEND_API_KEY`, o sistema continua funcionando** — o acesso é liberado normalmente, só o
e-mail de confirmação não é enviado (fica registrado como pendente na resposta do webhook, visível
nos logs da function).

### Deploy: por que não dá mais para usar o Netlify Drop

Netlify Functions não funcionam com "arrastar a pasta `dist/` para o Netlify Drop" — esse modo só
serve arquivos estáticos. A partir desta versão, publique de um dos dois jeitos:

**Opção A — Netlify CLI (mais rápido, não precisa de GitHub):**
```bash
npm install -g netlify-cli
netlify login
netlify init          # ou: netlify link, se o site já existir
netlify deploy --prod
```

**Opção B — conectar o repositório ao Netlify (recomendado para deploys contínuos):** crie o site
em app.netlify.com → "Import from Git", aponte para este repositório/branch. O `netlify.toml` já
está configurado (`npm run build`, `publish = "dist"`, `functions = "netlify/functions"`) — não
precisa mexer em nada.

Depois do primeiro deploy, configure as variáveis de ambiente da tabela acima e cadastre o webhook
na Hotmart apontando para `https://SEUSITE.netlify.app/api/hotmart-webhook`.

### Testado localmente

A lógica de todas as functions (`netlify/functions/`) foi testada diretamente — validação do
Hottok, liberação/bloqueio automático por evento, geração e verificação do token do admin, e o
fallback gracioso de e-mail sem `RESEND_API_KEY`. O `netlify dev` (que rodaria o fluxo completo
end-to-end, incluindo o Netlify Blobs real) não pôde ser executado neste ambiente de
desenvolvimento por bloqueio de rede ao baixar o runtime de Edge Functions — o comportamento real
em produção (Blobs, Hotmart, Resend) deve ser conferido após o primeiro deploy.

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
candidatos — o que se enquadra como dado sensível sob a LGPD (Lei 13.709/2018). Desde a Etapa 3,
os dados ficam em Postgres gerenciado pela Supabase (não mais em `localStorage`), com Row Level
Security isolando os dados de cada empresa e, dentro dela, por papel de acesso (admin/RH/gestor/
leitura — Etapa 6). A Etapa 11 tratou o restante do requisito legal:

- **Termos de Uso, Política de Privacidade e Contrato de Operador** publicados em `/termos-de-uso`,
  `/privacidade` e `/contrato-operador` (`src/pages/legal/`) — ainda **minutas técnicas, pendentes
  de revisão por advogado**, sinalizado no próprio texto de cada página.
- **Aceite de termos com data registrada**: checkbox obrigatório no cadastro (`Cadastro.jsx`),
  gravado em `contas.aceite_termos_em` / `contas.aceite_termos_versao` (`schema_etapa11.sql`).
- **Aviso de finalidade** nos formulários com dado de saúde (Avalia, Triagem de Laudos, Central de
  Acessibilidade), com link para a Política de Privacidade.
- **Exclusão definitiva**: Minha conta → "Excluir conta e todos os dados" (admin, com confirmação
  digitando o nome da empresa) — apaga a empresa e tudo vinculado a ela por cascata de FK.
- **Política de retenção declarada** em `/privacidade` e `/seguranca`.
- Página `/seguranca` (11.3) descreve o que existe de fato — onde os dados ficam, quem acessa,
  backup, exclusão, subprocessadores — para o time de TI do cliente avaliar.

O que ainda depende de trabalho fora do código: revisão jurídica das três minutas antes de valerem
como documento legal definitivo, e uma auditoria de acessibilidade formal (ver `/acessibilidade`,
que já deixa claro que WCAG 2.1 AA ainda não foi certificado, só perseguido como referência).

### Segurança da liberação de acesso

- O webhook da Hotmart só aceita requisições cujo header `X-HOTMART-HOTTOK` bata exatamente com
  `HOTMART_HOTTOK` — sem essa variável configurada, o endpoint rejeita todo tráfego (falha
  fechada, nunca aberta).
- O painel `/admin` exige e-mail + senha (`ADMIN_EMAIL` / `ADMIN_PASSWORD`) e emite um token
  assinado (`ADMIN_SECRET`) com validade de 12h; todas as ações de listar/liberar/bloquear/remover
  exigem esse token.
- `ProtectedRoute` nunca libera acesso por padrão: se a checagem de acesso falhar por qualquer
  motivo (rede, backend fora do ar), mostra um erro explícito com opção de tentar de novo — nunca
  deixa passar silenciosamente.

### Autenticação e persistência

Autenticação (login/cadastro), empresas, colaboradores, avaliações, laudos e solicitações de
acessibilidade usam Supabase real desde a Etapa 3 — não há mais simulação em `localStorage`. A
liberação de acesso por pagamento continua em backend próprio (Netlify Functions + Blobs), como
descrito acima. Ver os arquivos `supabase/schema*.sql` para o schema completo, na ordem em que
devem ser rodados (schema.sql primeiro, depois schema_etapa4.sql em diante).
