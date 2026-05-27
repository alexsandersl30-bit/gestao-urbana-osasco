import { daysSince } from './dates'
import { isCurrentMonth } from './pontosViciados'

export const FREQUENCIAS = ['Diária', '3x/semana', '2x/semana', 'Semanal', 'Quinzenal']
export const STATUS_CACAMBA = ['Em dia', 'Atenção', 'Atrasada']

const FREQ_DAYS = {
  Diária: 1,
  '3x/semana': 2,
  '2x/semana': 3,
  Semanal: 7,
  Quinzenal: 14,
}

export const STATUS_BADGE = {
  'Em dia': 'bg-[#DCFCE7] text-[#15803D] border-[#bbf7d0]',
  Atenção: 'bg-[#FEF9C3] text-[#854D0E] border-[#fef3c7]',
  Atrasada: 'bg-[#FEE2E2] text-[#991B1B] border-[#fecaca]',
}

export function calcStatusCacamba(cacamba) {
  if (cacamba.ativa === false) return cacamba.status || 'Em dia'
  const limite = FREQ_DAYS[cacamba.frequencia] || 7

  if (!cacamba.ultimaColeta) return 'Atrasada'

  const dias = daysSince(cacamba.ultimaColeta)
  if (dias <= limite) return 'Em dia'
  if (dias <= limite + 2) return 'Atenção'
  return 'Atrasada'
}

export function isAtiva(cacamba) {
  return cacamba.ativa !== false
}

export function validateCacambaForm(form) {
  const errors = {}
  if (!form.endereco?.trim()) errors.endereco = 'Endereço é obrigatório'
  if (!form.bairro?.trim()) errors.bairro = 'Bairro é obrigatório'
  if (!form.frequencia) errors.frequencia = 'Frequência é obrigatória'
  if (!form.empresa?.trim()) errors.empresa = 'Empresa é obrigatória'
  const cap = Number(form.capacidade)
  if (!form.capacidade && form.capacidade !== 0) errors.capacidade = 'Capacidade é obrigatória'
  else if (Number.isNaN(cap) || cap <= 0) errors.capacidade = 'Informe capacidade válida em m³'
  return errors
}

export const emptyCacamba = {
  endereco: '',
  bairro: '',
  frequencia: 'Semanal',
  empresa: '',
  capacidade: '',
  fotos: [],
  ultimaColeta: null,
  status: 'Em dia',
  ativa: true,
  historicoColetas: [],
}

export function countColetasMes(cacambas) {
  return cacambas.reduce((sum, c) => {
    const hist = c.historicoColetas || []
    return sum + hist.filter((h) => isCurrentMonth(h.data || h)).length
  }, 0)
}

export function calcTaxaAtendimentoCacambas(cacambas) {
  const ativas = cacambas.filter(isAtiva)
  if (!ativas.length) return 0
  const emDia = ativas.filter((c) => calcStatusCacamba(c) === 'Em dia').length
  return Math.round((emDia / ativas.length) * 100)
}

export function chartColetasPorBairro(cacambas) {
  const map = {}
  cacambas.forEach((c) => {
    if (!c.bairro) return
    if (!map[c.bairro]) map[c.bairro] = { bairro: c.bairro, coletas: 0 }
    const histMes = (c.historicoColetas || []).filter((h) => isCurrentMonth(h.data || h))
    if (histMes.length) map[c.bairro].coletas += histMes.length
    else if (c.ultimaColeta && isCurrentMonth(c.ultimaColeta)) {
      map[c.bairro].coletas += 1
    }
  })
  return Object.values(map).sort((a, b) => b.coletas - a.coletas)
}

export function chartStatusPorBairro(cacambas) {
  const map = {}
  cacambas.filter(isAtiva).forEach((c) => {
    if (!c.bairro) return
    if (!map[c.bairro]) {
      map[c.bairro] = { bairro: c.bairro, 'Em dia': 0, Atenção: 0, Atrasada: 0 }
    }
    const st = calcStatusCacamba(c)
    if (map[c.bairro][st] !== undefined) map[c.bairro][st]++
  })
  return Object.values(map)
}

export function cacambasAtrasadasLista(cacambas) {
  return cacambas.filter((c) => isAtiva(c) && calcStatusCacamba(c) === 'Atrasada')
}

export function hasCacambasAlert(cacambas) {
  return cacambas.some(
    (c) => isAtiva(c) && (calcStatusCacamba(c) === 'Atrasada' || calcStatusCacamba(c) === 'Atenção'),
  )
}
