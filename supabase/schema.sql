-- IncluiPro — Schema inicial (Etapa 3: contas + empresas + colaboradores + avaliações)
-- Rode este script UMA VEZ no SQL Editor do seu projeto Supabase
-- (app.supabase.com → seu projeto → SQL Editor → New query → colar → Run).
--
-- Cobre a "Ordem de construção" 1 a 3 do documento incluipro_modelo_de_dados.md.
-- As colunas de avaliacoes foram adaptadas aos blocos reais do formulário do
-- IncluiPro Avalia (Identificação, Deficiência, Rotina, Histórico, Necessidades,
-- Expectativas, Observações ergonômicas, Notas livres).

-- ============================================================
-- CONTAS — espelha o usuário autenticado (auth.users)
-- ============================================================
create table if not exists contas (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  email text,
  tipo text default 'rh', -- 'rh' ou 'consultoria'
  plano text default 'trial',
  criado_em timestamptz default now()
);

-- ============================================================
-- EMPRESAS — uma conta pode gerenciar várias empresas
-- ============================================================
create table if not exists empresas (
  id uuid primary key default gen_random_uuid(),
  conta_id uuid not null references contas(id) on delete cascade,
  nome text not null,
  cnpj text,
  setor text,
  total_funcionarios int default 0, -- base do cálculo de cota; a cota em si nunca é gravada, é sempre recalculada
  cidade text,
  uf text,
  criado_em timestamptz default now()
);

-- ============================================================
-- COLABORADORES — contém dado pessoal sensível (saúde). Ver LGPD no README.
-- ============================================================
create table if not exists colaboradores (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  nome text not null,
  cargo text,
  tipo_deficiencia text,
  observacoes_condicao text,
  conta_cota boolean default true,
  data_admissao date,
  data_desligamento date, -- null se ativo; usado no alerta de substituição na demissão
  criado_em timestamptz default now()
);

-- ============================================================
-- AVALIACOES — um bloco por campo do formulário, não um JSON único
-- (permite buscar, comparar e montar o dossiê depois)
-- ============================================================
create table if not exists avaliacoes (
  id uuid primary key default gen_random_uuid(),
  colaborador_id uuid references colaboradores(id) on delete cascade,
  empresa_id uuid not null references empresas(id) on delete cascade, -- denormalizado, facilita RLS e consulta
  avaliador text,
  data_avaliacao date default current_date,
  rotina text,
  historico text,
  necessidades text,
  expectativas text,
  observacoes_ergonomicas text,
  notas_livres text,
  recursos_sugeridos jsonb default '[]'::jsonb,
  conteudo_gerado text, -- o relatório final, editável
  editado boolean default false,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- ============================================================
-- RLS — sem isso, qualquer usuário logado lê os dados de todas as empresas
-- ============================================================
alter table contas enable row level security;
alter table empresas enable row level security;
alter table colaboradores enable row level security;
alter table avaliacoes enable row level security;

create policy "conta propria" on contas
  for all using (id = auth.uid());

create policy "empresas da conta" on empresas
  for all using (conta_id = auth.uid());

create policy "colaboradores da conta" on colaboradores
  for all using (
    empresa_id in (select id from empresas where conta_id = auth.uid())
  );

create policy "avaliacoes da conta" on avaliacoes
  for all using (
    empresa_id in (select id from empresas where conta_id = auth.uid())
  );

-- ============================================================
-- Índices básicos de consulta
-- ============================================================
create index if not exists idx_empresas_conta_id on empresas(conta_id);
create index if not exists idx_colaboradores_empresa_id on colaboradores(empresa_id);
create index if not exists idx_avaliacoes_empresa_id on avaliacoes(empresa_id);
create index if not exists idx_avaliacoes_colaborador_id on avaliacoes(colaborador_id);
