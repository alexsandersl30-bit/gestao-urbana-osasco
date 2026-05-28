import { useMemo, useState } from 'react'
import PhotoUpload from '../PhotoUpload'
import { calcularConformidadeCacamba, CRITERIOS_VISTORIA } from '../../utils/vistoriaCacambas'

export default function VistoriaCacambaForm({
  form,
  setForm,
  cacambas,
  disabled,
  onSave,
  saving,
}) {
  const [showCriterion, setShowCriterion] = useState(null)

  const conformidade = useMemo(() => calcularConformidadeCacamba(form), [form])

  const handleCacambaChange = (cacambaId) => {
    const cacamba = cacambas.find((c) => c.id === cacambaId)
    setForm({
      ...form,
      cacambaId,
      cacambaEndereco: cacamba?.endereco || '',
      cacambaBairro: cacamba?.bairro || '',
    })
  }

  const handleSave = () => {
    if (!form.cacambaId || !form.fiscal?.trim()) {
      alert('Selecione a caçamba e informe o fiscal.')
      return
    }
    onSave({ ...form, conformidade })
  }

  const getConformidadeColor = () => {
    if (conformidade >= 80) return 'from-green-100 to-green-50'
    if (conformidade >= 60) return 'from-yellow-100 to-yellow-50'
    return 'from-red-100 to-red-50'
  }

  const getConformidadePercentColor = () => {
    if (conformidade >= 80) return 'text-green-700'
    if (conformidade >= 60) return 'text-amber-700'
    return 'text-red-700'
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="bg-blue-100 border-b px-6 py-4">
        <h2 className="text-lg font-bold text-gray-800">Nova Vistoria — Caçamba</h2>
        <p className="text-sm text-gray-500">Avaliação de condições e critérios</p>
      </div>

      <div className="p-6 space-y-6 max-w-4xl">
        {/* Cabeçalho */}
        <section className="border rounded-xl p-4 bg-gray-50/50">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">Identificação da Vistoria</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Caçamba *</label>
              <select
                value={form.cacambaId}
                onChange={(e) => handleCacambaChange(e.target.value)}
                disabled={disabled}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
              >
                <option value="">Selecione a caçamba</option>
                {cacambas
                  .filter((c) => c.ativa !== false)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.endereco} — {c.bairro}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Fiscal / Funcionário *</label>
              <input
                value={form.fiscal}
                onChange={(e) => setForm({ ...form, fiscal: e.target.value })}
                disabled={disabled}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
              />
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
              <label className="text-sm font-medium text-gray-700">Horário</label>
              <input
                type="time"
                value={form.horario}
                onChange={(e) => setForm({ ...form, horario: e.target.value })}
                disabled={disabled}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
              />
            </div>
          </div>
        </section>

        {/* Conformidade em tempo real */}
        <section className={`bg-gradient-to-r ${getConformidadeColor()} border rounded-xl p-4`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Conformidade</h3>
            <div className="text-right">
              <p className={`text-3xl font-bold ${getConformidadePercentColor()}`}>{conformidade}%</p>
              <p className="text-xs text-gray-600 mt-1">
                {conformidade >= 80
                  ? 'Excelente'
                  : conformidade >= 60
                    ? 'Moderado'
                    : 'Requer atenção'}
              </p>
            </div>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                conformidade >= 80
                  ? 'bg-green-600'
                  : conformidade >= 60
                    ? 'bg-amber-500'
                    : 'bg-red-600'
              }`}
              style={{ width: `${conformidade}%` }}
            />
          </div>
        </section>

        {/* Critérios de avaliação */}
        <section>
          <h3 className="font-semibold text-gray-800 mb-4 text-sm uppercase tracking-wide border-b pb-2">
            Critérios de Avaliação
          </h3>
          <div className="space-y-4">
            {CRITERIOS_VISTORIA.map((criterio) => {
              const value = form[criterio.id]
              return (
                <div key={criterio.id} className="border rounded-lg p-4 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setShowCriterion(showCriterion === criterio.id ? null : criterio.id)}
                    className="w-full text-left flex items-start justify-between hover:bg-white transition"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{criterio.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{criterio.descricao}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <p className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {value?.condicao || '—'}
                      </p>
                    </div>
                  </button>

                  {showCriterion === criterio.id && (
                    <div className="mt-4 space-y-3 border-t pt-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Condição</label>
                        <select
                          value={value?.condicao || ''}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              [criterio.id]: { ...value, condicao: e.target.value },
                            })
                          }
                          disabled={disabled}
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                        >
                          <option value="">Selecione</option>
                          {criterio.opcoes.map((op) => (
                            <option key={op} value={op}>
                              {op}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Observações</label>
                        <textarea
                          value={value?.obs || ''}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              [criterio.id]: { ...value, obs: e.target.value },
                            })
                          }
                          disabled={disabled}
                          rows={2}
                          placeholder="Descreva a situação..."
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Problema mais frequente */}
        <section>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Problema mais frequente</label>
          <textarea
            value={form.problemaMaisFrequente || ''}
            onChange={(e) => setForm({ ...form, problemaMaisFrequente: e.target.value })}
            disabled={disabled}
            rows={3}
            placeholder="Descreva o problema mais frequente encontrado..."
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </section>

        {/* Upload de fotos */}
        <section>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">Registro Fotográfico (até 5)</h3>
          <PhotoUpload
            fotos={form.fotos || []}
            onChange={(fotos) => setForm({ ...form, fotos })}
            maxFotos={5}
            disabled={disabled}
          />
        </section>

        {/* Botões */}
        <div className="flex gap-3 border-t pt-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || disabled}
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            {saving ? 'Salvando...' : 'Salvar Vistoria'}
          </button>
          <button
            type="button"
            onClick={() => setForm({})}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-6 py-2 rounded-lg text-sm transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
