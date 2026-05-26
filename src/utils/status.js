import { daysSince } from './dates'

const FREQ_DAYS = {
  Diária: 1,
  '3x/semana': 2,
  '2x/semana': 3,
  Semanal: 7,
  Quinzenal: 14,
  Mensal: 30,
}

export function getPontoStatus(item) {
  const dias = daysSince(item.ultimoAtendimento)
  const limite = FREQ_DAYS[item.frequencia] || 7
  if (item.criticidade === 'Crítico' && dias > limite) return 'critico'
  if (item.criticidade === 'Alta' && dias > limite) return 'critico'
  if (dias > limite * 1.5) return 'atrasado'
  if (dias > limite) return 'atencao'
  return 'em_dia'
}

export function getCacambaStatus(item) {
  const dias = daysSince(item.ultimaColeta)
  const limite = FREQ_DAYS[item.frequencia] || 7
  if (dias > limite * 1.5) return 'atrasada'
  if (dias > limite) return 'atencao'
  return 'em_dia'
}

export const STATUS_LABELS = {
  em_dia: { label: 'Em dia', class: 'bg-green-100 text-green-800' },
  atencao: { label: 'Atenção', class: 'bg-yellow-100 text-yellow-800' },
  atrasado: { label: 'Atrasado', class: 'bg-orange-100 text-orange-800' },
  atrasada: { label: 'Atrasada', class: 'bg-red-100 text-red-800' },
  critico: { label: 'Crítico', class: 'bg-red-200 text-red-900' },
}
