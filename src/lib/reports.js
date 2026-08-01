// Histórico de relatórios gerados pelo IncluiPro Avalia.
// TODO: persistir em banco de dados real — por enquanto, salvo em localStorage por navegador.

const REPORTS_KEY = 'incluipro_reports'

export function getReports() {
  try {
    return JSON.parse(localStorage.getItem(REPORTS_KEY)) || []
  } catch {
    return []
  }
}

export function saveReport(report) {
  const reports = getReports()
  const entry = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...report,
  }
  localStorage.setItem(REPORTS_KEY, JSON.stringify([entry, ...reports]))
  return entry
}

export function deleteReport(id) {
  const reports = getReports().filter((r) => r.id !== id)
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports))
}
