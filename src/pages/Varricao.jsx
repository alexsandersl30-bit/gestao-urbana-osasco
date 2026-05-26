import { useEffect, useMemo, useState } from 'react'
import { useCollection } from '../hooks/useCollection'
import { useAuth } from '../hooks/useAuth'
import { useHistoricoVarricao } from '../hooks/useHistoricoVarricao'
import {
  COLLECTIONS,
  create,
  update,
  addHistoricoVarricao,
  fetchAllHistoricoVarricao,
  removeVarricaoComHistorico,
} from '../firebase/db'
import { canManageVarricao } from '../utils/roles'
import {
  calcStatusVarricao,
  isAtiva,
  normalizePlano,
  kmValue,
} from '../utils/varricao'
import Loading from '../components/Loading'
import VarricaoLista from '../components/varricao/VarricaoLista'
import VarricaoForm from '../components/varricao/VarricaoForm'
import VarricaoDetalhes from '../components/varricao/VarricaoDetalhes'
import VarricaoEstatisticas from '../components/varricao/VarricaoEstatisticas'
import RegistroVarricaoForm from '../components/varricao/RegistroVarricaoForm'

const TABS = [
  { id: 'lista', label: 'Lista' },
  { id: 'novo', label: 'Nova rua' },
  { id: 'estatisticas', label: 'Estatísticas' },
]

export default function Varricao() {
  const { data, loading } = useCollection(COLLECTIONS.VARRICAO)
  const { user, perfil } = useAuth()
  const canManage = canManageVarricao(perfil)

  const [tab, setTab] = useState('lista')
  const [selectedId, setSelectedId] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [loadingAction, setLoadingAction] = useState(false)
  const [registroOpen, setRegistroOpen] = useState(false)
  const [historicoFlat, setHistoricoFlat] = useState([])
  const [loadingHistorico, setLoadingHistorico] = useState(false)

  const [filtroBairro, setFiltroBairro] = useState('')
  const [filtroPlano, setFiltroPlano] = useState('')
  const [filtroFrequencia, setFiltroFrequencia] = useState('')
  const [busca, setBusca] = useState('')

  const { historico, loading: historicoLoading } = useHistoricoVarricao(selectedId)

  const bairros = useMemo(
    () => [...new Set(data.map((d) => d.bairro).filter(Boolean))].sort(),
    [data],
  )

  const filtered = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return data.filter((item) => {
      if (filtroBairro && item.bairro !== filtroBairro) return false
      if (filtroPlano && normalizePlano(item.plano) !== filtroPlano) return false
      if (filtroFrequencia && item.frequencia !== filtroFrequencia) return false
      if (q && !item.rua?.toLowerCase().includes(q)) return false
      return true
    })
  }, [data, filtroBairro, filtroPlano, filtroFrequencia, busca])

  const totalKmFiltered = useMemo(
    () => filtered.reduce((s, r) => s + kmValue(r.quilometragem), 0),
    [filtered],
  )

  const selectedRua = useMemo(
    () => data.find((r) => r.id === selectedId),
    [data, selectedId],
  )

  useEffect(() => {
    if (tab !== 'estatisticas' || !data.length) {
      setHistoricoFlat([])
      return
    }
    let cancelled = false
    setLoadingHistorico(true)
    fetchAllHistoricoVarricao(data.map((d) => d.id))
      .then((items) => {
        if (!cancelled) setHistoricoFlat(items)
      })
      .finally(() => {
        if (!cancelled) setLoadingHistorico(false)
      })
    return () => { cancelled = true }
  }, [tab, data])

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const buildPayload = (formData) => {
    const status = calcStatusVarricao({ ...formData, ativa: formData.ativa !== false })
    return { ...formData, status }
  }

  const handleSave = async (formData) => {
    const payload = buildPayload(formData)
    if (editItem?.id) {
      await update(COLLECTIONS.VARRICAO, editItem.id, payload)
      showSuccess('Rua atualizada com sucesso!')
      setEditItem(null)
      setSelectedId(editItem.id)
      setTab('lista')
    } else {
      await create(COLLECTIONS.VARRICAO, {
        ...payload,
        dataCadastro: new Date().toISOString(),
        ultimaVarricao: null,
        ativa: true,
      })
      showSuccess('Rua cadastrada com sucesso!')
      setTab('lista')
    }
  }

  const handleRegistroVarricao = async (registro) => {
    if (!selectedRua) return
    setLoadingAction(true)
    await addHistoricoVarricao(selectedRua.id, registro)
    const status = calcStatusVarricao({
      ...selectedRua,
      ultimaVarricao: registro.data,
      ativa: true,
    })
    await update(COLLECTIONS.VARRICAO, selectedRua.id, {
      ultimaVarricao: registro.data,
      status,
      ativa: true,
    })
    showSuccess('Varrição registrada com sucesso!')
    setLoadingAction(false)
  }

  const handleDesativar = async () => {
    if (!selectedRua) return
    setLoadingAction(true)
    await update(COLLECTIONS.VARRICAO, selectedRua.id, { ativa: false })
    showSuccess('Rua desativada.')
    setLoadingAction(false)
  }

  const handleExcluir = async () => {
    if (!selectedRua) return
    setLoadingAction(true)
    await removeVarricaoComHistorico(selectedRua.id)
    setSelectedId(null)
    setTab('lista')
    showSuccess('Rua excluída.')
    setLoadingAction(false)
  }

  if (loading) return <Loading />

  if (selectedId && selectedRua) {
    return (
      <div className="space-y-4">
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">{successMsg}</div>
        )}
        <VarricaoDetalhes
          rua={selectedRua}
          historico={historico}
          historicoLoading={historicoLoading}
          perfil={perfil}
          onBack={() => setSelectedId(null)}
          onEdit={() => {
            setEditItem(selectedRua)
            setSelectedId(null)
            setTab('novo')
          }}
          onRegistrar={() => setRegistroOpen(true)}
          onDesativar={handleDesativar}
          onExcluir={handleExcluir}
          loadingAction={loadingAction}
        />
        <RegistroVarricaoForm
          open={registroOpen}
          onClose={() => setRegistroOpen(false)}
          onSave={handleRegistroVarricao}
          rua={selectedRua}
          responsavelDefault={user?.email}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Varrição Municipal</h1>
        <p className="text-gray-500 text-sm">Gestão de rotas e quilometragem de varrição</p>
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
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
                tab === t.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'lista' && (
        <VarricaoLista
          ruas={filtered}
          totalRuas={filtered.length}
          totalKm={totalKmFiltered}
          filtroBairro={filtroBairro}
          setFiltroBairro={setFiltroBairro}
          filtroPlano={filtroPlano}
          setFiltroPlano={setFiltroPlano}
          filtroFrequencia={filtroFrequencia}
          setFiltroFrequencia={setFiltroFrequencia}
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
            {editItem ? 'Editar rua/trecho' : 'Cadastro de nova rua'}
          </h2>
          {canManage ? (
            <VarricaoForm
              initial={editItem}
              onSave={handleSave}
              onCancel={() => { setEditItem(null); setTab('lista') }}
              disabled={false}
            />
          ) : (
            <p className="text-gray-500 text-sm">Você não tem permissão para cadastrar ruas.</p>
          )}
        </div>
      )}

      {tab === 'estatisticas' && (
        <VarricaoEstatisticas
          ruas={data}
          historicoFlat={historicoFlat}
          loadingHistorico={loadingHistorico}
        />
      )}
    </div>
  )
}
