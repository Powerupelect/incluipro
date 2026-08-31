-- IncluiPro — Etapa 8: triagem de laudos
-- Rode DEPOIS de schema_etapa7.sql, uma vez, no SQL Editor do Supabase.

create table if not exists documentos (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  colaborador_id uuid not null references colaboradores(id) on delete cascade,
  tipo text not null, -- 'laudo' | 'cid' | 'comprovante_inss'
  arquivo_path text, -- caminho no bucket "documentos": <empresa_id>/<colaborador_id>/<arquivo>
  data_emissao date,
  data_validade date,
  descreve_barreira_funcional boolean default false,
  criado_em timestamptz default now()
);

alter table documentos enable row level security;
create policy "documentos select membro" on documentos
  for select using (
    empresa_id in (select empresa_id from membros_empresa where conta_id = auth.uid())
  );
create policy "documentos escreve admin-rh-gestor" on documentos
  for all using (
    empresa_id in (
      select empresa_id from membros_empresa where conta_id = auth.uid() and papel in ('admin', 'rh', 'gestor')
    )
  );

create index if not exists idx_documentos_empresa on documentos(empresa_id);
create index if not exists idx_documentos_colaborador on documentos(colaborador_id);

-- ============================================================
-- Bucket de armazenamento (privado) para os arquivos de laudo/CID/comprovante
-- ============================================================
insert into storage.buckets (id, name, public)
values ('documentos', 'documentos', false)
on conflict (id) do nothing;

-- Convenção de caminho: <empresa_id>/<colaborador_id>/<arquivo> — a política checa o
-- primeiro segmento do caminho contra a empresa do membro.
create policy "storage documentos select membro" on storage.objects
  for select using (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1]::uuid in (
      select empresa_id from membros_empresa where conta_id = auth.uid()
    )
  );
create policy "storage documentos insere admin-rh-gestor" on storage.objects
  for insert with check (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1]::uuid in (
      select empresa_id from membros_empresa where conta_id = auth.uid() and papel in ('admin', 'rh', 'gestor')
    )
  );
create policy "storage documentos remove admin-rh" on storage.objects
  for delete using (
    bucket_id = 'documentos'
    and (storage.foldername(name))[1]::uuid in (
      select empresa_id from membros_empresa where conta_id = auth.uid() and papel in ('admin', 'rh')
    )
  );
