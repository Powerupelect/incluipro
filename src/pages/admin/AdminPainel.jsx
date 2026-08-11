import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminList, adminUpsert, adminRemove } from '../../lib/api.js'
import { getAdminToken, setAdminToken } from '../../lib/adminAuth.js'
import { PLANO_LABEL } from '../../lib/plano.js'

export function AdminPainel() {
  const navigate = useNavigate()
  const [registros, setRegistros] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')
  const [form, setForm] = useState({ email: '', nome: '', plano: 'vitalicio' })
  const [salvando, setSalvando] = useState(false)

  function handleUnauthorized() {
    setAdminToken(null)
    navigate('/admin/login', { replace: true })
  }

  async function carregar() {
    setCarregando(true)
    setErro('')
    try {
      const res = await adminList(getAdminToken())
      setRegistros(res.records)
    } catch (err) {
      if (err.message === 'Não autorizado') handleUnauthorized()
      else setErro(err.message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleAdicionar(e) {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    try {
      await adminUpsert(getAdminToken(), { ...form, status: 'ativo' })
      setForm({ email: '', nome: '', plano: 'vitalicio' })
      await carregar()
    } catch (err) {
      setErro(err.message)
    } finally {
      setSalvando(false)
    }
  }

  async function handleBloquear(email, bloquear) {
    setErro('')
    try {
      await adminUpsert(getAdminToken(), { email, status: bloquear ? 'bloqueado' : 'ativo' })
      await carregar()
    } catch (err) {
      setErro(err.message)
    }
  }

  async function handleRemover(email) {
    if (!confirm(`Remover completamente o acesso de ${email}?`)) return
    setErro('')
    try {
      await adminRemove(getAdminToken(), email)
      await carregar()
    } catch (err) {
      setErro(err.message)
    }
  }

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return registros
    return registros.filter(
      (r) => r.email.includes(q) || (r.nome || '').toLowerCase().includes(q),
    )
  }, [registros, busca])

  function handleLogout() {
    setAdminToken(null)
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-signal-600">
            Administração
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-indigo-800">
            Clientes liberados
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm font-semibold text-graphite-500 hover:text-red-600"
        >
          Sair
        </button>
      </div>

      {erro && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{erro}</p>}

      <form
        onSubmit={handleAdicionar}
        className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-mist-300 bg-white p-6 shadow-card"
      >
        <div className="min-w-[200px] flex-1">
          <label className="text-xs font-semibold text-graphite-700">E-mail do cliente</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-mist-400 px-3 py-2.5 text-sm outline-none focus:border-signal-500"
          />
        </div>
        <div className="min-w-[160px] flex-1">
          <label className="text-xs font-semibold text-graphite-700">Nome (opcional)</label>
          <input
            value={form.nome}
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-mist-400 px-3 py-2.5 text-sm outline-none focus:border-signal-500"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-graphite-700">Plano</label>
          <select
            value={form.plano}
            onChange={(e) => setForm((f) => ({ ...f, plano: e.target.value }))}
            className="mt-1 rounded-xl border border-mist-400 px-3 py-2.5 text-sm outline-none focus:border-signal-500"
          >
            <option value="vitalicio">Empresarial</option>
            <option value="mensal">Mensal (legado)</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={salvando}
          className="rounded-full bg-signal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-signal-700 disabled:opacity-50"
        >
          {salvando ? 'Salvando…' : '+ Liberar acesso'}
        </button>
      </form>

      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por e-mail ou nome…"
        className="mt-6 w-full max-w-sm rounded-xl border border-mist-400 px-4 py-2.5 text-sm outline-none focus:border-signal-500"
      />

      <div className="mt-4 overflow-x-auto rounded-2xl border border-mist-300 bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-mist-300 bg-mist-100 text-xs uppercase tracking-wide text-graphite-500">
            <tr>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Plano</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Origem</th>
              <th className="px-4 py-3">Atualizado</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mist-200">
            {carregando && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-graphite-400">
                  Carregando…
                </td>
              </tr>
            )}
            {!carregando && filtrados.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-graphite-400">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
            {filtrados.map((r) => (
              <tr key={r.email}>
                <td className="px-4 py-3 font-medium text-graphite-900">{r.email}</td>
                <td className="px-4 py-3 text-graphite-500">{r.nome || '—'}</td>
                <td className="px-4 py-3">{PLANO_LABEL[r.plano] || r.plano}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      r.status === 'ativo'
                        ? 'bg-signal-50 text-signal-700'
                        : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {r.status === 'ativo' ? 'Ativo' : 'Bloqueado'}
                  </span>
                </td>
                <td className="px-4 py-3 text-graphite-500">
                  {r.origem === 'hotmart' ? 'Hotmart' : 'Manual'}
                </td>
                <td className="px-4 py-3 text-graphite-400">
                  {new Date(r.updatedAt).toLocaleString('pt-BR')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <button
                      onClick={() => handleBloquear(r.email, r.status === 'ativo')}
                      className="text-indigo-700 hover:text-indigo-900"
                    >
                      {r.status === 'ativo' ? 'Bloquear' : 'Reativar'}
                    </button>
                    <button
                      onClick={() => handleRemover(r.email)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remover
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
