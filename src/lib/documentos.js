import { supabase } from './supabase.js'

export const TIPOS_DOCUMENTO = [
  { id: 'laudo', label: 'Laudo caracterizador' },
  { id: 'cid', label: 'CID' },
  { id: 'comprovante_inss', label: 'Comprovante de reabilitação do INSS' },
]

export async function getColaboradoresComDeficiencia(empresaId) {
  if (!empresaId) return []
  const { data, error } = await supabase
    .from('colaboradores')
    .select('*')
    .eq('empresa_id', empresaId)
    .not('tipo_deficiencia', 'is', null)
    .is('data_desligamento', null)
    .order('nome', { ascending: true })
  if (error) throw error
  return (data || []).filter((c) => c.tipo_deficiencia?.trim())
}

export async function getDocumentos(empresaId) {
  if (!empresaId) return []
  const { data, error } = await supabase.from('documentos').select('*').eq('empresa_id', empresaId)
  if (error) throw error
  return data || []
}

export async function uploadDocumento({ empresaId, colaboradorId, tipo, arquivo, dataEmissao, dataValidade, descreveBarreira }) {
  let arquivoPath = null
  if (arquivo) {
    arquivoPath = `${empresaId}/${colaboradorId}/${Date.now()}-${arquivo.name}`
    const { error: erroUpload } = await supabase.storage.from('documentos').upload(arquivoPath, arquivo)
    if (erroUpload) throw erroUpload
  }

  const { data, error } = await supabase
    .from('documentos')
    .insert({
      empresa_id: empresaId,
      colaborador_id: colaboradorId,
      tipo,
      arquivo_path: arquivoPath,
      data_emissao: dataEmissao || null,
      data_validade: dataValidade || null,
      descreve_barreira_funcional: Boolean(descreveBarreira),
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function removerDocumento(documento) {
  if (documento.arquivo_path) {
    await supabase.storage.from('documentos').remove([documento.arquivo_path])
  }
  const { error } = await supabase.from('documentos').delete().eq('id', documento.id)
  if (error) throw error
}

export async function urlAssinadaDocumento(arquivoPath) {
  const { data, error } = await supabase.storage.from('documentos').createSignedUrl(arquivoPath, 60 * 5)
  if (error) throw error
  return data.signedUrl
}
