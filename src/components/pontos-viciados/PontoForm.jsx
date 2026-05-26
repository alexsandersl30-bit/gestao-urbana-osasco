import { useState } from 'react'
import PhotoUpload from '../PhotoUpload'
import {
  FREQUENCIAS, CRITICIDADES, DIAS_SEMANA, emptyPonto,
  diasSemanaToArray, diasSemanaToString, validatePontoForm,
} from '../../utils/pontosViciados'

export default function PontoForm({ initial, onSave, onCancel, disabled }) {
  const base = initial
    ? {
        ...emptyPonto,
        ...initial,
        diasSemanaArr: diasSemanaToArray(initial.diasSemana),
      }
    : { ...emptyPonto }

  const [form, setForm] = useState(base)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const toggleDia = (dia) => {
    const arr = form.diasSemanaArr.includes(dia)
      ? form.diasSemanaArr.filter((d) => d !== dia)
      : [...form.diasSemanaArr, dia]
    setForm({ ...form, diasSemanaArr: arr, diasSemana: arr.join(', ') })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validatePontoForm(form)
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    try {
      await onSave({
        endereco: form.endereco.trim(),
        bairro: form.bairro.trim(),
        frequencia: form.frequencia,
        diasSemana: diasSemanaToString(form.diasSemanaArr),
        responsavel: form.responsavel.trim(),
        criticidade: form.criticidade,
        descricao: form.descricao?.trim() || '',
        fotos: form.fotos || [],
        denuncias: Number(form.denuncias) || 0,
        status: form.status || 'Ativo',
        ultimoAtendimento: form.ultimoAtendimento || null,
        historicoAtendimentos: form.historicoAtendimentos || [],
        historicoDenuncias: form.historicoDenuncias || [],
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
        {field('frequencia', 'Frequência de limpeza *', (
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Dias da semana</label>
        <div className="flex flex-wrap gap-2">
          {DIAS_SEMANA.map((d) => (
            <button
              key={d}
              type="button"
              disabled={disabled}
              onClick={() => toggleDia(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                form.diasSemanaArr.includes(d)
                  ? 'bg-primary text-white border-primary'
                  : 'border-gray-300 text-gray-600 hover:border-primary'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {field('responsavel', 'Responsável *', (
          <input
            value={form.responsavel}
            onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
            disabled={disabled}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        ))}
        {field('criticidade', 'Criticidade *', (
          <select
            value={form.criticidade}
            onChange={(e) => setForm({ ...form, criticidade: e.target.value })}
            disabled={disabled}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            {CRITICIDADES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do problema</label>
        <textarea
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          disabled={disabled}
          rows={3}
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Descreva o problema identificado no local"
        />
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
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? 'Salvando...' : initial?.id ? 'Atualizar ponto' : 'Cadastrar ponto'}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} className="px-6 py-2.5 border rounded-lg text-gray-600 hover:bg-gray-50">
              Cancelar
            </button>
          )}
        </div>
      )}
    </form>
  )
}
