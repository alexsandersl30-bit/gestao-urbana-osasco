import { daysSince } from './dates'

export const FREQUENCIAS = ['Diária', '3x/semana', '2x/semana', 'Semanal', 'Quinzenal']
export const CRITICIDADES = ['Regular', 'Atenção', 'Crítico']
export const STATUS_PONTO = ['Ativo', 'Resolvido']
export const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

export const CRITICIDADE_BADGE = {
  Regular: 'bg-green-100 text-green-800 border-green-200',
  Atenção: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Crítico: 'bg-red-100 text-red-800 border-red-200',
}

export const STATUS_BADGE = {
  Ativo: 'bg-blue-100 text-blue-800',
  Resolvido: 'bg-gray-100 text-gray-600',
}

export function diasSemanaToString(dias) {
  if (typeof dias === 'string') return dias
  if (Array.isArray(dias)) return dias.join(', ')
  return ''
}

export function diasSemanaToArray(dias) {
  if (Array.isArray(dias)) return dias
  if (typeof dias === 'string' && dias.trim()) {
    return dias.split(',').map((d) => d.trim()).filter(Boolean)
  }
  return []
}

export function parseDate(value) {
  if (!value) return null
  if (value?.toDate) return value.toDate()
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export function isCurrentMonth(iso) {
  const d = parseDate(iso)
  if (!d) return false
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

export function wasAttendedInLast7Days(ponto) {
  const dias = daysSince(ponto.ultimoAtendimento)
  return dias <= 7
}

export function semAtendimento7Dias(ponto) {
  if ((ponto.status || 'Ativo') !== 'Ativo') return false
  return daysSince(ponto.ultimoAtendimento) > 7
}

export function countDenunciasMes(pontos) {
  return pontos.reduce((sum, p) => {
    const hist = p.historicoDenuncias || []
    return sum + hist.filter(isCurrentMonth).length
  }, 0)
}

export function calcTaxaAtendimento(pontos) {
  const ativos = pontos.filter((p) => (p.status || 'Ativo') === 'Ativo')
  if (!ativos.length) return 0
  const atendidos = ativos.filter(wasAttendedInLast7Days).length
  return Math.round((atendidos / ativos.length) * 100)
}

export function chartAtendimentosPorBairro(pontos) {
  const map = {}
  pontos.forEach((p) => {
    if (!p.bairro) return
    if (!map[p.bairro]) map[p.bairro] = { bairro: p.bairro, atendimentos: 0 }
    const histMes = (p.historicoAtendimentos || []).filter(isCurrentMonth)
    if (histMes.length) map[p.bairro].atendimentos += histMes.length
    else if (p.ultimoAtendimento && isCurrentMonth(p.ultimoAtendimento)) {
      map[p.bairro].atendimentos += 1
    }
  })
  return Object.values(map).sort((a, b) => b.atendimentos - a.atendimentos)
}

export function chartPorCriticidade(pontos) {
  return CRITICIDADES.map((c) => ({
    criticidade: c,
    total: pontos.filter((p) => p.criticidade === c && (p.status || 'Ativo') === 'Ativo').length,
  }))
}

export function hasPontosAlert(pontos) {
  return pontos.some(
    (p) =>
      (p.criticidade === 'Crítico' && (p.status || 'Ativo') === 'Ativo')
      || semAtendimento7Dias(p),
  )
}

export function validatePontoForm(form) {
  const errors = {}
  if (!form.endereco?.trim()) errors.endereco = 'Endereço é obrigatório'
  if (!form.bairro?.trim()) errors.bairro = 'Bairro é obrigatório'
  if (!form.frequencia) errors.frequencia = 'Frequência é obrigatória'
  if (!form.responsavel?.trim()) errors.responsavel = 'Responsável é obrigatório'
  if (!form.criticidade) errors.criticidade = 'Criticidade é obrigatória'
  return errors
}

export const emptyPonto = {
  endereco: '',
  bairro: '',
  frequencia: 'Semanal',
  diasSemana: '',
  diasSemanaArr: [],
  responsavel: '',
  criticidade: 'Regular',
  descricao: '',
  fotos: [],
  ultimoAtendimento: null,
  denuncias: 0,
  status: 'Ativo',
  historicoAtendimentos: [],
  historicoDenuncias: [],
}
