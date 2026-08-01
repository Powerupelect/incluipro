// Captura de leads do formulário de Diagnóstico.
// TODO: integrar com backend/CRM — por enquanto, os leads ficam apenas em memória/localStorage.

const LEADS_KEY = 'incluipro_leads'

export function saveLead(lead) {
  const leads = getLeads()
  leads.push({ ...lead, id: crypto.randomUUID(), createdAt: new Date().toISOString() })
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads))
}

export function getLeads() {
  try {
    return JSON.parse(localStorage.getItem(LEADS_KEY)) || []
  } catch {
    return []
  }
}
