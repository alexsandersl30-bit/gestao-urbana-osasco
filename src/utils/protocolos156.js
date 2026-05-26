import { daysSince } from './dates'
import { isCurrentMonth } from './pontosViciados'

export const TIPOS = [
  'Ponto viciado',
  'Caçamba cheia',
  'Varrição pendente',
  'Ecoponto',
  'Lixo na calçada',
  'Outro',
]

export const STATUS_LIST = ['Aberto', 'Em atendimento', 'Agendado', 'Concluído', 'Vencido']

export const STATUS_STORED = ['Aberto', 'Em atendimento', 'Agendado', 'Concluído']

export function parseDateOnly(iso) {
  if (!iso) return null
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

export function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function isConcluido(protocolo) {
  return protocolo.status === 'Concluído' || !!protocolo.dataConclusao
}

/** Status exibido: Vencido automático se passou o prazo e não está concluído */
export function calcStatusExibicao(protocolo) {
  if (isConcluido(protocolo)) return 'Concluído'
  const prazo = parseDateOnly(protocolo.prazo)
  if (prazo && startOfDay(new Date()) > startOfDay(prazo)) return 'Vencido'
  return protocolo.status || 'Aberto'
}

export function diasEmAberto(protocolo) {
  if (isConcluido(protocolo) && protocolo.dataConclusao) {
    const abertura = parseDateOnly(protocolo.dataAbertura)
    const fim = parseDateOnly(protocolo.dataConclusao)
    if (!abertura || !fim) return 0
    return Math.max(0, Math.floor((fim - abertura) / (1000 * 60 * 60 * 24)))
  }
  return daysSince(protocolo.dataAbertura) === Infinity ? 0 : daysSince(protocolo.dataAbertura)
}

export function venceHojeOuAmanha(protocolo) {
  if (isConcluido(protocolo)) return false
  const prazo = parseDateOnly(protocolo.prazo)
  if (!prazo) return false
  const hoje = startOfDay(new Date())
  const p = startOfDay(prazo)
  const diff = Math.floor((p - hoje) / (1000 * 60 * 60 * 24))
  return diff === 0 || diff === 1
}

export function isVencidoExibicao(protocolo) {
  return calcStatusExibicao(protocolo) === 'Vencido'
}

export function statusBadgeClass(status) {
  switch (status) {
    case 'Concluído': return 'bg-green-100 text-green-800 border-green-200'
    case 'Vencido': return 'bg-red-100 text-red-800 border-red-200'
    case 'Em atendimento': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'Agendado': return 'bg-purple-100 text-purple-800 border-purple-200'
    default: return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

export function rowHighlightClass(protocolo) {
  const st = calcStatusExibicao(protocolo)
  if (st === 'Vencido') return 'bg-red-50'
  if (venceHojeOuAmanha(protocolo)) return 'bg-yellow-50'
  return ''
}

export const emptyProtocolo = {
  numero: '',
  tipo: '',
  endereco: '',
  bairro: '',
  dataAbertura: '',
  prazo: '',
  responsavel: '',
  status: 'Aberto',
  descricao: '',
  dataConclusao: null,
  fotos: [],
  historicoStatus: [],
}

export function validateProtocoloForm(form) {
  const errors = {}
  if (!form.numero?.trim()) errors.numero = 'Número é obrigatório'
  if (!form.tipo) errors.tipo = 'Tipo é obrigatório'
  if (!form.endereco?.trim()) errors.endereco = 'Endereço é obrigatório'
  if (!form.bairro?.trim()) errors.bairro = 'Bairro é obrigatório'
  if (!form.dataAbertura) errors.dataAbertura = 'Data de abertura é obrigatória'
  if (!form.prazo) errors.prazo = 'Prazo é obrigatório'
  if (!form.responsavel?.trim()) errors.responsavel = 'Responsável é obrigatório'
  return errors
}

export function statsDashboard(protocolos) {
  const mes = protocolos.filter((p) => isCurrentMonth(p.dataAbertura))
  const concluidos = protocolos.filter(isConcluido)
  const vencidos = protocolos.filter(isVencidoExibicao)
  const taxa = protocolos.length
    ? Math.round((concluidos.length / protocolos.length) * 100)
    : 0

  const tempos = concluidos
    .map((p) => diasEmAberto(p))
    .filter((d) => d >= 0)
  const tempoMedio = tempos.length
    ? Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length)
    : 0

  const porTipo = {}
  const porBairro = {}
  protocolos.forEach((p) => {
    if (p.tipo) porTipo[p.tipo] = (porTipo[p.tipo] || 0) + 1
    if (p.bairro) porBairro[p.bairro] = (porBairro[p.bairro] || 0) + 1
  })

  const chartTipo = Object.entries(porTipo).map(([tipo, total]) => ({ tipo, total }))
  const chartBairro = Object.entries(porBairro).map(([bairro, total]) => ({ bairro, total }))

  const evolucao = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    const total = protocolos.filter((p) => {
      const da = parseDateOnly(p.dataAbertura)
      return da && da.getFullYear() === d.getFullYear() && da.getMonth() === d.getMonth()
    }).length
    evolucao.push({ mes: label, total })
  }

  const vencidosLista = protocolos.filter(isVencidoExibicao)
  const proximosVenc = protocolos.filter((p) => venceHojeOuAmanha(p))

  return {
    totalMes: mes.length,
    concluidos: concluidos.length,
    vencidos: vencidos.length,
    taxa,
    tempoMedio,
    chartTipo,
    chartBairro,
    evolucao,
    vencidosLista,
    proximosVenc,
  }
}
