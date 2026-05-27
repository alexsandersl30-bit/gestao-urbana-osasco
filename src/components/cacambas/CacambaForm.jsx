import { useState } from 'react'
import PhotoUpload from '../PhotoUpload'
import { FREQUENCIAS, emptyCacamba, validateCacambaForm } from '../../utils/cacambas'

export default function CacambaForm({ initial, onSave, onCancel, disabled }) {
  const base = initial ? { ...emptyCacamba, ...initial } : { ...emptyCacamba }
  const [form, setForm] = useState(base)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validateCacambaForm(form)
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    try {
      await onSave({
        endereco: form.endereco.trim(),
        bairro: form.bairro.trim(),
        frequencia: form.frequencia,
        empresa: form.empresa.trim(),
        capacidade: Number(form.capacidade),
        fotos: form.fotos || [],
        ultimaColeta: form.ultimaColeta || null,
        ativa: form.ativa !== false,
        historicoColetas: form.historicoColetas || [],
      })
    } finally {
      setSaving(false)
    }
  }

  const field = (name, label, children) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {errors[name] && <p className="text-xs text-red-600 mt-1">{errors[name]}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
      {field('endereco', 'Endereço completo *', (
        <input
          value={form.endereco}
          onChange={(e) => setForm({ ...form, endereco: e.target.value })}
          disabled={disabled}
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Rua, número, referência"
        />
      ))}

      <div className="grid md:grid-cols-2 gap-4">
        {field('bairro', 'Bairro *', (
          <input
            value={form.bairro}
            onChange={(e) => setForm({ ...form, bairro: e.target.value })}
            disabled={disabled}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        ))}
        {field('frequencia', 'Frequência de coleta *', (
          <select
            value={form.frequencia}
            onChange={(e) => setForm({ ...form, frequencia: e.target.value })}
            disabled={disabled}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            {FREQUENCIAS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {field('empresa', 'Empresa responsável *', (
          <input
            value={form.empresa}
            onChange={(e) => setForm({ ...form, empresa: e.target.value })}
            disabled={disabled}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        ))}
        {field('capacidade', 'Capacidade (m³) *', (
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={form.capacidade}
            onChange={(e) => setForm({ ...form, capacidade: e.target.value })}
            disabled={disabled}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="Ex: 5"
          />
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Fotos (máximo 5)</label>
        <PhotoUpload
          fotos={form.fotos}
          onChange={(fotos) => setForm({ ...form, fotos })}
          disabled={disabled}
          maxPhotos={5}
        />
      </div>

      {!disabled && (
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            {saving ? 'Salvando...' : initial?.id ? 'Atualizar caçamba' : 'Cadastrar caçamba'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="bg-white hover:bg-gray-50 text-gray-700 font-medium px-6 py-2.5 rounded-lg text-sm border border-gray-200 transition-colors">
              Cancelar
            </button>
          )}
        </div>
      )}
    </form>
  )
}
