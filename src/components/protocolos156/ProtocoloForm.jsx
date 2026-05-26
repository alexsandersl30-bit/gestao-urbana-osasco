import { useState } from 'react'
import PhotoUpload from '../PhotoUpload'
import { TIPOS, STATUS_STORED, emptyProtocolo, validateProtocoloForm } from '../../utils/protocolos156'

export default function ProtocoloForm({ initial, onSave, onCancel, disabled }) {
  const [form, setForm] = useState(initial ? { ...emptyProtocolo, ...initial } : { ...emptyProtocolo, dataAbertura: new Date().toISOString().slice(0, 10) })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validateProtocoloForm(form)
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    try {
      await onSave({
        numero: form.numero.trim(),
        tipo: form.tipo,
        endereco: form.endereco.trim(),
        bairro: form.bairro.trim(),
        dataAbertura: new Date(form.dataAbertura).toISOString(),
        prazo: new Date(form.prazo).toISOString(),
        responsavel: form.responsavel.trim(),
        status: form.status,
        descricao: form.descricao?.trim() || '',
        fotos: form.fotos || [],
        dataConclusao: form.dataConclusao || null,
        historicoStatus: form.historicoStatus || [],
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
        {field('numero', 'Número do protocolo *', (
          <input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} disabled={disabled} className="w-full border rounded-lg px-3 py-2 text-sm" />
        ))}
        {field('tipo', 'Tipo *', (
          <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} disabled={disabled} className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="">Selecione</option>
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
        {field('dataAbertura', 'Data de abertura *', (
          <input type="date" value={form.dataAbertura?.slice?.(0, 10) || form.dataAbertura} onChange={(e) => setForm({ ...form, dataAbertura: e.target.value })} disabled={disabled} className="w-full border rounded-lg px-3 py-2 text-sm" />
        ))}
        {field('prazo', 'Prazo de atendimento *', (
          <input type="date" value={form.prazo?.slice?.(0, 10) || form.prazo} onChange={(e) => setForm({ ...form, prazo: e.target.value })} disabled={disabled} className="w-full border rounded-lg px-3 py-2 text-sm" />
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {field('responsavel', 'Responsável *', (
          <input value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} disabled={disabled} className="w-full border rounded-lg px-3 py-2 text-sm" />
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} disabled={disabled} className="w-full border rounded-lg px-3 py-2 text-sm">
            {STATUS_STORED.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} disabled={disabled} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Fotos (máximo 3)</label>
        <PhotoUpload fotos={form.fotos} onChange={(fotos) => setForm({ ...form, fotos })} disabled={disabled} maxPhotos={3} />
      </div>
      {!disabled && (
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium disabled:opacity-60">
            {saving ? 'Salvando...' : initial?.id ? 'Atualizar' : 'Cadastrar protocolo'}
          </button>
          {onCancel && <button type="button" onClick={onCancel} className="px-6 py-2.5 border rounded-lg text-gray-600">Cancelar</button>}
        </div>
      )}
    </form>
  )
}
