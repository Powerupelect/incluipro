-- IncluiPro — Etapa 11: LGPD e segurança
-- Rode DEPOIS de schema_etapa10 (não há schema_etapa10.sql — a etapa 10 não mexeu no banco),
-- ou seja, depois de schema_etapa9.sql, uma vez, no SQL Editor do Supabase.

-- Registra o aceite dos Termos de Uso / Política de Privacidade, com data — exigido pela LGPD
-- como evidência de consentimento informado (item 11.2 do briefing).
alter table contas add column if not exists aceite_termos_em timestamptz;
alter table contas add column if not exists aceite_termos_versao text;
