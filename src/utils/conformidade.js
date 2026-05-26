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
  if (pct >= 80) return 'bg-green-100 text-green-800 border-green-200'
  if (pct >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  return 'bg-red-100 text-red-800 border-red-200'
}

export { ESTRUTURA_KEYS, RESIDUOS_KEYS, COMUNICACAO_KEYS }
