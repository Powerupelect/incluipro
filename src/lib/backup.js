// Backup manual dos dados do usuário: relatórios (Supabase, via empresaId) e leads (localStorage).
// Nunca inclui credenciais/sessão.

import { getReports, saveReport } from './reports.js'
import { getLeads } from './leads.js'

export async function exportBackup(empresaId) {
  const [reports, leads] = await Promise.all([
    empresaId ? getReports(empresaId) : Promise.resolve([]),
    Promise.resolve(getLeads()),
  ])
  const data = {
    versao: 2,
    exportadoEm: new Date().toISOString(),
    reports,
    leads,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `incluipro-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const LEADS_KEY = 'incluipro_leads'

export function importBackup(file, empresaId) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result)
        if (!data || typeof data !== 'object' || (!Array.isArray(data.reports) && !Array.isArray(data.leads))) {
          throw new Error('invalido')
        }
        if (Array.isArray(data.leads)) {
          localStorage.setItem(LEADS_KEY, JSON.stringify(data.leads))
        }
        let relatoriosImportados = 0
        if (Array.isArray(data.reports) && empresaId) {
          for (const report of data.reports) {
            await saveReport(report, empresaId)
            relatoriosImportados++
          }
        }
        resolve({ relatoriosImportados })
      } catch {
        reject(
          new Error(
            'Não foi possível ler o arquivo de backup. Verifique se é um JSON exportado pela IncluiPro.',
          ),
        )
      }
    }
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo.'))
    reader.readAsText(file)
  })
}
