-- IncluiPro — Etapa 17: trava a gravação pública do Canal do Colaborador no banco
-- Rode uma vez no SQL Editor do Supabase.
--
-- Até aqui, a política de insert de solicitacoes_canal aceitava "with check (true)"
-- — ou seja, o banco confiava cegamente em qualquer empresa_id enviado. Quem de
-- fato restringia isso era só a função canal-solicitar.mjs (resolve o empresa_id
-- certo a partir do slug do link, e aplica limite de 3 envios/hora por IP). Como a
-- chave pública do Supabase vai no site, nada impede uma chamada direta à API do
-- Supabase pulando essa função — e aí o banco aceitaria gravar em QUALQUER
-- empresa, sem limite de taxa.
--
-- Esta migração não resolve o rate-limit (fica para depois), mas fecha a parte
-- mais grave: o banco passa a só aceitar inserts cujo empresa_id pertença a uma
-- empresa que realmente tem um link público ativo (identificador_publico
-- preenchido) — não dá mais pra gravar em qualquer empresa só informando um id
-- qualquer.

drop policy if exists "canal insere publico" on solicitacoes_canal;

create policy "canal insere publico" on solicitacoes_canal
  for insert to anon
  with check (
    empresa_id in (select id from empresas where identificador_publico is not null)
  );
