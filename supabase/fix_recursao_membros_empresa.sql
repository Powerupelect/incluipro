-- IncluiPro — Correção: recursão infinita nas políticas de RLS de membros_empresa
-- As políticas de select/insert/update/delete de membros_empresa consultavam a própria
-- tabela dentro de si mesmas, causando "infinite recursion detected in policy for
-- relation membros_empresa". A correção usa funções security definer (que ignoram RLS
-- internamente) para buscar as empresas do usuário, quebrando o ciclo.

create or replace function minhas_empresas()
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select empresa_id from membros_empresa where conta_id = auth.uid()
$$;

create or replace function minhas_empresas_admin()
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select empresa_id from membros_empresa where conta_id = auth.uid() and papel = 'admin'
$$;

drop policy if exists "membros select da propria empresa" on membros_empresa;
create policy "membros select da propria empresa" on membros_empresa
  for select using (empresa_id in (select minhas_empresas()));

drop policy if exists "membros escreve admin" on membros_empresa;
create policy "membros escreve admin" on membros_empresa
  for insert with check (
    empresa_id in (select minhas_empresas_admin())
    or conta_id = auth.uid()
  );

drop policy if exists "membros atualiza admin" on membros_empresa;
create policy "membros atualiza admin" on membros_empresa
  for update using (empresa_id in (select minhas_empresas_admin()));

drop policy if exists "membros remove admin" on membros_empresa;
create policy "membros remove admin" on membros_empresa
  for delete using (empresa_id in (select minhas_empresas_admin()));
