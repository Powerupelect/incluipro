-- IncluiPro — Etapa 16: preserva o histórico de solicitações de acessibilidade
-- mesmo depois que o colaborador vinculado é excluído.
-- Rode uma vez no SQL Editor do Supabase.
--
-- Antes: colaborador_id tinha "on delete cascade" — excluir um colaborador apagava
-- também toda solicitação de acessibilidade dele, mesmo já concluída. Isso tinha um
-- efeito colateral grave: se a solicitação tinha sido promovida do Canal do
-- Colaborador, o pedido de origem perdia o vínculo (solicitacao_acessibilidade_id
-- voltava a null) mas continuava com status "concluída", então reaparecia na tela
-- com a caixa de "Vincular a um colaborador" — parecendo reaberto, mesmo já tendo
-- sido concluído antes.
--
-- Agora o registro da solicitação é preservado (fica só sem colaborador vinculado),
-- útil também para auditoria/compliance — e o pedido de origem no canal nunca mais
-- perde o vínculo.

alter table solicitacoes_acessibilidade add column if not exists colaborador_nome text;

update solicitacoes_acessibilidade s
set colaborador_nome = c.nome
from colaboradores c
where c.id = s.colaborador_id and s.colaborador_nome is null;

alter table solicitacoes_acessibilidade drop constraint if exists solicitacoes_acessibilidade_colaborador_id_fkey;
alter table solicitacoes_acessibilidade alter column colaborador_id drop not null;
alter table solicitacoes_acessibilidade
  add constraint solicitacoes_acessibilidade_colaborador_id_fkey
  foreign key (colaborador_id) references colaboradores(id) on delete set null;

-- Mantém colaborador_nome sincronizado sempre que colaborador_id é definido/trocado —
-- assim o nome fica preservado no registro mesmo que o colaborador seja excluído depois.
create or replace function sync_colaborador_nome_solicitacao()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.colaborador_id is not null then
    select nome into new.colaborador_nome from colaboradores where id = new.colaborador_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_colaborador_nome_solicitacao on solicitacoes_acessibilidade;
create trigger trg_sync_colaborador_nome_solicitacao
  before insert or update of colaborador_id on solicitacoes_acessibilidade
  for each row execute function sync_colaborador_nome_solicitacao();
