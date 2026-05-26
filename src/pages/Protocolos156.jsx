import { useMemo, useState } from 'react'
import { useCollection } from '../hooks/useCollection'
import { useAuth } from '../hooks/useAuth'
import { COLLECTIONS, create, update, remove, createBatch } from '../firebase/db'
import {
  canManageProtocolos,
  canDeleteProtocolos,
  canImportProtocolosExcel,
} from '../utils/roles'
import { calcStatusExibicao } from '../utils/protocolos156'
import Loading from '../components/Loading'
import ProtocoloLista from '../components/protocolos156/ProtocoloLista'
import ProtocoloForm from '../components/protocolos156/ProtocoloForm'
import ProtocoloDetalhes from '../components/protocolos156/ProtocoloDetalhes'
import ProtocoloDashboard from '../components/protocolos156/ProtocoloDashboard'
import ImportarExcel from '../components/protocolos156/ImportarExcel'

const TABS = [
  { id: 'lista', label: 'Lista' },
  { id: 'novo', label: 'Novo protocolo' },
  { id: 'dashboard', label: 'Dashboard' },
]

export default function Protocolos156() {
  const { data, loading } = useCollection(COLLECTIONS.PROTOCOLOS)
  const { user, perfil } = useAuth()
  const canManage = canManageProtocolos(perfil)
  const canImport = canImportProtocolosExcel(perfil)

  const [tab, setTab] = useState('lista')
  const [selectedId, setSelectedId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [importOpen, setImportOpen] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [loadingAction, setLoadingAction] = useState(false)

  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroBairro, setFiltroBairro] = useState('')
  const [busca, setBusca] = useState('')

  const bairros = useMemo(
    () => [...new Set(data.map((p) => p.bairro).filter(Boolean))].sort(),
    [data],
  )

  const filtered = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return data.filter((p) => {
      const st = calcStatusExibicao(p)
      if (filtroTipo && p.tipo !== filtroTipo) return false
      if (filtroStatus && st !== filtroStatus) return false
      if (filtroBairro && p.bairro !== filtroBairro) return false
      if (q && !p.numero?.toLowerCase().includes(q) && !p.endereco?.toLowerCase().includes(q)) return false
      return true
    })
  }, [data, filtroTipo, filtroStatus, filtroBairro, busca])

  const selected = useMemo(() => data.find((p) => p.id === selectedId), [data, selectedId])

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const appendHistorico = (protocolo, status, responsavel, observacao) => [
    ...(protocolo.historicoStatus || []),
    { data: new Date().toISOString(), status, responsavel, observacao: observacao || '' },
  ]

  const handleSave = async (payload) => {
    if (editItem?.id) {
      await update(COLLECTIONS.PROTOCOLOS, editItem.id, payload)
      showSuccess('Protocolo atualizado com sucesso!')
      setEditItem(null)
      setShowForm(false)
    } else {
      const hist = appendHistorico(
        { historicoStatus: [] },
        payload.status,
        payload.responsavel,
        'Protocolo cadastrado',
      )
      await create(COLLECTIONS.PROTOCOLOS, {
        ...payload,
        dataCadastro: new Date().toISOString(),
        historicoStatus: hist,
      })
      showSuccess('Protocolo cadastrado com sucesso!')
      setShowForm(false)
      setTab('lista')
    }
  }

  const handleAtualizarStatus = async (status, observacao, responsavel) => {
    if (!selected) return
    setLoadingAction(true)
    const hist = appendHistorico(selected, status, responsavel, observacao)
    await update(COLLECTIONS.PROTOCOLOS, selected.id, { status, historicoStatus: hist })
    showSuccess('Status atualizado!')
    setLoadingAction(false)
  }

  const handleConcluir = async () => {
    if (!selected) return
    setLoadingAction(true)
    const now = new Date().toISOString()
    const hist = appendHistorico(selected, 'Concluído', user?.email || '', 'Marcado como concluído')
    await update(COLLECTIONS.PROTOCOLOS, selected.id, {
      status: 'Concluído',
      dataConclusao: now,
      historicoStatus: hist,
    })
    showSuccess('Protocolo concluído!')
    setLoadingAction(false)
  }

  const handleExcluir = async () => {
    if (!selected) return
    await remove(COLLECTIONS.PROTOCOLOS, selected.id)
    setSelectedId(null)
    showSuccess('Protocolo excluído.')
  }

  const handleImport = async (rows) => {
    await createBatch(COLLECTIONS.PROTOCOLOS, rows)
    showSuccess(`${rows.length} protocolos importados com sucesso!`)
  }

  if (loading) return <Loading />

  if (selectedId && selected && !showForm) {
    return (
      <div className="space-y-4">
        {successMsg && <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">{successMsg}</div>}
        <ProtocoloDetalhes
          protocolo={selected}
          perfil={perfil}
          userEmail={user?.email}
          onBack={() => setSelectedId(null)}
          onEdit={() => { setEditItem(selected); setShowForm(true) }}
          onAtualizarStatus={handleAtualizarStatus}
          onConcluir={handleConcluir}
          onExcluir={handleExcluir}
          loadingAction={loadingAction}
        />
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={() => { setShowForm(false); setEditItem(null) }} className="text-sm text-primary hover:underline">← Voltar</button>
        {successMsg && <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">{successMsg}</div>}
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">{editItem ? 'Editar protocolo' : 'Novo protocolo'}</h2>
          {canManage ? (
            <ProtocoloForm initial={editItem} onSave={handleSave} onCancel={() => { setShowForm(false); setEditItem(null) }} disabled={false} />
          ) : (
            <p className="text-gray-500 text-sm">Sem permissão.</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Protocolos 156</h1>
        <p className="text-gray-500 text-sm">Gestão de solicitações e atendimentos</p>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">✓ {successMsg}</div>
      )}

      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((t) => {
          if (t.id === 'novo' && !canManage) return null
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${
                tab === t.id ? 'border-primary text-primary' : 'border-transparent text-gray-500'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'lista' && (
        <>
          <ProtocoloLista
            protocolos={filtered}
            filtroTipo={filtroTipo}
            setFiltroTipo={setFiltroTipo}
            filtroStatus={filtroStatus}
            setFiltroStatus={setFiltroStatus}
            filtroBairro={filtroBairro}
            setFiltroBairro={setFiltroBairro}
            busca={busca}
            setBusca={setBusca}
            bairros={bairros}
            canCreate={canManage}
            canImport={canImport}
            onNovo={() => { setEditItem(null); setShowForm(true) }}
            onDetalhes={(id) => setSelectedId(id)}
            onImportar={() => setImportOpen(true)}
          />
          <ImportarExcel open={importOpen} onClose={() => setImportOpen(false)} onConfirm={handleImport} />
        </>
      )}

      {tab === 'novo' && canManage && (
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Cadastro de protocolo</h2>
          <ProtocoloForm
            onSave={handleSave}
            onCancel={() => setTab('lista')}
            disabled={false}
          />
        </div>
      )}

      {tab === 'dashboard' && <ProtocoloDashboard protocolos={data} />}
    </div>
  )
}
