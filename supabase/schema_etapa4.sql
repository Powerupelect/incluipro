-- IncluiPro — Etapa 4: cota e painel
-- Rode DEPOIS de supabase/schema.sql, uma vez, no SQL Editor do Supabase.
-- Só adiciona colunas novas em "empresas" — não mexe no que já existe.

alter table empresas add column if not exists aprendizes int default 0;
alter table empresas add column if not exists aposentados_invalidez int default 0;
