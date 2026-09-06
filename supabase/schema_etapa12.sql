-- IncluiPro — Etapa 12: CNPJ da empresa e valor do recurso em solicitações
-- Rode DEPOIS de schema_etapa11.sql, uma vez, no SQL Editor do Supabase.

-- CNPJ da empresa — usado no Dossiê Técnico (Configurações não tinha onde preencher).
alter table empresas add column if not exists cnpj text;

-- Valor do recurso/adaptação comprado (opcional) — permite somar um "investimento em
-- acessibilidade" real no Resumo Executivo, em vez de deixar sempre sem registro.
alter table solicitacoes_acessibilidade add column if not exists valor_recurso numeric(12, 2);
