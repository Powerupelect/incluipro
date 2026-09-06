-- IncluiPro — Etapa 13: Canal de solicitações do colaborador
-- Rode DEPOIS de schema_etapa12.sql, uma vez, no SQL Editor do Supabase.
--
-- Módulo público (sem login): o colaborador acessa um link próprio da empresa
-- (incluipro.com/solicitar/<identificador>) e registra um pedido de acessibilidade.
-- Ponto mais sensível: a tela pública GRAVA mas não LÊ nada além do status pelo
-- protocolo — nunca lista, nome ou descrição. Por isso o acesso público passa por
-- VIEWs estreitas (só as colunas necessárias), nunca pela tabela inteira.

-- ============================================================
-- Identificador público da empresa (slug do link) — não sequencial, imutável
-- ============================================================
alter table empresas add column if not exists identificador_publico text unique;

-- View pública mínima: só o necessário para o formulário resolver a empresa a
-- partir do slug e mostrar o nome/identidade no topo. Roda com o privilégio de
-- quem criou a view (não do usuário anon), então narrows as colunas mesmo com
-- RLS restritivo na tabela empresas por trás.
create or replace view empresas_publico as
  select id, nome, identificador_publico
  from empresas
  where identificador_publico is not null;

grant select on empresas_publico to anon, authenticated;

-- ============================================================
-- SOLICITACOES_CANAL — pedidos enviados pelo colaborador, sem login
-- ============================================================
create table if not exists solicitacoes_canal (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  protocolo text not null unique,
  nome_informado text not null,
  tipo text not null,
  descricao text not null check (char_length(descricao) <= 1000),
  status text not null default 'recebida', -- recebida | em_analise | aprovada | concluida | recusada | descartada
  motivo_recusa text,
  observacao_interna text, -- nunca exposta na consulta pública
  solicitacao_acessibilidade_id uuid references solicitacoes_acessibilidade(id) on delete set null,
  criada_em timestamptz default now(),
  atualizada_em timestamptz default now()
);

alter table solicitacoes_canal enable row level security;

-- Qualquer visitante pode registrar um pedido (sem login) — não há dado sensível
-- de identidade aqui além do nome que a própria pessoa optou por informar.
create policy "canal insere publico" on solicitacoes_canal
  for insert to anon
  with check (true);

-- RH (admin/rh/gestor) lê e atualiza os pedidos da própria empresa.
create policy "canal select admin-rh-gestor" on solicitacoes_canal
  for select using (
    empresa_id in (
      select empresa_id from membros_empresa where conta_id = auth.uid() and papel in ('admin', 'rh', 'gestor')
    )
  );
create policy "canal atualiza admin-rh-gestor" on solicitacoes_canal
  for update using (
    empresa_id in (
      select empresa_id from membros_empresa where conta_id = auth.uid() and papel in ('admin', 'rh', 'gestor')
    )
  );

create index if not exists idx_canal_empresa on solicitacoes_canal(empresa_id);
create index if not exists idx_canal_protocolo on solicitacoes_canal(protocolo);

-- View pública mínima para a consulta de andamento por protocolo: só status e
-- data — nunca nome, tipo, descrição ou observação interna.
create or replace view solicitacoes_canal_status as
  select protocolo, status, atualizada_em
  from solicitacoes_canal;

grant select on solicitacoes_canal_status to anon, authenticated;

-- Mantém atualizada_em em dia a cada update.
create or replace function atualizar_timestamp_canal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.atualizada_em = now();
  return new;
end;
$$;

drop trigger if exists trg_atualizar_timestamp_canal on solicitacoes_canal;
create trigger trg_atualizar_timestamp_canal
  before update on solicitacoes_canal
  for each row execute function atualizar_timestamp_canal();
