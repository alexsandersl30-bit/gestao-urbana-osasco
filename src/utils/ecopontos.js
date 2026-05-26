import { isCurrentMonth } from './pontosViciados'
import { calcularConformidade, badgeConformidadeClass } from './conformidade'

export { calcularConformidade, badgeConformidadeClass }

export const TIPOS = ['Ecoponto', 'PEV', 'Cooperativa']

export const emptyEcoponto = {
  nome: '',
  tipo: 'Ecoponto',
  endereco: '',
  bairro: '',
  inaugurado: false,
  epi: false,
  horario: '',
  contato: '',
  coordenadas: '',
  fotos: [],
  ativo: true,
}

export function boolLabel(v) {
  return v === true || v === 'true' || v === 'sim' ? 'Sim' : 'Não'
}

export function validateEcopontoForm(form) {
  const errors = {}
  if (!form.nome?.trim()) errors.nome = 'Nome é obrigatório'
  if (!form.tipo) errors.tipo = 'Tipo é obrigatório'
  if (!form.endereco?.trim()) errors.endereco = 'Endereço é obrigatório'
  if (!form.bairro?.trim()) errors.bairro = 'Bairro é obrigatório'
  if (!form.horario?.trim()) errors.horario = 'Horário é obrigatório'
  if (!form.contato?.trim()) errors.contato = 'Contato é obrigatório'
  return errors
}

export function ultimaVistoriaPorEcoponto(vistorias) {
  const map = {}
  vistorias.forEach((v) => {
    if (!v.ecopontoId) return
    const prev = map[v.ecopontoId]
    if (!prev || new Date(v.dataVisita) > new Date(prev.dataVisita)) {
      map[v.ecopontoId] = v
    }
  })
  return map
}

export function statsEcopontos(ecopontos, vistorias) {
  const ativos = ecopontos.filter((e) => e.ativo !== false)
  const vistoriasMes = vistorias.filter((v) => isCurrentMonth(v.dataVisita))
  const confs = vistorias.map((v) => v.conformidade ?? 0).filter((c) => c > 0)
  const media = confs.length ? Math.round(confs.reduce((a, b) => a + b, 0) / confs.length) : 0
  const abaixo80 = vistorias.filter((v) => (v.conformidade ?? 0) < 80).length

  const chartPorEcoponto = ativos.map((e) => {
    const ult = vistorias
      .filter((v) => v.ecopontoId === e.id)
      .sort((a, b) => new Date(b.dataVisita) - new Date(a.dataVisita))[0]
    return {
      nome: e.nome?.length > 20 ? `${e.nome.slice(0, 18)}…` : e.nome,
      conformidade: ult?.conformidade ?? 0,
    }
  }).filter((x) => x.conformidade > 0)

  return {
    total: ativos.length,
    vistoriasMes: vistoriasMes.length,
    media,
    abaixo80,
    chartPorEcoponto,
  }
}
