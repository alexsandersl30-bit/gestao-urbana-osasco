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
  em_dia: { label: 'Em dia', class: 'bg-[#DCFCE7] text-[#15803D] border-[#bbf7d0]' },
  atencao: { label: 'Atenção', class: 'bg-[#FEF9C3] text-[#854D0E] border-[#fef3c7]' },
  atrasado: { label: 'Atrasado', class: 'bg-[#FEE2E2] text-[#991B1B] border-[#fecaca]' },
  atrasada: { label: 'Atrasada', class: 'bg-[#FEE2E2] text-[#991B1B] border-[#fecaca]' },
  critico: { label: 'Crítico', class: 'bg-[#FEE2E2] text-[#991B1B] border-[#fecaca]' },
}
