-- IncluiPro — Correção: dono da empresa não conseguia ver a própria empresa recém-criada
-- A política de SELECT de empresas dependia de já existir um vínculo em membros_empresa,
-- mas esse vínculo só é criado LOGO DEPOIS do insert da empresa (em criarEmpresa()). Como o
-- INSERT usa RETURNING (via .select() no supabase-js), e RETURNING é filtrado pela política de
-- SELECT, o insert inteiro falhava com "new row violates row-level security policy for table
-- empresas" — mesmo a política de INSERT estando correta.

drop policy if exists "empresas select membro" on empresas;
create policy "empresas select membro" on empresas
  for select using (
    conta_id = auth.uid()
    or id in (select minhas_empresas())
  );
