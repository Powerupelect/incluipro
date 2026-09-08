-- IncluiPro — Etapa 15: fecha vazamento real no acesso público do Canal do Colaborador
-- Rode DEPOIS de schema_etapa14.sql, uma vez, no SQL Editor do Supabase.
--
-- Problema encontrado: as views empresas_publico e solicitacoes_canal_status (etapa 13)
-- rodam com o privilégio de quem CRIOU a view, não do usuário anônimo que consulta —
-- esse é o comportamento padrão de views no Postgres (a menos que a view seja criada
-- com security_invoker). Isso faz o RLS da tabela por trás ser ignorado, e o
-- "grant select ... to anon" acaba permitindo LISTAR todas as linhas, não só a que
-- o app realmente pede.
--
-- Na prática, sem essa correção: qualquer pessoa podia listar nome e link de TODAS
-- as empresas cadastradas (via empresas_publico, sem filtro), e listar protocolo e
-- status de TODAS as solicitações de TODAS as empresas (via solicitacoes_canal_status,
-- sem filtro). O conteúdo (nome do colaborador, descrição, observação interna) nunca
-- ficou exposto — mas a listagem em si já é vazamento de dado que não devia ser público.
--
-- Correção: revoga o acesso público às views e troca por duas funções security
-- definer, que só devolvem uma linha, mediante um valor exato (slug ou protocolo).
-- Uma função RPC não pode ser "listada" sem argumento — cada chamada exige o valor
-- exato que só quem tem o link ou o protocolo em mãos possui.

revoke select on empresas_publico from anon, authenticated;
revoke select on solicitacoes_canal_status from anon, authenticated;
drop view if exists empresas_publico;
drop view if exists solicitacoes_canal_status;

create or replace function empresa_por_slug(p_slug text)
returns table (id uuid, nome text, identificador_publico text)
language sql
security definer
set search_path = public
stable
as $$
  select id, nome, identificador_publico
  from empresas
  where identificador_publico = p_slug
  limit 1;
$$;

grant execute on function empresa_por_slug(text) to anon, authenticated;

create or replace function status_por_protocolo(p_protocolo text)
returns table (protocolo text, status text, atualizada_em timestamptz)
language sql
security definer
set search_path = public
stable
as $$
  select protocolo, status, atualizada_em
  from solicitacoes_canal
  where protocolo = p_protocolo
  limit 1;
$$;

grant execute on function status_por_protocolo(text) to anon, authenticated;

-- ============================================================
-- Segundo achado: a política "membros aceita proprio convite" (etapa 6) só
-- trava conta_id = auth.uid() no WITH CHECK — nada impede, numa chamada direta
-- à API (fora do app), de também mudar papel/empresa_id/unidade_id na mesma
-- atualização, já que RLS não compara o valor antigo com o novo por coluna.
-- O app nunca faz isso (aceitarConvitesPendentes só manda { conta_id }), mas a
-- RLS é quem deveria garantir isso, não o comportamento do app. Um trigger
-- BEFORE UPDATE resolve, porque (ao contrário de uma policy) tem acesso a
-- OLD e NEW ao mesmo tempo.
-- ============================================================

create or replace function proteger_aceite_convite()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if OLD.conta_id is null and NEW.conta_id is not null then
    if NEW.papel <> OLD.papel
      or NEW.empresa_id <> OLD.empresa_id
      or NEW.unidade_id is distinct from OLD.unidade_id
      or NEW.email_convite is distinct from OLD.email_convite
    then
      raise exception 'Não é permitido alterar papel, empresa ou unidade ao aceitar um convite.';
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_proteger_aceite_convite on membros_empresa;
create trigger trg_proteger_aceite_convite
  before update on membros_empresa
  for each row execute function proteger_aceite_convite();
