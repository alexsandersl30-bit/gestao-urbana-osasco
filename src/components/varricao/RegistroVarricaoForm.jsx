import { useState } from 'react'
import PhotoUpload from '../PhotoUpload'
import Modal from '../Modal'
import { emptyRegistroVarricao, validateRegistroVarricao } from '../../utils/varricao'

export default function RegistroVarricaoForm({ open, onClose, onSave, rua, responsavelDefault }) {
  const [form, setForm] = useState({
    ...emptyRegistroVarricao,
    equipe: rua?.equipe || '',
    responsavel: responsavelDefault || '',
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validateRegistroVarricao(form)
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    try {
      await onSave({
        data: new Date(form.data).toISOString(),
        kmExecutado: Number(form.kmExecutado),
        equipe: form.equipe.trim(),
        responsavel: form.responsavel.trim(),
        observacao: form.observacao?.trim() || '',
        fotos: form.fotos || [],
      })
      setForm({ ...emptyRegistroVarricao, equipe: rua?.equipe || '', responsavel: responsavelDefault || '' })
      onClose()
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
    <Modal open={open} onClose={onClose} title="Registrar varrição" wide>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-500">{rua?.rua} — {rua?.bairro}</p>
        <div className="grid md:grid-cols-2 gap-4">
          {field('data', 'Data da varrição *', (
            <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
          ))}
          {field('kmExecutado', 'Km executado *', (
            <input type="number" step="0.1" min="0.1" value={form.kmExecutado} onChange={(e) => setForm({ ...form, kmExecutado: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
          ))}
          {field('equipe', 'Equipe *', (
            <input value={form.equipe} onChange={(e) => setForm({ ...form, equipe: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
          ))}
          {field('responsavel', 'Responsável *', (
            <input value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" />
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
          <textarea value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fotos (antes/depois, máx. 5)</label>
          <PhotoUpload fotos={form.fotos} onChange={(fotos) => setForm({ ...form, fotos })} maxPhotos={5} />
        </div>
        <button type="submit" disabled={saving} className="w-full bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-60">
          {saving ? 'Salvando...' : 'Salvar varrição'}
        </button>
      </form>
    </Modal>
  )
}
