-- IncluiPro — Etapa 7: matriz de compatibilidade cargo × deficiência
-- Rode DEPOIS de schema_etapa6.sql, uma vez, no SQL Editor do Supabase.

create table if not exists cargos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  nome text not null,
  -- exigência de 0 (nenhuma) a 3 (alta) em cada dimensão
  exigencia_visao int default 0,
  exigencia_audicao int default 0,
  exigencia_mobilidade int default 0,
  exigencia_comunicacao int default 0,
  exigencia_cognicao int default 0,
  exigencia_esforco_fisico int default 0,
  exigencia_deslocamento int default 0,
  vagas_abertas int default 0,
  criado_em timestamptz default now()
);

alter table cargos enable row level security;

create policy "cargos select membro" on cargos
  for select using (
    empresa_id in (select empresa_id from membros_empresa where conta_id = auth.uid())
  );
create policy "cargos escreve admin-rh" on cargos
  for all using (
    empresa_id in (
      select empresa_id from membros_empresa where conta_id = auth.uid() and papel in ('admin', 'rh')
    )
  );

create index if not exists idx_cargos_empresa on cargos(empresa_id);
