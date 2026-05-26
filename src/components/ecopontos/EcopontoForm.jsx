import { useState } from 'react'
import PhotoUpload from '../PhotoUpload'
import { TIPOS, emptyEcoponto, validateEcopontoForm } from '../../utils/ecopontos'

export default function EcopontoForm({ initial, onSave, onCancel, disabled }) {
  const normalize = (e) => ({
    ...emptyEcoponto,
    ...e,
    inaugurado: e?.inaugurado === true || e?.inaugurado === 'true' || e?.inaugurado === 'sim',
    epi: e?.epi === true || e?.epi === 'true' || e?.epi === 'sim',
  })
  const [form, setForm] = useState(initial ? normalize(initial) : { ...emptyEcoponto })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validateEcopontoForm(form)
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    try {
      await onSave({
        nome: form.nome.trim(),
        tipo: form.tipo,
        endereco: form.endereco.trim(),
        bairro: form.bairro.trim(),
        inaugurado: !!form.inaugurado,
        epi: !!form.epi,
        horario: form.horario.trim(),
        contato: form.contato.trim(),
        coordenadas: form.coordenadas?.trim() || '',
        fotos: form.fotos || [],
        ativo: form.ativo !== false,
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
      <div className="grid md:grid-cols-2 gap-4">
        {field('nome', 'Nome *', (
          <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} disabled={disabled} className="w-full border rounded-lg px-3 py-2 text-sm" />
        ))}
        {field('tipo', 'Tipo *', (
          <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} disabled={disabled} className="w-full border rounded-lg px-3 py-2 text-sm">
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        ))}
      </div>
      {field('endereco', 'Endereço *', (
        <input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} disabled={disabled} className="w-full border rounded-lg px-3 py-2 text-sm" />
      ))}
      {field('bairro', 'Bairro *', (
        <input value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} disabled={disabled} className="w-full border rounded-lg px-3 py-2 text-sm" />
      ))}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Inaugurado</label>
          <select value={form.inaugurado ? 'sim' : 'nao'} onChange={(e) => setForm({ ...form, inaugurado: e.target.value === 'sim' })} disabled={disabled} className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">EPI</label>
          <select value={form.epi ? 'sim' : 'nao'} onChange={(e) => setForm({ ...form, epi: e.target.value === 'sim' })} disabled={disabled} className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="sim">Sim</option>
            <option value="nao">Não</option>
          </select>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {field('horario', 'Horário de funcionamento *', (
          <input value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} disabled={disabled} className="w-full border rounded-lg px-3 py-2 text-sm" />
        ))}
        {field('contato', 'Contato *', (
          <input value={form.contato} onChange={(e) => setForm({ ...form, contato: e.target.value })} disabled={disabled} className="w-full border rounded-lg px-3 py-2 text-sm" />
        ))}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Coordenadas (lat, lng)</label>
        <input value={form.coordenadas} onChange={(e) => setForm({ ...form, coordenadas: e.target.value })} disabled={disabled} className="w-full border rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Fotos (máximo 5)</label>
        <PhotoUpload fotos={form.fotos} onChange={(fotos) => setForm({ ...form, fotos })} disabled={disabled} maxPhotos={5} />
      </div>
      {!disabled && (
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-60">
            {saving ? 'Salvando...' : initial?.id ? 'Atualizar' : 'Cadastrar ecoponto'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="px-6 py-2.5 border rounded-lg text-gray-600 hover:bg-gray-50">Cancelar</button>
          )}
        </div>
      )}
    </form>
  )
}
