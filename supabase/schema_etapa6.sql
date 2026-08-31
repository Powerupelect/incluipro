-- IncluiPro — Etapa 6: escala (unidades, papéis de acesso, auditoria)
-- Rode DEPOIS de schema.sql + schema_etapa4.sql + schema_etapa5.sql, uma vez, no SQL Editor.
--
-- ATENÇÃO: esta etapa reescreve as políticas de RLS de empresas/colaboradores/avaliacoes
-- para funcionar com múltiplos usuários por empresa (papéis de acesso). É a migração mais
-- sensível até agora — depois de rodar, teste com pelo menos 2 contas com papéis diferentes
-- na mesma empresa antes de confiar em produção.

-- ============================================================
-- UNIDADES — a cota é global, unidade é só organização
-- ============================================================
create table if not exists unidades (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  nome text not null,
  cnpj text,
  cidade text,
  uf text,
  criado_em timestamptz default now()
);

alter table colaboradores add column if not exists unidade_id uuid references unidades(id) on delete set null;

-- ============================================================
-- MEMBROS_EMPRESA — papéis de acesso (admin / rh / gestor / leitura)
-- ============================================================
create table if not exists membros_empresa (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references empresas(id) on delete cascade,
  conta_id uuid references contas(id) on delete cascade,
  email_convite text, -- preenchido quando convidado ainda não tem conta
  papel text not null default 'rh', -- 'admin' | 'rh' | 'gestor' | 'leitura'
  unidade_id uuid references unidades(id) on delete set null, -- só usado quando papel = 'gestor'
  criado_em timestamptz default now(),
  unique (empresa_id, conta_id)
);

-- Migra os donos atuais das empresas para admin em membros_empresa
insert into membros_empresa (empresa_id, conta_id, papel)
select id, conta_id, 'admin' from empresas
on conflict (empresa_id, conta_id) do nothing;

-- ============================================================
-- TRILHA_AUDITORIA — quem criou/editou/excluiu, quando
-- ============================================================
create table if not exists trilha_auditoria (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid,
  tabela text not null,
  registro_id uuid not null,
  acao text not null, -- 'insert' | 'update' | 'delete'
  conta_id uuid,
  criado_em timestamptz default now()
);

create or replace function registrar_auditoria() returns trigger as $$
declare
  v_empresa_id uuid;
begin
  if TG_TABLE_NAME = 'empresas' then
    v_empresa_id := coalesce(NEW.id, OLD.id);
  else
    v_empresa_id := coalesce(NEW.empresa_id, OLD.empresa_id);
  end if;

  insert into trilha_auditoria (empresa_id, tabela, registro_id, acao, conta_id)
  values (v_empresa_id, TG_TABLE_NAME, coalesce(NEW.id, OLD.id), lower(TG_OP), auth.uid());

  if TG_OP = 'DELETE' then
    return OLD;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_auditoria_colaboradores on colaboradores;
create trigger trg_auditoria_colaboradores
  after insert or update or delete on colaboradores
  for each row execute function registrar_auditoria();

drop trigger if exists trg_auditoria_avaliacoes on avaliacoes;
create trigger trg_auditoria_avaliacoes
  after insert or update or delete on avaliacoes
  for each row execute function registrar_auditoria();

drop trigger if exists trg_auditoria_empresas on empresas;
create trigger trg_auditoria_empresas
  after insert or update or delete on empresas
  for each row execute function registrar_auditoria();

alter table trilha_auditoria enable row level security;
create policy "trilha visivel para membros" on trilha_auditoria
  for select using (
    empresa_id in (select empresa_id from membros_empresa where conta_id = auth.uid())
  );

-- ============================================================
-- RLS de unidades e membros_empresa
-- ============================================================
alter table unidades enable row level security;
create policy "unidades select membro" on unidades
  for select using (
    empresa_id in (select empresa_id from membros_empresa where conta_id = auth.uid())
  );
create policy "unidades escreve admin-rh" on unidades
  for all using (
    empresa_id in (
      select empresa_id from membros_empresa where conta_id = auth.uid() and papel in ('admin', 'rh')
    )
  );

alter table membros_empresa enable row level security;
create policy "membros select da propria empresa" on membros_empresa
  for select using (
    empresa_id in (select empresa_id from membros_empresa m2 where m2.conta_id = auth.uid())
  );
create policy "membros escreve admin" on membros_empresa
  for insert with check (
    empresa_id in (
      select empresa_id from membros_empresa m2 where m2.conta_id = auth.uid() and m2.papel = 'admin'
    )
    or conta_id = auth.uid() -- permite o próprio cadastro se tornar admin da empresa que criou
  );
create policy "membros atualiza admin" on membros_empresa
  for update using (
    empresa_id in (
      select empresa_id from membros_empresa m2 where m2.conta_id = auth.uid() and m2.papel = 'admin'
    )
  );
create policy "membros remove admin" on membros_empresa
  for delete using (
    empresa_id in (
      select empresa_id from membros_empresa m2 where m2.conta_id = auth.uid() and m2.papel = 'admin'
    )
  );

-- Permite a uma pessoa convidada (ainda sem conta_id vinculado) aceitar o próprio convite,
-- casando pelo e-mail da conta dela — sem isso, ninguém consegue aceitar convite (só admin
-- edita membros, e quem está aceitando ainda não é membro de nada).
create policy "membros aceita proprio convite" on membros_empresa
  for update using (
    conta_id is null
    and email_convite = (select email from contas where id = auth.uid())
  )
  with check (conta_id = auth.uid());

-- ============================================================
-- Substitui as políticas antigas (Etapa 3) por versões baseadas em papel
-- ============================================================

-- EMPRESAS
drop policy if exists "empresas da conta" on empresas;
create policy "empresas select membro" on empresas
  for select using (
    id in (select empresa_id from membros_empresa where conta_id = auth.uid())
  );
create policy "empresas insere dono" on empresas
  for insert with check (conta_id = auth.uid());
create policy "empresas atualiza admin" on empresas
  for update using (
    id in (select empresa_id from membros_empresa where conta_id = auth.uid() and papel = 'admin')
  );
create policy "empresas remove admin" on empresas
  for delete using (
    id in (select empresa_id from membros_empresa where conta_id = auth.uid() and papel = 'admin')
  );

-- COLABORADORES (gestor só enxerga/edita colaboradores da própria unidade)
drop policy if exists "colaboradores da conta" on colaboradores;
create policy "colaboradores select membro" on colaboradores
  for select using (
    exists (
      select 1 from membros_empresa m
      where m.empresa_id = colaboradores.empresa_id
        and m.conta_id = auth.uid()
        and (m.papel <> 'gestor' or m.unidade_id = colaboradores.unidade_id)
    )
  );
create policy "colaboradores insere admin-rh-gestor" on colaboradores
  for insert with check (
    exists (
      select 1 from membros_empresa m
      where m.empresa_id = colaboradores.empresa_id
        and m.conta_id = auth.uid()
        and m.papel in ('admin', 'rh', 'gestor')
        and (m.papel <> 'gestor' or m.unidade_id = colaboradores.unidade_id)
    )
  );
create policy "colaboradores atualiza admin-rh-gestor" on colaboradores
  for update using (
    exists (
      select 1 from membros_empresa m
      where m.empresa_id = colaboradores.empresa_id
        and m.conta_id = auth.uid()
        and m.papel in ('admin', 'rh', 'gestor')
        and (m.papel <> 'gestor' or m.unidade_id = colaboradores.unidade_id)
    )
  );
create policy "colaboradores remove admin-rh" on colaboradores
  for delete using (
    exists (
      select 1 from membros_empresa m
      where m.empresa_id = colaboradores.empresa_id
        and m.conta_id = auth.uid()
        and m.papel in ('admin', 'rh')
    )
  );

-- AVALIACOES (mesma lógica de colaboradores, checando a unidade do colaborador ligado)
drop policy if exists "avaliacoes da conta" on avaliacoes;
create policy "avaliacoes select membro" on avaliacoes
  for select using (
    exists (
      select 1 from membros_empresa m
      where m.empresa_id = avaliacoes.empresa_id
        and m.conta_id = auth.uid()
        and (
          m.papel <> 'gestor'
          or m.unidade_id = (select c.unidade_id from colaboradores c where c.id = avaliacoes.colaborador_id)
        )
    )
  );
create policy "avaliacoes insere admin-rh-gestor" on avaliacoes
  for insert with check (
    exists (
      select 1 from membros_empresa m
      where m.empresa_id = avaliacoes.empresa_id
        and m.conta_id = auth.uid()
        and m.papel in ('admin', 'rh', 'gestor')
    )
  );
create policy "avaliacoes atualiza admin-rh-gestor" on avaliacoes
  for update using (
    exists (
      select 1 from membros_empresa m
      where m.empresa_id = avaliacoes.empresa_id
        and m.conta_id = auth.uid()
        and m.papel in ('admin', 'rh', 'gestor')
    )
  );
create policy "avaliacoes remove admin-rh" on avaliacoes
  for delete using (
    exists (
      select 1 from membros_empresa m
      where m.empresa_id = avaliacoes.empresa_id
        and m.conta_id = auth.uid()
        and m.papel in ('admin', 'rh')
    )
  );

create index if not exists idx_membros_empresa_conta on membros_empresa(conta_id);
create index if not exists idx_membros_empresa_empresa on membros_empresa(empresa_id);
create index if not exists idx_unidades_empresa on unidades(empresa_id);
create index if not exists idx_colaboradores_unidade on colaboradores(unidade_id);
create index if not exists idx_trilha_empresa on trilha_auditoria(empresa_id);
