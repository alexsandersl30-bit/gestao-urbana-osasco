import { toLocalDateString } from '../../utils/dates'

function initSection(labels) {
  return Object.keys(labels).reduce((acc, k) => {
    acc[k] = { condicao: '', obs: '' }
    return acc
  }, {})
}

export const ECOPONTO_OPERACAO_LABELS = {
  atendimento: 'Atendimento',
  registroAnotacao: 'Realiza registro (anotação/sistema)',
}

export const ECOPONTO_INFRAESTRUTURA_LABELS = {
  cercamento: 'Cercamento/controle de acesso',
  identificacaoResiduos: 'Identificação dos tipos de resíduos',
  rampa: 'Rampa/Acesso',
  iluminacao: 'Iluminação',
  pavimentacao: 'Pavimentação',
}

export const ECOPONTO_SEGREGACAO_LABELS = {
  separacaoTipo: 'Separação por tipo',
  seMisturados: 'Se misturados - sinalizar',
  rcc: 'RCC (entulho)',
  volumosos: 'Volumosos (móveis/colchões)',
  eletroeletronicos: 'Eletroeletrônicos',
}

export const ECOPONTO_CONDICIONAMENTO_LABELS = {
  container: 'Container',
  suportes: 'Suportes',
  camarasAdequadas: 'Câmaras adequadas',
  nivelOcupacao: 'Nível de ocupação',
  residuosFora: 'Resíduos fora das áreas',
}

export const ECOPONTO_COLETA_LABELS = {
  frequencia: 'Frequência de retirada',
}

export const ECOPONTO_IRREGULARIDADES_LABELS = {
  residuosProibidos: 'Presença de resíduos proibidos',
  mauCheiro: 'Mau cheiro',
  presencaVetores: 'Presença de vetores',
}

export const ECOPONTO_SEGURANCA_LABELS = {
  riscoUsuarios: 'Risco aos usuários',
  riscoTrabalhadores: 'Risco aos trabalhadores',
  usoEPI: 'Uso de EPIs pela equipe',
  impactoAmbiental: 'Impacto ambiental',
}

export const ECOPONTO_FUNCIONAMENTO_LABELS = {
  equipamento: 'Equipamento atende ao objetivo',
  necessidadeAjuste: 'Necessidade de ajuste operacional',
}

export function createEmptyVistoriaEcoponto(fiscal = '', ecopontoId = '') {
  return {
    ecopontoId,
    ecopontoNome: '',
    tipo: 'ecoponto',
    fiscal,
    dataVisita: toLocalDateString(new Date()),
    horario: '',
    contato: '',
    obs: '',
    operacao: initSection(ECOPONTO_OPERACAO_LABELS),
    infraestrutura: initSection(ECOPONTO_INFRAESTRUTURA_LABELS),
    segregacao: initSection(ECOPONTO_SEGREGACAO_LABELS),
    condicionamento: initSection(ECOPONTO_CONDICIONAMENTO_LABELS),
    coleta: initSection(ECOPONTO_COLETA_LABELS),
    irregularidades: initSection(ECOPONTO_IRREGULARIDADES_LABELS),
    seguranca: initSection(ECOPONTO_SEGURANCA_LABELS),
    funcionamento: initSection(ECOPONTO_FUNCIONAMENTO_LABELS),
    classificacaoFinal: '',
    fotos: [],
    conformidade: 0,
  }
}

// PEV labels and factory
export const PEV_OPERACAO_LABELS = {
  dataColeta: 'Data da coleta',
  frequencia: 'Frequência',
  coletaConforme: 'Coleta ocorreu conforme previsto',
}

export const PEV_INFRAESTRUTURA_LABELS = {
  estruturaIntegra: 'Estrutura íntegra (paredes/telhado)',
  limpezaGeral: 'Limpeza geral do PEV',
  presenciaVandalismo: 'Presença de vandalismo',
  portasPrincipais: 'Portas (Regular / Precária / Iluminada / Adequada / Irregular / Precária)',
}

export const PEV_ABERTURAS_INTERNAS_LABELS = {
  quantidadeJanelas: 'Quantidade de janelas funcionando',
  suportesMetalicos: 'Suportes metálicos íntegros',
  aberturaAcessivel: 'Abertura acessível',
}

export const PEV_ABERTURA_EXTERNA_LABELS = {
  funcionamentoAdequado: 'Funcionamento adequado',
  presenciaResiduos: 'Presença de resíduos fora da abertura',
}

export const PEV_CONDICAO_BAGS_LABELS = {
  quantidadeBags: 'Quantidade de bags instalados',
  nivelOcupacao: 'Nível de ocupação (Baixo / Médio / Alto / Transbordando)',
  bagsDanificados: 'Bags danificados ou com ruptura',
}

export const PEV_TIPOS_RESIDUOS_LABELS = {
  predominante: 'Resíduo predominante',
  residuosNaoReciclaveis: 'Presença de resíduos não recicláveis',
}

export const PEV_RETIRADA_BAGS_LABELS = {
  portaAcessoInterna: 'Porta de acesso (interna) íntegra',
  acessoRestrito: 'Acesso restrito mantido',
  retiradaRegular: 'Retirada ocorre regularmente',
}

export const PEV_IRREGULARIDADES_LABELS = {
  descarteIrregular: 'Descarte irregular no entorno',
  mauCheiro: 'Mau cheiro',
  presencaVetores: 'Presença de vetores',
}

export const PEV_FUNCIONAMENTO_LABELS = {
  equipamentoObjetivo: 'Equipamento atende ao objetivo',
  ajusteOperacional: 'Necessidade de ajuste operacional',
}

export function createEmptyVistoriaPEV(fiscal = '', ecopontoId = '') {
  return {
    ecopontoId,
    ecopontoNome: '',
    tipo: 'pev',
    fiscal,
    dataVisita: toLocalDateString(new Date()),
    horario: '',
    contato: '',
    obs: '',
    operacao: initSection(PEV_OPERACAO_LABELS),
    infraestrutura: initSection(PEV_INFRAESTRUTURA_LABELS),
    aperturaInterna: initSection(PEV_ABERTURAS_INTERNAS_LABELS),
    aperturaExterna: initSection(PEV_ABERTURA_EXTERNA_LABELS),
    condicaoBags: initSection(PEV_CONDICAO_BAGS_LABELS),
    tiposResiduos: initSection(PEV_TIPOS_RESIDUOS_LABELS),
    retiradaBags: initSection(PEV_RETIRADA_BAGS_LABELS),
    irregularidades: initSection(PEV_IRREGULARIDADES_LABELS),
    funcionamento: initSection(PEV_FUNCIONAMENTO_LABELS),
    classificacaoFinal: '',
    fotos: [],
    conformidade: 0,
  }
}

export default null
