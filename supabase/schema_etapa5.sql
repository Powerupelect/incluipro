-- IncluiPro — Etapa 5: avaliação em dois níveis
-- Rode DEPOIS de schema.sql e schema_etapa4.sql, uma vez, no SQL Editor do Supabase.

alter table avaliacoes add column if not exists tipo text default 'completa';
-- 'completa' = avaliação completa (inicial ou revisão com alteração)
-- 'revisao_confirmada' = revisão anual simplificada, sem alterações relatadas

create index if not exists idx_avaliacoes_colaborador_tipo on avaliacoes(colaborador_id, tipo);
