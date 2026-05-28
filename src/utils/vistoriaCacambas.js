import { isCurrentMonth } from './pontosViciados'

// Cálculo de conformidade baseado nos critérios
export function calcularConformidadeCacamba(vistoria) {
  let total = 0
  
  // Localização: Boa=20, Regular=10, Ruim=0
  if (vistoria.localizacao?.condicao === 'Boa') total += 20
  else if (vistoria.localizacao?.condicao === 'Regular') total += 10
  
  // Manutenção: Boa=20, Regular=10, Ruim=0
  if (vistoria.manutencao?.condicao === 'Boa') total += 20
  else if (vistoria.manutencao?.condicao === 'Regular') total += 10
  
  // Limpeza: Boa=20, Regular=10, Ruim=0
  if (vistoria.limpezaAmbiente?.condicao === 'Boa') total += 20
  else if (vistoria.limpezaAmbiente?.condicao === 'Regular') total += 10
  
  // Resíduo doméstico: Sim=20, Parcialmente=10, Não=0
  if (vistoria.apenasResiduoDomestico?.condicao === 'Sim') total += 20
  else if (vistoria.apenasResiduoDomestico?.condicao === 'Parcialmente') total += 10
  
  // Estado geral: Boa=20, Regular=10, Ruim=0
  if (vistoria.estadoCacamba?.condicao === 'Boa') total += 20
  else if (vistoria.estadoCacamba?.condicao === 'Regular') total += 10
  
  return total
}

export const CONFORMIDADE_BADGE = {
  boa: 'bg-[#DCFCE7] text-[#15803D] border-[#bbf7d0]',
  media: 'bg-[#FEF9C3] text-[#854D0E] border-[#fef3c7]',
  ruim: 'bg-[#FEE2E2] text-[#991B1B] border-[#fecaca]',
}

export function getConformidadeBadgeClass(conformidade) {
  if (conformidade >= 80) return CONFORMIDADE_BADGE.boa
  if (conformidade >= 60) return CONFORMIDADE_BADGE.media
  return CONFORMIDADE_BADGE.ruim
}

export const CRITERIOS_VISTORIA = [
  {
    id: 'localizacao',
    label: 'Localização da caçamba',
    descricao: 'A caçamba está posicionada corretamente, sem obstruir calçada ou via pública?',
    opcoes: ['Boa', 'Regular', 'Ruim'],
  },
  {
    id: 'manutencao',
    label: 'Manutenção da caçamba',
    descricao: 'Estado de conservação físico da caçamba (sem amassados graves, ferrugem excessiva, etc)',
    opcoes: ['Boa', 'Regular', 'Ruim'],
  },
  {
    id: 'limpezaAmbiente',
    label: 'Limpeza do ambiente',
    descricao: 'O entorno da caçamba está limpo, sem resíduos espalhados no chão?',
    opcoes: ['Boa', 'Regular', 'Ruim'],
  },
  {
    id: 'apenasResiduoDomestico',
    label: 'Apenas resíduo doméstico',
    descricao: 'O conteúdo da caçamba é exclusivamente resíduo doméstico, sem entulho ou resíduos proibidos?',
    opcoes: ['Sim', 'Parcialmente', 'Não'],
  },
  {
    id: 'estadoCacamba',
    label: 'Estado geral da caçamba',
    descricao: 'Avaliação geral do estado e funcionamento da caçamba',
    opcoes: ['Boa', 'Regular', 'Ruim'],
  },
]

export function createEmptyVistoriaCacamba(cacambaId = '', cacambaEndereco = '', cacambaBairro = '', fiscal = '') {
  return {
    cacambaId,
    cacambaEndereco,
    cacambaBairro,
    fiscal,
    dataVisita: new Date().toISOString().slice(0, 10),
    horario: '',
    localizacao: { condicao: '', obs: '' },
    manutencao: { condicao: '', obs: '' },
    limpezaAmbiente: { condicao: '', obs: '' },
    apenasResiduoDomestico: { condicao: '', obs: '' },
    estadoCacamba: { condicao: '', obs: '' },
    problemaMaisFrequente: '',
    fotos: [],
    conformidade: 0,
  }
}

export function statsCacambas(cacambas, vistorias) {
  const total = vistorias.length
  const vistoriasMes = vistorias.filter((v) => {
    const dataVisita = v.dataVisita?.toDate ? v.dataVisita.toDate() : new Date(v.dataVisita)
    return isCurrentMonth(dataVisita)
  }).length
  
  const conformidades = vistorias.map((v) => v.conformidade || 0)
  const media = conformidades.length ? Math.round(conformidades.reduce((a, b) => a + b) / conformidades.length) : 0
  const abaixo60 = vistorias.filter((v) => (v.conformidade || 0) < 60).length
  
  // Gráfico por bairro
  const porBairro = {}
  vistorias.forEach((v) => {
    const bairro = v.cacambaBairro
    if (!bairro) return
    if (!porBairro[bairro]) porBairro[bairro] = { bairro, conformidades: [] }
    porBairro[bairro].conformidades.push(v.conformidade || 0)
  })
  
  const chartPorBairro = Object.values(porBairro).map((item) => ({
    bairro: item.bairro,
    conformidade: Math.round(item.conformidades.reduce((a, b) => a + b, 0) / item.conformidades.length),
  }))
  
  // Evolução mensal (últimos 6 meses)
  const now = new Date()
  const evolucao = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    const count = vistorias.filter((v) => {
      const dataVisita = v.dataVisita?.toDate ? v.dataVisita.toDate() : new Date(v.dataVisita)
      return dataVisita.getFullYear() === d.getFullYear() && dataVisita.getMonth() === d.getMonth()
    }).length
    evolucao.push({ mes: label, vistorias: count })
  }
  
  // Distribuição por condição do estado geral
  const condicoes = { Boa: 0, Regular: 0, Ruim: 0 }
  vistorias.forEach((v) => {
    const cond = v.estadoCacamba?.condicao
    if (condicoes[cond] !== undefined) condicoes[cond]++
  })
  
  const totalComCondicao = Object.values(condicoes).reduce((a, b) => a + b, 0)
  const chartCondicoes = Object.entries(condicoes).map(([cond, count]) => ({
    name: cond,
    value: totalComCondicao ? Math.round((count / totalComCondicao) * 100) : 0,
    color: cond === 'Boa' ? '#16a34a' : cond === 'Regular' ? '#f59e0b' : '#dc2626',
  }))
  
  return {
    total,
    thisMonth: vistoriasMes,
    averageConformidade: media,
    below60: abaixo60,
    chartPorBairro,
    evolucao,
    chartCondicoes,
  }
}

export function menorConformidade(vistorias, cacambas) {
  return vistorias
    .map((v) => {
      const cacamba = cacambas.find((c) => c.id === v.cacambaId)
      return {
        ...v,
        endereco: cacamba?.endereco || v.cacambaEndereco,
        bairro: cacamba?.bairro || v.cacambaBairro,
      }
    })
    .sort((a, b) => (a.conformidade || 0) - (b.conformidade || 0))
    .slice(0, 10)
}

export default null
