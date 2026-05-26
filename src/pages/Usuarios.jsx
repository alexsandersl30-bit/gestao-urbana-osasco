import { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'
import { createUserAccount } from '../firebase/auth'
import { PERFIS } from '../utils/roles'
import Modal from '../components/Modal'
import Loading from '../components/Loading'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ nome: '', email: '', password: '', perfil: PERFIS.OPERADOR })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const snap = await getDocs(collection(db, 'usuarios'))
    setUsuarios(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    setError('')
    setSaving(true)
    try {
      await createUserAccount(form)
      setModal(false)
      setForm({ nome: '', email: '', password: '', perfil: PERFIS.OPERADOR })
      await load()
    } catch (err) {
      setError(err.message || 'Erro ao criar usuário')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Usuários</h1>
          <p className="text-gray-500 text-sm">Gerenciamento de acesso — apenas Gestor</p>
        </div>
        <button type="button" onClick={() => setModal(true)} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">
          + Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">E-mail</th>
              <th className="p-3">Perfil</th>
              <th className="p-3">Criado em</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3">{u.nome}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3"><span className="px-2 py-0.5 bg-primary-light text-primary rounded text-xs font-medium">{u.perfil}</span></td>
                <td className="p-3">{u.criadoEm ? new Date(u.criadoEm).toLocaleDateString('pt-BR') : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Novo Usuário">
        {error && <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
        <div className="space-y-3">
          <input placeholder="Nome completo" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
          <input type="email" placeholder="E-mail" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
          <input type="password" placeholder="Senha (mín. 6 caracteres)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
          <select value={form.perfil} onChange={(e) => setForm({ ...form, perfil: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
            {Object.values(PERFIS).map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <button type="button" onClick={handleCreate} disabled={saving} className="mt-4 w-full py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-60">
          {saving ? 'Criando...' : 'Criar Usuário'}
        </button>
      </Modal>
    </div>
  )
}
