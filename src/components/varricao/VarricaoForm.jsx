import { useState } from 'react'
import PhotoUpload from '../PhotoUpload'
import {
  FREQUENCIAS, PLANOS, emptyRua, normalizePlano, validateVarricaoForm, kmValue,
} from '../../utils/varricao'

export default function VarricaoForm({ initial, onSave, onCancel, disabled }) {
  const base = initial
    ? { ...emptyRua, ...initial, plano: normalizePlano(initial.plano) }
    : { ...emptyRua }

  const [form, setForm] = useState(base)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validateVarricaoForm(form)
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    try {
      await onSave({
        rua: form.rua.trim(),
        bairro: form.bairro.trim(),
        frequencia: form.frequencia,
        plano: normalizePlano(form.plano),
        quilometragem: kmValue(form.quilometragem),
        equipe: form.equipe.trim(),
        horario: form.horario.trim(),
        metaMensal: Number(form.metaMensal),
        fotos: form.fotos || [],
        ativa: form.ativa !== false,
        ultimaVarricao: form.ultimaVarricao || null,
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
      {field('rua', 'Nome da rua/trecho *', (
        <input value={form.rua} onChange={(e) => setForm({ ...form, rua: e.target.value })} disabled={disabled} className="w-full border rounded-lg px-3 py-2 text-sm" />
      ))}

      <div className="grid md:grid-cols-2 gap-4">
        {field('bairro', 'Bairro *', (
          <input value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} disabled={disabled} className="w-full border rounded-lg px-3 py-2 text-sm" />
        ))}
        {field('frequencia', 'Frequência *', (
          <select value={form.frequencia} onChange={(e) => setForm({ ...form, frequencia: e.target.value })} disabled={disabled} className="w-full border rounded-lg px-3 py-2 text-sm">
            {FREQUENCIAS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {field('plano', 'Plano de cor *', (
          <select value={form.plano} onChange={(e) => setForm({ ...form, plano: e.target.value })} disabled={disabled} className="w-full border rounded-lg px-3 py-2 text-sm">
            {PLANOS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        ))}
        {field('quilometragem', 'Quilometragem (km) *', (
          <input type="number" step="0.1" min="0.1" value={form.quilometragem} onChange={(e) => setForm({ ...form, quilometragem: e.target.value })} disabled={disabled} className="w-full border rounded-lg px-3 py-2 text-sm" />
        ))}
        {field('metaMensal', 'Meta mensal (km) *', (
          <input type="number" step="0.1" min="0.1" value={form.metaMensal} onChange={(e) => setForm({ ...form, metaMensal: e.target.value })} disabled={disabled} className="w-full border rounded-lg px-3 py-2 text-sm" />
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {field('equipe', 'Equipe responsável *', (
          <input value={form.equipe} onChange={(e) => setForm({ ...form, equipe: e.target.value })} disabled={disabled} className="w-full border rounded-lg px-3 py-2 text-sm" />
        ))}
        {field('horario', 'Horário de início *', (
          <input value={form.horario} onChange={(e) => setForm({ ...form, horario: e.target.value })} disabled={disabled} placeholder="Ex: 06:00" className="w-full border rounded-lg px-3 py-2 text-sm" />
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Fotos do trecho (máximo 5)</label>
        <PhotoUpload fotos={form.fotos} onChange={(fotos) => setForm({ ...form, fotos })} disabled={disabled} maxPhotos={5} />
      </div>

      {!disabled && (
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60">
            {saving ? 'Salvando...' : initial?.id ? 'Atualizar rua' : 'Cadastrar rua'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="bg-white hover:bg-gray-50 text-gray-700 font-medium px-6 py-2.5 rounded-lg text-sm border border-gray-200 transition-colors">Cancelar</button>
          )}
        </div>
      )}
    </form>
  )
}
