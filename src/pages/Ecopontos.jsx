import { useMemo, useState } from 'react'
import { useCollection } from '../hooks/useCollection'
import { useAuth } from '../hooks/useAuth'
import { COLLECTIONS, create, update, remove } from '../firebase/db'
import { canManageEcopontos } from '../utils/roles'
import { ultimaVistoriaPorEcoponto } from '../utils/ecopontos'
import Loading from '../components/Loading'
import EcopontoLista from '../components/ecopontos/EcopontoLista'
import EcopontoForm from '../components/ecopontos/EcopontoForm'
import EcopontoDetalhes from '../components/ecopontos/EcopontoDetalhes'
import EcopontoEstatisticas from '../components/ecopontos/EcopontoEstatisticas'
import VistoriaChecklist, { createEmptyVistoria } from '../components/ecopontos/VistoriaChecklist'

const TABS = [
  { id: 'cadastros', label: 'Cadastros' },
  { id: 'vistoria', label: 'Nova vistoria' },
  { id: 'estatisticas', label: 'Estatísticas' },
]

export default function Ecopontos() {
  const { data: ecopontos, loading: l1 } = useCollection(COLLECTIONS.ECOPONTOS)
  const { data: vistorias, loading: l2 } = useCollection(COLLECTIONS.VISTORIAS)
  const { user, perfil } = useAuth()
  const canManage = canManageEcopontos(perfil)

  const [tab, setTab] = useState('cadastros')
  const [selectedId, setSelectedId] = useState(null)
  const [showEcoForm, setShowEcoForm] = useState(false)
  const [editEco, setEditEco] = useState(null)
  const [visForm, setVisForm] = useState(() => createEmptyVistoria())
  const [lastSavedVistoria, setLastSavedVistoria] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [savingVis, setSavingVis] = useState(false)

  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroBairro, setFiltroBairro] = useState('')

  const bairros = useMemo(
    () => [...new Set(ecopontos.map((e) => e.bairro).filter(Boolean))].sort(),
    [ecopontos],
  )

  const ultimaPorEcoponto = useMemo(() => ultimaVistoriaPorEcoponto(vistorias), [vistorias])

  const filtered = useMemo(() => {
    return ecopontos.filter((e) => {
      if (filtroTipo && e.tipo !== filtroTipo) return false
      if (filtroBairro && e.bairro !== filtroBairro) return false
      return true
    })
  }, [ecopontos, filtroTipo, filtroBairro])

  const selectedEco = useMemo(() => ecopontos.find((e) => e.id === selectedId), [ecopontos, selectedId])
  const vistoriasEco = useMemo(
    () => vistorias.filter((v) => v.ecopontoId === selectedId),
    [vistorias, selectedId],
  )

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const handleSaveEco = async (payload) => {
    if (editEco?.id) {
      await update(COLLECTIONS.ECOPONTOS, editEco.id, payload)
      showSuccess('Ecoponto atualizado com sucesso!')
      setEditEco(null)
      setShowEcoForm(false)
      if (selectedId === editEco.id) setSelectedId(editEco.id)
    } else {
      await create(COLLECTIONS.ECOPONTOS, {
        ...payload,
        dataCadastro: new Date().toISOString(),
        ativo: true,
      })
      showSuccess('Ecoponto cadastrado com sucesso!')
      setShowEcoForm(false)
      setTab('cadastros')
    }
  }

  const handleSaveVistoria = async (conformidade) => {
    if (!visForm.ecopontoId || !visForm.fiscal?.trim()) {
      showSuccess('Selecione o ecoponto e informe o fiscal.')
      return
    }
    setSavingVis(true)
    const eco = ecopontos.find((e) => e.id === visForm.ecopontoId)
    const payload = {
      ...visForm,
      dataVisita: new Date(visForm.dataVisita).toISOString(),
      ecopontoNome: eco?.nome || visForm.ecopontoNome,
      conformidade,
    }
    const id = await create(COLLECTIONS.VISTORIAS, payload)
    setLastSavedVistoria({ ...payload, id })
    showSuccess(`Vistoria salva com ${conformidade}% de conformidade!`)
    setSavingVis(false)
  }

  const handleExcluirEco = async () => {
    if (!selectedEco) return
    await remove(COLLECTIONS.ECOPONTOS, selectedEco.id)
    const vs = vistorias.filter((v) => v.ecopontoId === selectedEco.id)
    await Promise.all(vs.map((v) => remove(COLLECTIONS.VISTORIAS, v.id)))
    setSelectedId(null)
    showSuccess('Ecoponto excluído.')
  }

  const openNovaVistoria = (ecopontoId) => {
    const eco = ecopontos.find((e) => e.id === ecopontoId)
    const v = createEmptyVistoria(user?.email || '', ecopontoId)
    if (eco) {
      v.contato = eco.contato || ''
      v.inaugurado = eco.inaugurado === true
      v.epi = eco.epi === true
      v.horarioFuncionamento = eco.horario || ''
      v.ecopontoNome = eco.nome
    }
    setVisForm(v)
    setLastSavedVistoria(null)
    setTab('vistoria')
    setSelectedId(null)
  }

  if (l1 || l2) return <Loading />

  if (selectedId && selectedEco && !showEcoForm) {
    return (
      <div className="space-y-4">
        {successMsg && <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">{successMsg}</div>}
        <EcopontoDetalhes
          ecoponto={selectedEco}
          vistorias={vistoriasEco}
          perfil={perfil}
          onBack={() => setSelectedId(null)}
          onEdit={() => { setEditEco(selectedEco); setShowEcoForm(true) }}
          onNovaVistoria={() => openNovaVistoria(selectedEco.id)}
          onExcluir={handleExcluirEco}
        />
      </div>
    )
  }

  if (showEcoForm) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={() => { setShowEcoForm(false); setEditEco(null) }} className="text-sm text-primary hover:underline">← Voltar</button>
        {successMsg && <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">{successMsg}</div>}
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">{editEco ? 'Editar ecoponto' : 'Cadastro de ecoponto'}</h2>
          {canManage ? (
            <EcopontoForm
              initial={editEco}
              onSave={handleSaveEco}
              onCancel={() => { setShowEcoForm(false); setEditEco(null) }}
              disabled={false}
            />
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
        <h1 className="text-2xl font-bold text-gray-800">Ecopontos / PEVs / Cooperativas</h1>
        <p className="text-gray-500 text-sm">Cadastro e vistorias de unidades de recebimento de resíduos</p>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm flex gap-2">
          <span>✓</span> {successMsg}
        </div>
      )}

      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((t) => {
          if (t.id === 'vistoria' && !canManage) return null
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px ${
                tab === t.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === 'cadastros' && (
        <EcopontoLista
          ecopontos={filtered}
          ultimaPorEcoponto={ultimaPorEcoponto}
          filtroTipo={filtroTipo}
          setFiltroTipo={setFiltroTipo}
          filtroBairro={filtroBairro}
          setFiltroBairro={setFiltroBairro}
          bairros={bairros}
          canCreate={canManage}
          onNovo={() => { setEditEco(null); setShowEcoForm(true) }}
          onDetalhes={(id) => setSelectedId(id)}
        />
      )}

      {tab === 'vistoria' && canManage && (
        <VistoriaChecklist
          form={visForm}
          setForm={setVisForm}
          ecopontos={ecopontos}
          disabled={false}
          onSave={handleSaveVistoria}
          saving={savingVis}
          savedVistoria={lastSavedVistoria}
          ecopontoForPdf={ecopontos.find((e) => e.id === (lastSavedVistoria?.ecopontoId || visForm.ecopontoId))}
        />
      )}

      {tab === 'estatisticas' && (
        <EcopontoEstatisticas ecopontos={ecopontos} vistorias={vistorias} />
      )}
    </div>
  )
}
