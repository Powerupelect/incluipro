-- IncluiPro — Etapa 14: consolida o Canal do Colaborador dentro da aba Solicitações
-- Rode DEPOIS de schema_etapa13.sql, uma vez, no SQL Editor do Supabase.
--
-- Guarda o protocolo de origem quando uma solicitação nasce de um pedido do
-- Canal do Colaborador (ver promoverParaSolicitacao em lib/canalColaborador.js),
-- pra manter o vínculo visível mesmo depois que o registro passa a viver só em
-- solicitacoes_acessibilidade.

alter table solicitacoes_acessibilidade add column if not exists canal_protocolo text;
