const ESTRUTURA_KEYS = [
  'rampa', 'baia05', 'adm', 'banheiro', 'portaoPrincipal',
  'gradil', 'pintura', 'iluminacao', 'telefone', 'pavimentacao',
]

const RESIDUOS_KEYS = [
  'entulhoRCC', 'podasArvores', 'moveis', 'madeira',
  'reciclaveis', 'eletroeletronicos', 'gesso',
]

const COMUNICACAO_KEYS = ['placas', 'adesivos07', 'informes']

/** Conformidade = itens "Bom" em estrutura + comunicação visual / total × 100 */
export function calcularConformidade(vistoria) {
  let bom = 0
  let total = 0

  const estrutura = vistoria.estrutura || {}
  ESTRUTURA_KEYS.forEach((key) => {
    total++
    if (estrutura[key]?.condicao === 'Bom') bom++
  })

  const comunicacao = vistoria.comunicacaoVisual || {}
  COMUNICACAO_KEYS.forEach((key) => {
    total++
    if (comunicacao[key]?.condicao === 'Bom') bom++
  })

  return total === 0 ? 0 : Math.round((bom / total) * 100)
}

export function badgeConformidadeClass(pct) {
  if (pct >= 80) return 'bg-[#DCFCE7] text-[#15803D] border-[#bbf7d0]'
  if (pct >= 60) return 'bg-[#FEF9C3] text-[#854D0E] border-[#fef3c7]'
  return 'bg-[#FEE2E2] text-[#991B1B] border-[#fecaca]'
}

export { ESTRUTURA_KEYS, RESIDUOS_KEYS, COMUNICACAO_KEYS }
