import { supabase } from './supabase.js'

// Exclusão definitiva (LGPD art. 18, VI) — apaga a empresa e, por cascata de chave estrangeira,
// todos os dados vinculados: colaboradores, avaliações, documentos, solicitações de
// acessibilidade, unidades, cargos e membros da equipe. Não afeta a conta de login em si (a
// pessoa pode criar uma nova empresa do zero depois).
export async function excluirEmpresaDefinitivamente(empresaId) {
  const { error } = await supabase.from('empresas').delete().eq('id', empresaId)
  if (error) throw error
}
