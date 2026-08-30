// Backup manual dos dados salvos no navegador — proteção temporária enquanto não há banco de dados.
// Exporta apenas os dados do usuário (relatórios e leads), nunca credenciais de acesso.

import { getReports } from './reports.js'
import { getLeads } from './leads.js'

const REPORTS_KEY = 'incluipro_reports'
const LEADS_KEY = 'incluipro_leads'

export function exportBackup() {
  const data = {
    versao: 1,
    exportadoEm: new Date().toISOString(),
    reports: getReports(),
    leads: getLeads(),
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

export function importBackup(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (!data || typeof data !== 'object' || (!Array.isArray(data.reports) && !Array.isArray(data.leads))) {
          throw new Error('invalido')
        }
        if (Array.isArray(data.reports)) {
          localStorage.setItem(REPORTS_KEY, JSON.stringify(data.reports))
        }
        if (Array.isArray(data.leads)) {
          localStorage.setItem(LEADS_KEY, JSON.stringify(data.leads))
        }
        resolve(data)
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
