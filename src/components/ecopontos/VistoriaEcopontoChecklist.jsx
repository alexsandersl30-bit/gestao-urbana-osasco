import { useMemo } from 'react'
import PhotoUpload from '../PhotoUpload'
import { ItemCheck } from '../ChecklistField'
import { exportarLaudoPDF } from '../../utils/pdfLaudo'
import {
  ECOPONTO_OPERACAO_LABELS,
  ECOPONTO_INFRAESTRUTURA_LABELS,
  ECOPONTO_SEGREGACAO_LABELS,
  ECOPONTO_CONDICIONAMENTO_LABELS,
  ECOPONTO_COLETA_LABELS,
  ECOPONTO_IRREGULARIDADES_LABELS,
  ECOPONTO_SEGURANCA_LABELS,
  ECOPONTO_FUNCIONAMENTO_LABELS,
} from './checklistLabels'

// labels and factory functions moved to ./checklistLabels

export default function VistoriaEcopontoChecklist({
  form,
  setForm,
  ecopontos,
  disabled,
  onSave,
  saving,
  savedVistoria,
  ecopontoForPdf,
}) {
  const conformidade = useMemo(() => {
    // Calcula conformidade baseado nos itens "Bom"
    let itens = 0
    let bom = 0
    const sections = [
      form.operacao,
      form.infraestrutura,
      form.segregacao,
      form.condicionamento,
      form.coleta,
      form.irregularidades,
      form.seguranca,
      form.funcionamento,
    ]
    sections.forEach((section) => {
      Object.values(section).forEach((item) => {
        if (item.condicao) {
          itens++
          if (item.condicao === 'Bom' || item.condicao === 'Adequado') bom++
        }
      })
    })
    return itens > 0 ? Math.round((bom / itens) * 100) : 0
  }, [form])

  const onEcopontoChange = (id) => {
    const eco = ecopontos.find((e) => e.id === id)
    setForm({
      ...form,
      ecopontoId: id,
      ecopontoNome: eco?.nome || '',
      contato: eco?.contato || form.contato,
    })
  }

  const handleExport = () => {
    const v = { ...form, conformidade }
    const eco = ecopontoForPdf || ecopontos.find((e) => e.id === form.ecopontoId)
    exportarLaudoPDF(v, eco)
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="bg-green-100 border-b px-6 py-4">
        <h2 className="text-lg font-bold text-gray-800">Checklist de Vistoria - Ecoponto</h2>
        <p className="text-sm text-gray-500">Prefeitura de Osasco — Pontos de Entrega</p>
      </div>

      <div className="p-6 space-y-6 max-w-4xl">
        {/* Cabeçalho */}
        <section className="border rounded-xl p-4 bg-gray-50/50">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">Identificação da Vistoria</h3>
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
                {ecopontos
                  .filter((e) => e.ativo !== false && e.tipo === 'Ecoponto')
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nome}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Data da visita *</label>
              <input
                type="date"
                value={form.dataVisita?.slice?.(0, 10) || form.dataVisita}
                onChange={(e) => setForm({ ...form, dataVisita: e.target.value })}
                disabled={disabled}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Hora da visita</label>
              <input
                type="time"
                value={form.horario}
                onChange={(e) => setForm({ ...form, horario: e.target.value })}
                disabled={disabled}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Fiscal responsável *</label>
              <input
                value={form.fiscal}
                onChange={(e) => setForm({ ...form, fiscal: e.target.value })}
                disabled={disabled}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Contato</label>
              <input
                value={form.contato}
                onChange={(e) => setForm({ ...form, contato: e.target.value })}
                disabled={disabled}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">OBS</label>
              <textarea
                value={form.obs || ''}
                onChange={(e) => setForm({ ...form, obs: e.target.value })}
                disabled={disabled}
                rows={2}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
              />
            </div>
          </div>
        </section>

        {/* Operação */}
        <section>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide border-b pb-2">Operação</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(ECOPONTO_OPERACAO_LABELS).map(([key, label]) => (
              <ItemCheck
                key={key}
                label={label}
                value={form.operacao?.[key]}
                onChange={(v) => setForm({ ...form, operacao: { ...form.operacao, [key]: v } })}
                disabled={disabled}
              />
            ))}
          </div>
        </section>

        {/* Infraestrutura */}
        <section>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide border-b pb-2">Infraestrutura</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(ECOPONTO_INFRAESTRUTURA_LABELS).map(([key, label]) => (
              <ItemCheck
                key={key}
                label={label}
                value={form.infraestrutura?.[key]}
                onChange={(v) => setForm({ ...form, infraestrutura: { ...form.infraestrutura, [key]: v } })}
                disabled={disabled}
              />
            ))}
          </div>
        </section>

        {/* Segregação dos Resíduos */}
        <section>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide border-b pb-2">Segregação dos Resíduos</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(ECOPONTO_SEGREGACAO_LABELS).map(([key, label]) => (
              <ItemCheck
                key={key}
                label={label}
                value={form.segregacao?.[key]}
                onChange={(v) => setForm({ ...form, segregacao: { ...form.segregacao, [key]: v } })}
                disabled={disabled}
              />
            ))}
          </div>
        </section>

        {/* Condicionamento */}
        <section>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide border-b pb-2">Condicionamento</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(ECOPONTO_CONDICIONAMENTO_LABELS).map(([key, label]) => (
              <ItemCheck
                key={key}
                label={label}
                value={form.condicionamento?.[key]}
                onChange={(v) => setForm({ ...form, condicionamento: { ...form.condicionamento, [key]: v } })}
                disabled={disabled}
              />
            ))}
          </div>
        </section>

        {/* Coleta e Destinação */}
        <section>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide border-b pb-2">Coleta e Destinação</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(ECOPONTO_COLETA_LABELS).map(([key, label]) => (
              <ItemCheck
                key={key}
                label={label}
                value={form.coleta?.[key]}
                onChange={(v) => setForm({ ...form, coleta: { ...form.coleta, [key]: v } })}
                tipo="presenca"
                disabled={disabled}
              />
            ))}
          </div>
        </section>

        {/* Irregularidades */}
        <section>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide border-b pb-2">Irregularidades</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(ECOPONTO_IRREGULARIDADES_LABELS).map(([key, label]) => (
              <ItemCheck
                key={key}
                label={label}
                value={form.irregularidades?.[key]}
                onChange={(v) => setForm({ ...form, irregularidades: { ...form.irregularidades, [key]: v } })}
                disabled={disabled}
              />
            ))}
          </div>
        </section>

        {/* Segurança e Impacto */}
        <section>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide border-b pb-2">Segurança e Impacto</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(ECOPONTO_SEGURANCA_LABELS).map(([key, label]) => (
              <ItemCheck
                key={key}
                label={label}
                value={form.seguranca?.[key]}
                onChange={(v) => setForm({ ...form, seguranca: { ...form.seguranca, [key]: v } })}
                disabled={disabled}
              />
            ))}
          </div>
        </section>

        {/* Funcionamento */}
        <section>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide border-b pb-2">Funcionamento / Equipamento</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(ECOPONTO_FUNCIONAMENTO_LABELS).map(([key, label]) => (
              <ItemCheck
                key={key}
                label={label}
                value={form.funcionamento?.[key]}
                onChange={(v) => setForm({ ...form, funcionamento: { ...form.funcionamento, [key]: v } })}
                disabled={disabled}
              />
            ))}
          </div>
        </section>

        {/* Classificação Final */}
        <section className="border-t pt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Classificação final *</label>
            <select
              value={form.classificacaoFinal || ''}
              onChange={(e) => setForm({ ...form, classificacaoFinal: e.target.value })}
              disabled={disabled}
              className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
            >
              <option value="">Selecione</option>
              <option value="Adequado">Adequado</option>
              <option value="Atenção">Atenção</option>
              <option value="Crítico">Crítico</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2">Fotos (máximo 5)</label>
            <PhotoUpload fotos={form.fotos} onChange={(fotos) => setForm({ ...form, fotos })} disabled={disabled} maxPhotos={5} />
          </div>

          <div className="rounded-xl bg-green-100 border border-green-200 p-4 text-center">
            <p className="text-sm text-gray-600">Percentual de conformidade</p>
            <p className="text-4xl font-bold text-green-600 mt-1">{conformidade}%</p>
            <p className="text-xs text-gray-500 mt-1">Baseado em itens &quot;Bom&quot; e &quot;Adequado&quot;</p>
          </div>

          {!disabled && (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onSave(conformidade)}
                disabled={saving || !form.ecopontoId}
                className="flex-1 min-w-[200px] bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar vistoria'}
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={!savedVistoria && !form.ecopontoId}
                className="bg-white hover:bg-gray-50 text-gray-700 font-medium px-6 py-3 rounded-lg border border-gray-200 transition-colors disabled:opacity-50"
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
