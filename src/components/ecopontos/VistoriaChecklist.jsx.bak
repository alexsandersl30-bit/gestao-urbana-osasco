import { useMemo } from 'react'
import PhotoUpload from '../PhotoUpload'
import { ItemCheck, ESTRUTURA_LABELS, RESIDUOS_LABELS, COMUNICACAO_LABELS } from '../ChecklistField'
import { calcularConformidade } from '../../utils/ecopontos'
import { exportarLaudoPDF } from '../../utils/pdfLaudo'

function initSection(labels) {
  return Object.keys(labels).reduce((acc, k) => {
    acc[k] = { condicao: '', obs: '' }
    return acc
  }, {})
}

export function createEmptyVistoria(fiscal = '', ecopontoId = '') {
  return {
    ecopontoId,
    ecopontoNome: '',
    fiscal,
    dataVisita: new Date().toISOString().slice(0, 10),
    horario: '',
    contato: '',
    inaugurado: false,
    epi: false,
    obs: '',
    equipamentos: { condicao: '', obs: '' },
    estrutura: initSection(ESTRUTURA_LABELS),
    residuos: initSection(RESIDUOS_LABELS),
    comunicacaoVisual: initSection(COMUNICACAO_LABELS),
    horarioFuncionamento: '',
    problemaMaisFrequente: '',
    fotos: [],
    conformidade: 0,
  }
}

export default function VistoriaChecklist({
  form,
  setForm,
  ecopontos,
  disabled,
  onSave,
  saving,
  savedVistoria,
  ecopontoForPdf,
}) {
  const conformidade = useMemo(() => calcularConformidade(form), [form])

  const onEcopontoChange = (id) => {
    const eco = ecopontos.find((e) => e.id === id)
    setForm({
      ...form,
      ecopontoId: id,
      ecopontoNome: eco?.nome || '',
      contato: eco?.contato || form.contato,
      inaugurado: eco?.inaugurado === true,
      epi: eco?.epi === true,
      horarioFuncionamento: eco?.horario || form.horarioFuncionamento,
    })
  }

  const setEstrutura = (key, val) => setForm({ ...form, estrutura: { ...form.estrutura, [key]: val } })
  const setResiduos = (key, val) => setForm({ ...form, residuos: { ...form.residuos, [key]: val } })
  const setComunicacao = (key, val) => setForm({ ...form, comunicacaoVisual: { ...form.comunicacaoVisual, [key]: val } })

  const handleExport = () => {
    const v = { ...form, conformidade }
    const eco = ecopontoForPdf || ecopontos.find((e) => e.id === form.ecopontoId)
    exportarLaudoPDF(v, eco)
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="bg-primary/10 border-b px-6 py-4">
        <h2 className="text-lg font-bold text-gray-800">Checklist de Vistoria</h2>
        <p className="text-sm text-gray-500">Prefeitura de Osasco — Ecopontos / PEVs / Cooperativas</p>
      </div>

      <div className="p-6 space-y-6 max-w-4xl">
        <section className="border rounded-xl p-4 bg-gray-50/50">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">Cabeçalho</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Ecoponto *</label>
              <select
                value={form.ecopontoId}
                onChange={(e) => onEcopontoChange(e.target.value)}
                disabled={disabled}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
              >
                <option value="">Selecione o ecoponto</option>
                {ecopontos.filter((e) => e.ativo !== false).map((e) => (
                  <option key={e.id} value={e.id}>{e.nome} — {e.tipo}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Data da visita *</label>
              <input type="date" value={form.dataVisita?.slice?.(0, 10) || form.dataVisita} onChange={(e) => setForm({ ...form, dataVisita: e.target.value })} disabled={disabled} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Hora da visita</label>
              <input value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} disabled={disabled} placeholder="Ex: 14:30" className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Funcionário (fiscal) *</label>
              <input value={form.fiscal} onChange={(e) => setForm({ ...form, fiscal: e.target.value })} disabled={disabled} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Contato</label>
              <input value={form.contato} onChange={(e) => setForm({ ...form, contato: e.target.value })} disabled={disabled} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Inauguração</label>
              <select value={form.inaugurado ? 'sim' : 'nao'} onChange={(e) => setForm({ ...form, inaugurado: e.target.value === 'sim' })} disabled={disabled} className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">EPI</label>
              <select value={form.epi ? 'sim' : 'nao'} onChange={(e) => setForm({ ...form, epi: e.target.value === 'sim' })} disabled={disabled} className="w-full border rounded-lg px-3 py-2 text-sm mt-1">
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">OBS</label>
              <textarea value={form.obs || ''} onChange={(e) => setForm({ ...form, obs: e.target.value })} disabled={disabled} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
            </div>
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide border-b pb-2">Equipamentos</h3>
          <ItemCheck label="Equipamentos gerais" value={form.equipamentos} onChange={(v) => setForm({ ...form, equipamentos: v })} disabled={disabled} />
        </section>

        <section>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide border-b pb-2">Estrutura</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(ESTRUTURA_LABELS).map(([key, label]) => (
              <ItemCheck key={key} label={label} value={form.estrutura?.[key]} onChange={(v) => setEstrutura(key, v)} disabled={disabled} />
            ))}
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide border-b pb-2">Tipos de resíduos</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(RESIDUOS_LABELS).map(([key, label]) => (
              <ItemCheck key={key} label={label} value={form.residuos?.[key]} onChange={(v) => setResiduos(key, v)} tipo="presenca" disabled={disabled} />
            ))}
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide border-b pb-2">Comunicação visual</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(COMUNICACAO_LABELS).map(([key, label]) => (
              <ItemCheck key={key} label={label} value={form.comunicacaoVisual?.[key]} onChange={(v) => setComunicacao(key, v)} disabled={disabled} />
            ))}
          </div>
        </section>

        <section className="border-t pt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Horário de funcionamento</label>
            <input value={form.horarioFuncionamento} onChange={(e) => setForm({ ...form, horarioFuncionamento: e.target.value })} disabled={disabled} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Problema mais frequente</label>
            <textarea value={form.problemaMaisFrequente} onChange={(e) => setForm({ ...form, problemaMaisFrequente: e.target.value })} disabled={disabled} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2">Fotos (máximo 5)</label>
            <PhotoUpload fotos={form.fotos} onChange={(fotos) => setForm({ ...form, fotos })} disabled={disabled} maxPhotos={5} />
          </div>

          <div className="rounded-xl bg-primary-light/40 border border-primary/20 p-4 text-center">
            <p className="text-sm text-gray-600">Percentual de conformidade</p>
            <p className="text-4xl font-bold text-primary mt-1">{conformidade}%</p>
            <p className="text-xs text-gray-500 mt-1">Estrutura + Comunicação visual (itens &quot;Bom&quot;)</p>
          </div>

          {!disabled && (
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => onSave(conformidade)} disabled={saving || !form.ecopontoId} className="flex-1 min-w-[200px] py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50">
                {saving ? 'Salvando...' : 'Salvar vistoria'}
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={!savedVistoria && !form.ecopontoId}
                className="px-6 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary-light disabled:opacity-50"
                title={savedVistoria ? 'Exportar última vistoria salva' : 'Salve antes ou preencha o formulário'}
              >
                Exportar laudo PDF
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
