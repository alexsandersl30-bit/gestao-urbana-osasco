import { daysSince } from './dates'

export const FREQUENCIAS = ['Diária', '3x/semana', '2x/semana', 'Semanal', 'Quinzenal']
export const PLANOS = ['Verde', 'Azul', 'Laranja']
export const STATUS_VARRICAO = ['Em dia', 'Atenção', 'Atrasada']

const FREQ_DAYS = {
  Diária: 1,
  '3x/semana': 2,
  '2x/semana': 3,
  Semanal: 7,
  Quinzenal: 14,
}

export const PLANO_STYLES = {
  Verde: { badge: 'bg-[#DCFCE7] text-[#15803D] border-[#bbf7d0]', hex: '#22c55e' },
  Azul: { badge: 'bg-[#DBEAFE] text-[#1E40AF] border-[#bfdbfe]', hex: '#3b82f6' },
  Laranja: { badge: 'bg-[#FEF9C3] text-[#854D0E] border-[#fef3c7]', hex: '#f97316' },
}

export const STATUS_BADGE = {
  'Em dia': 'bg-[#DCFCE7] text-[#15803D] border-[#bbf7d0]',
  Atenção: 'bg-[#FEF9C3] text-[#854D0E] border-[#fef3c7]',
  Atrasada: 'bg-[#FEE2E2] text-[#991B1B] border-[#fecaca]',
}

/** Retorna km numérico seguro (0 quando null/undefined/NaN). */
export function kmValue(value) {
  return Number(value) || 0
}

export function formatKm(value, decimals = 1) {
  return kmValue(value).toFixed(decimals)
}

export function normalizePlano(plano) {
  if (!plano) return 'Verde'
  const lower = String(plano).toLowerCase()
  if (lower === 'verde') return 'Verde'
  if (lower === 'azul') return 'Azul'
  if (lower === 'laranja') return 'Laranja'
  return plano
}

export function calcStatusVarricao(rua) {
  if (rua.ativa === false) return rua.status || 'Em dia'
  const limite = FREQ_DAYS[rua.frequencia] || 7
  if (!rua.ultimaVarricao) return 'Atrasada'
  const dias = daysSince(rua.ultimaVarricao)
  if (dias <= limite) return 'Em dia'
  if (dias <= limite + 2) return 'Atenção'
  return 'Atrasada'
}

export function isAtiva(rua) {
  return rua.ativa !== false
}

export function parseHistoricoData(entry) {
  const v = entry?.data
  if (!v) return null
  if (v?.toDate) return v.toDate()
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

export function isInMonth(isoOrDate, year, month) {
  const d = isoOrDate?.toDate ? isoOrDate.toDate() : new Date(isoOrDate)
  if (Number.isNaN(d.getTime())) return false
  return d.getFullYear() === year && d.getMonth() === month
}

export function kmHistoricoMes(historico, refDate = new Date()) {
  const y = refDate.getFullYear()
  const m = refDate.getMonth()
  return (historico || []).reduce((sum, h) => {
    if (isInMonth(h.data, y, m)) return sum + (Number(h.kmExecutado) || 0)
    return sum
  }, 0)
}

export function kmHistoricoTotal(historico) {
  return (historico || []).reduce((sum, h) => sum + (Number(h.kmExecutado) || 0), 0)
}

export function validateVarricaoForm(form) {
  const errors = {}
  if (!form.rua?.trim()) errors.rua = 'Rua/trecho é obrigatório'
  if (!form.bairro?.trim()) errors.bairro = 'Bairro é obrigatório'
  if (!form.frequencia) errors.frequencia = 'Frequência é obrigatória'
  if (!form.plano) errors.plano = 'Plano é obrigatório'
  const km = Number(form.quilometragem)
  if (!form.quilometragem && form.quilometragem !== 0) errors.quilometragem = 'Quilometragem é obrigatória'
  else if (Number.isNaN(km) || km <= 0) errors.quilometragem = 'Informe km válido'
  if (!form.equipe?.trim()) errors.equipe = 'Equipe é obrigatória'
  if (!form.horario?.trim()) errors.horario = 'Horário é obrigatório'
  const meta = Number(form.metaMensal)
  if (!form.metaMensal && form.metaMensal !== 0) errors.metaMensal = 'Meta mensal é obrigatória'
  else if (Number.isNaN(meta) || meta <= 0) errors.metaMensal = 'Informe meta válida em km'
  return errors
}

export function validateRegistroVarricao(form) {
  const errors = {}
  if (!form.data) errors.data = 'Data é obrigatória'
  const km = Number(form.kmExecutado)
  if (!form.kmExecutado && form.kmExecutado !== 0) errors.kmExecutado = 'Km executado é obrigatório'
  else if (Number.isNaN(km) || km <= 0) errors.kmExecutado = 'Informe km válido'
  if (!form.equipe?.trim()) errors.equipe = 'Equipe é obrigatória'
  if (!form.responsavel?.trim()) errors.responsavel = 'Responsável é obrigatório'
  return errors
}

export const emptyRua = {
  rua: '',
  bairro: '',
  frequencia: 'Diária',
  plano: 'Verde',
  quilometragem: '',
  equipe: '',
  horario: '',
  fotos: [],
  metaMensal: '',
  ultimaVarricao: null,
  ativa: true,
}

export const emptyRegistroVarricao = {
  data: new Date().toISOString().slice(0, 10),
  kmExecutado: '',
  equipe: '',
  responsavel: '',
  observacao: '',
  fotos: [],
}

export function calcMetaGlobalAtingida(ruas, historicoFlat) {
  const ativas = ruas.filter(isAtiva)
  const metaTotal = ativas.reduce((s, r) => s + (Number(r.metaMensal) || 0), 0)
  if (!metaTotal) return 0
  const now = new Date()
  const kmMes = historicoFlat
    .filter((h) => isInMonth(h.data, now.getFullYear(), now.getMonth()))
    .reduce((s, h) => s + (Number(h.kmExecutado) || 0), 0)
  return Math.min(100, Math.round((kmMes / metaTotal) * 100))
}

export function chartKmVsMetaBairro(ruas, historicoFlat) {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const map = {}

  ruas.filter(isAtiva).forEach((r) => {
    if (!r.bairro) return
    if (!map[r.bairro]) map[r.bairro] = { bairro: r.bairro, kmVarrido: 0, meta: 0 }
    map[r.bairro].meta += Number(r.metaMensal) || 0
  })

  historicoFlat.forEach((h) => {
    const rua = ruas.find((r) => r.id === h.varricaoId)
    if (!rua?.bairro || !isInMonth(h.data, y, m)) return
    if (!map[rua.bairro]) map[rua.bairro] = { bairro: rua.bairro, kmVarrido: 0, meta: 0 }
    map[rua.bairro].kmVarrido += Number(h.kmExecutado) || 0
  })

  return Object.values(map)
}

export function chartKmPorPlano(ruas, historicoFlat) {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  return PLANOS.map((plano) => {
    const ids = ruas.filter((r) => normalizePlano(r.plano) === plano).map((r) => r.id)
    const km = historicoFlat
      .filter((h) => ids.includes(h.varricaoId) && isInMonth(h.data, y, m))
      .reduce((s, h) => s + (Number(h.kmExecutado) || 0), 0)
    return { plano, km }
  })
}

export function chartEvolucao6Meses(historicoFlat) {
  const now = new Date()
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      year: d.getFullYear(),
      month: d.getMonth(),
      km: 0,
    })
  }

  historicoFlat.forEach((h) => {
    const date = parseHistoricoData(h)
    if (!date) return
    const key = `${date.getFullYear()}-${date.getMonth()}`
    const bucket = months.find((m) => m.key === key)
    if (bucket) bucket.km += Number(h.kmExecutado) || 0
  })

  return months.map(({ label, km }) => ({ mes: label, km: Math.round(km * 10) / 10 }))
}

export function resumoPorBairro(ruas, historicoFlat) {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  const map = {}

  ruas.forEach((r) => {
    if (!r.bairro) return
    if (!map[r.bairro]) {
      map[r.bairro] = { bairro: r.bairro, ruas: 0, kmTotal: 0, kmMes: 0, meta: 0 }
    }
    if (isAtiva(r)) map[r.bairro].ruas++
    map[r.bairro].kmTotal += kmValue(r.quilometragem)
    map[r.bairro].meta += Number(r.metaMensal) || 0
  })

  historicoFlat.forEach((h) => {
    const rua = ruas.find((r) => r.id === h.varricaoId)
    if (!rua?.bairro || !isInMonth(h.data, y, m)) return
    map[rua.bairro].kmMes += Number(h.kmExecutado) || 0
  })

  return Object.values(map).map((row) => ({
    ...row,
    pctMeta: row.meta ? Math.min(100, Math.round((row.kmMes / row.meta) * 100)) : 0,
  })).sort((a, b) => a.bairro.localeCompare(b.bairro))
}

export function ruasAtrasadas(ruas) {
  return ruas.filter((r) => isAtiva(r) && calcStatusVarricao(r) === 'Atrasada')
}

export function hasVarricaoAlert(ruas) {
  return ruas.some(
    (r) => isAtiva(r) && (calcStatusVarricao(r) === 'Atrasada' || calcStatusVarricao(r) === 'Atenção'),
  )
}

export function countPlanosSidebar(ruas) {
  return PLANOS.reduce((acc, p) => {
    acc[p] = ruas.filter((r) => isAtiva(r) && normalizePlano(r.plano) === p).length
    return acc
  }, {})
}
