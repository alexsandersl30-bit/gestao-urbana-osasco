import { useMemo, useState } from 'react'
import { useCollection } from '../hooks/useCollection'
import { useAuth } from '../hooks/useAuth'
import { COLLECTIONS, create, update, remove } from '../firebase/db'
import { canManagePontosViciados } from '../utils/roles'
import Loading from '../components/Loading'
import PontoLista from '../components/pontos-viciados/PontoLista'
import PontoForm from '../components/pontos-viciados/PontoForm'
import PontoDetalhes from '../components/pontos-viciados/PontoDetalhes'
import PontoEstatisticas from '../components/pontos-viciados/PontoEstatisticas'

const TABS = [
  { id: 'lista', label: 'Lista' },
  { id: 'novo', label: 'Novo cadastro' },
  { id: 'estatisticas', label: 'Estatísticas' },
]

export default function PontosViciados() {
  const { data, loading } = useCollection(COLLECTIONS.PONTOS)
  const { perfil } = useAuth()
  const canManage = canManagePontosViciados(perfil)

  const [tab, setTab] = useState('lista')
  const [selectedId, setSelectedId] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [loadingAction, setLoadingAction] = useState(false)

  const [filtroBairro, setFiltroBairro] = useState('')
  const [filtroCriticidade, setFiltroCriticidade] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [busca, setBusca] = useState('')

  const bairros = useMemo(
    () => [...new Set(data.map((d) => d.bairro).filter(Boolean))].sort(),
    [data],
  )

  const filtered = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return data.filter((item) => {
      if (filtroBairro && item.bairro !== filtroBairro) return false
      if (filtroCriticidade && item.criticidade !== filtroCriticidade) return false
      if (filtroStatus && (item.status || 'Ativo') !== filtroStatus) return false
      if (q && !item.endereco?.toLowerCase().includes(q)) return false
      return true
    })
  }, [data, filtroBairro, filtroCriticidade, filtroStatus, busca])

  const selectedPonto = useMemo(
    () => data.find((p) => p.id === selectedId),
    [data, selectedId],
  )

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const handleSave = async (payload) => {
    if (editItem?.id) {
      await update(COLLECTIONS.PONTOS, editItem.id, payload)
      showSuccess('Ponto viciado atualizado com sucesso!')
      setEditItem(null)
      setSelectedId(editItem.id)
      setTab('lista')
    } else {
      await create(COLLECTIONS.PONTOS, {
        ...payload,
        dataCadastro: new Date().toISOString(),
        denuncias: 0,
        status: 'Ativo',
        historicoAtendimentos: [],
        historicoDenuncias: [],
      })
      showSuccess('Ponto viciado cadastrado com sucesso!')
      setTab('lista')
    }
  }

  const handleAtendimento = async () => {
    if (!selectedPonto) return
    setLoadingAction(true)
    const now = new Date().toISOString()
    const hist = [...(selectedPonto.historicoAtendimentos || []), now]
    await update(COLLECTIONS.PONTOS, selectedPonto.id, {
      ultimoAtendimento: now,
      historicoAtendimentos: hist,
    })
    showSuccess('Atendimento registrado!')
    setLoadingAction(false)
  }

  const handleDenuncia = async () => {
    if (!selectedPonto) return
    setLoadingAction(true)
    const now = new Date().toISOString()
    await update(COLLECTIONS.PONTOS, selectedPonto.id, {
      denuncias: (selectedPonto.denuncias || 0) + 1,
      historicoDenuncias: [...(selectedPonto.historicoDenuncias || []), now],
    })
    showSuccess('Denúncia registrada!')
    setLoadingAction(false)
  }

  const handleResolver = async () => {
    if (!selectedPonto) return
    setLoadingAction(true)
    await update(COLLECTIONS.PONTOS, selectedPonto.id, { status: 'Resolvido' })
    showSuccess('Ponto marcado como resolvido!')
    setLoadingAction(false)
  }

  const handleExcluir = async () => {
    if (!selectedPonto) return
    setLoadingAction(true)
    await remove(COLLECTIONS.PONTOS, selectedPonto.id)
    setSelectedId(null)
    setTab('lista')
    showSuccess('Ponto excluído.')
    setLoadingAction(false)
  }

  if (loading) return <Loading />

  if (selectedId && selectedPonto) {
    return (
      <div className="space-y-4">
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
            {successMsg}
          </div>
        )}
        <PontoDetalhes
          ponto={selectedPonto}
          perfil={perfil}
          onBack={() => setSelectedId(null)}
          onEdit={() => {
            setEditItem(selectedPonto)
            setSelectedId(null)
            setTab('novo')
          }}
          onAtendimento={handleAtendimento}
          onDenuncia={handleDenuncia}
          onResolver={handleResolver}
          onExcluir={handleExcluir}
          loadingAction={loadingAction}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Pontos Viciados</h1>
        <p className="text-gray-500 text-sm">Gestão de pontos críticos de limpeza urbana</p>
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
        <PontoLista
          pontos={filtered}
          filtroBairro={filtroBairro}
          setFiltroBairro={setFiltroBairro}
          filtroCriticidade={filtroCriticidade}
          setFiltroCriticidade={setFiltroCriticidade}
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
            {editItem ? 'Editar ponto viciado' : 'Cadastro de novo ponto viciado'}
          </h2>
          {canManage ? (
            <PontoForm
              initial={editItem}
              onSave={handleSave}
              onCancel={() => { setEditItem(null); setTab('lista') }}
              disabled={false}
            />
          ) : (
            <p className="text-gray-500 text-sm">Você não tem permissão para cadastrar pontos.</p>
          )}
        </div>
      )}

      {tab === 'estatisticas' && <PontoEstatisticas pontos={data} />}
    </div>
  )
}
