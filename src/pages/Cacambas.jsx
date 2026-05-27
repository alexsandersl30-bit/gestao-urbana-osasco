import { useMemo, useState } from 'react'
import { useCollection } from '../hooks/useCollection'
import { useAuth } from '../hooks/useAuth'
import { COLLECTIONS, create, update, remove } from '../firebase/db'
import { canManageCacambas } from '../utils/roles'
import { calcStatusCacamba } from '../utils/cacambas'
import Loading from '../components/Loading'
import CacambaLista from '../components/cacambas/CacambaLista'
import CacambaForm from '../components/cacambas/CacambaForm'
import CacambaDetalhes from '../components/cacambas/CacambaDetalhes'
import CacambaEstatisticas from '../components/cacambas/CacambaEstatisticas'

const TABS = [
  { id: 'lista', label: 'Lista' },
  { id: 'novo', label: 'Nova caçamba' },
  { id: 'estatisticas', label: 'Estatísticas' },
]

export default function Cacambas() {
  const { data, loading } = useCollection(COLLECTIONS.CACAMBAS)
  const { user, perfil } = useAuth()
  const canManage = canManageCacambas(perfil)

  const [tab, setTab] = useState('lista')
  const [selectedId, setSelectedId] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [loadingAction, setLoadingAction] = useState(false)

  const [filtroBairro, setFiltroBairro] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [busca, setBusca] = useState('')

  const bairros = useMemo(
    () => [...new Set(data.map((d) => d.bairro).filter(Boolean))].sort(),
    [data],
  )

  const filtered = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return data.filter((item) => {
      const status = calcStatusCacamba(item)
      if (filtroBairro && item.bairro !== filtroBairro) return false
      if (filtroStatus && status !== filtroStatus) return false
      if (q && !item.endereco?.toLowerCase().includes(q)) return false
      return true
    })
  }, [data, filtroBairro, filtroStatus, busca])

  const selectedCacamba = useMemo(
    () => data.find((c) => c.id === selectedId),
    [data, selectedId],
  )

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const buildPayload = (formData) => {
    const status = calcStatusCacamba({ ...formData, ativa: formData.ativa !== false })
    return { ...formData, status }
  }

  const handleSave = async (formData) => {
    const payload = buildPayload(formData)
    if (editItem?.id) {
      await update(COLLECTIONS.CACAMBAS, editItem.id, payload)
      showSuccess('Caçamba atualizada com sucesso!')
      setEditItem(null)
      setSelectedId(editItem.id)
      setTab('lista')
    } else {
      await create(COLLECTIONS.CACAMBAS, {
        ...payload,
        dataCadastro: new Date().toISOString(),
        ultimaColeta: null,
        ativa: true,
        historicoColetas: [],
      })
      showSuccess('Caçamba cadastrada com sucesso!')
      setTab('lista')
    }
  }

  const handleColeta = async () => {
    if (!selectedCacamba) return
    setLoadingAction(true)
    const now = new Date().toISOString()
    const responsavel = user?.email || 'Fiscal'
    const entrada = { data: now, responsavel }
    const hist = [...(selectedCacamba.historicoColetas || []), entrada]
    const updated = {
      ultimaColeta: now,
      historicoColetas: hist,
      ativa: true,
    }
    const status = calcStatusCacamba({ ...selectedCacamba, ...updated })
    await update(COLLECTIONS.CACAMBAS, selectedCacamba.id, { ...updated, status })
    showSuccess('Coleta registrada com sucesso!')
    setLoadingAction(false)
  }

  const handleDesativar = async () => {
    if (!selectedCacamba) return
    setLoadingAction(true)
    await update(COLLECTIONS.CACAMBAS, selectedCacamba.id, { ativa: false })
    showSuccess('Caçamba desativada.')
    setLoadingAction(false)
  }

  const handleExcluir = async () => {
    if (!selectedCacamba) return
    setLoadingAction(true)
    await remove(COLLECTIONS.CACAMBAS, selectedCacamba.id)
    setSelectedId(null)
    setTab('lista')
    showSuccess('Caçamba excluída.')
    setLoadingAction(false)
  }

  if (loading) return <Loading />

  if (selectedId && selectedCacamba) {
    return (
      <div className="space-y-4">
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
            {successMsg}
          </div>
        )}
        <CacambaDetalhes
          cacamba={selectedCacamba}
          perfil={perfil}
          onBack={() => setSelectedId(null)}
          onEdit={() => {
            setEditItem(selectedCacamba)
            setSelectedId(null)
            setTab('novo')
          }}
          onColeta={handleColeta}
          onDesativar={handleDesativar}
          onExcluir={handleExcluir}
          loadingAction={loadingAction}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Caçambas</h1>
        <p className="text-gray-500 text-sm">Gestão de coleta de resíduos e entulho</p>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <span>✓</span> {successMsg}
        </div>
      )}

      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((t) => {
          if (t.id === 'novo' && !canManage) return null
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id)
                if (t.id === 'novo' && !editItem) setEditItem(null)
              }}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                tab === t.id
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'lista' && (
        <CacambaLista
          cacambas={filtered}
          filtroBairro={filtroBairro}
          setFiltroBairro={setFiltroBairro}
          filtroStatus={filtroStatus}
          setFiltroStatus={setFiltroStatus}
          busca={busca}
          setBusca={setBusca}
          bairros={bairros}
          canCreate={canManage}
          onNovo={() => { setEditItem(null); setTab('novo') }}
          onDetalhes={(id) => setSelectedId(id)}
        />
      )}

      {tab === 'novo' && (
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {editItem ? 'Editar caçamba' : 'Cadastro de nova caçamba'}
          </h2>
          {canManage ? (
            <CacambaForm
              initial={editItem}
              onSave={handleSave}
              onCancel={() => { setEditItem(null); setTab('lista') }}
              disabled={false}
            />
          ) : (
            <p className="text-gray-500 text-sm">Você não tem permissão para cadastrar caçambas.</p>
          )}
        </div>
      )}

      {tab === 'estatisticas' && <CacambaEstatisticas cacambas={data} />}
    </div>
  )
}
