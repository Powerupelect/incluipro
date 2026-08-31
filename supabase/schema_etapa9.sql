-- IncluiPro — Etapa 9: central de acessibilidade (RH registra a solicitação)
-- Rode DEPOIS de schema_etapa8.sql, uma vez, no SQL Editor do Supabase.
--
-- Privacidade (9.5 do briefing): dado sensível, visível apenas a admin/rh/gestor —
-- nunca ao papel "leitura" (equipe em geral).

create table if not exists solicitacoes_acessibilidade (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  colaborador_id uuid not null references colaboradores(id) on delete cascade,
  tipo text not null, -- recurso_assistivo | interprete_libras | ajuste_ergonomico | flexibilizacao_horario | adaptacao_posto
  descricao text not null,
  data_pedido date not null default current_date,
  solicitado_por text, -- quem registrou o pedido (nome informado pelo RH)
  status text not null default 'solicitado', -- solicitado | em_analise | aprovado | executado | concluido | recusado
  responsavel text,
  prazo date,
  motivo_recusa text,
  anexo_path text, -- caminho no bucket "solicitacoes": <empresa_id>/<colaborador_id>/<arquivo>
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

alter table solicitacoes_acessibilidade enable row level security;

create policy "solicitacoes select admin-rh-gestor" on solicitacoes_acessibilidade
  for select using (
    empresa_id in (
      select empresa_id from membros_empresa where conta_id = auth.uid() and papel in ('admin', 'rh', 'gestor')
    )
  );
create policy "solicitacoes escreve admin-rh-gestor" on solicitacoes_acessibilidade
  for all using (
    empresa_id in (
      select empresa_id from membros_empresa where conta_id = auth.uid() and papel in ('admin', 'rh', 'gestor')
    )
  );

create index if not exists idx_solicitacoes_empresa on solicitacoes_acessibilidade(empresa_id);
create index if not exists idx_solicitacoes_colaborador on solicitacoes_acessibilidade(colaborador_id);

-- Mantém atualizado_em em dia a cada update, sem depender do cliente lembrar de setar.
create or replace function atualizar_timestamp_solicitacao()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists trg_atualizar_timestamp_solicitacao on solicitacoes_acessibilidade;
create trigger trg_atualizar_timestamp_solicitacao
  before update on solicitacoes_acessibilidade
  for each row execute function atualizar_timestamp_solicitacao();

-- ============================================================
-- Bucket de armazenamento (privado) para anexos de comprovação
-- ============================================================
insert into storage.buckets (id, name, public)
values ('solicitacoes', 'solicitacoes', false)
on conflict (id) do nothing;

create policy "storage solicitacoes select admin-rh-gestor" on storage.objects
  for select using (
    bucket_id = 'solicitacoes'
    and (storage.foldername(name))[1]::uuid in (
      select empresa_id from membros_empresa where conta_id = auth.uid() and papel in ('admin', 'rh', 'gestor')
    )
  );
create policy "storage solicitacoes insere admin-rh-gestor" on storage.objects
  for insert with check (
    bucket_id = 'solicitacoes'
    and (storage.foldername(name))[1]::uuid in (
      select empresa_id from membros_empresa where conta_id = auth.uid() and papel in ('admin', 'rh', 'gestor')
    )
  );
create policy "storage solicitacoes remove admin-rh" on storage.objects
  for delete using (
    bucket_id = 'solicitacoes'
    and (storage.foldername(name))[1]::uuid in (
      select empresa_id from membros_empresa where conta_id = auth.uid() and papel in ('admin', 'rh')
    )
  );
