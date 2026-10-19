-- IncluiPro — Etapa 18: registro de saída (desligamento) de colaboradores
-- Rode uma vez no SQL Editor do Supabase.
--
-- Antes só existia "Excluir", que apaga o colaborador e o histórico dele. A saída
-- registrada mantém o cadastro (avaliações, documentos, solicitações), preenche
-- data_desligamento — o que já tira a pessoa da contagem da cota — e guarda o tipo
-- e o motivo, usados no Painel (retenção) e no alerta de substituição da
-- Lei 8.213/91, art. 93, §1º.

alter table colaboradores add column if not exists tipo_desligamento text;
alter table colaboradores add column if not exists motivo_desligamento text;
