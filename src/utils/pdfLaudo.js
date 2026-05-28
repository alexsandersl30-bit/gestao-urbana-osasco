import { jsPDF } from 'jspdf'
import { LOGO_BASE64 } from './logobase64'
import { formatDate } from './dates'
import { boolLabel } from './ecopontos'
import {
  ECOPONTO_OPERACAO_LABELS,
  ECOPONTO_INFRAESTRUTURA_LABELS,
  ECOPONTO_SEGREGACAO_LABELS,
  ECOPONTO_CONDICIONAMENTO_LABELS,
  ECOPONTO_COLETA_LABELS,
  ECOPONTO_IRREGULARIDADES_LABELS,
  ECOPONTO_SEGURANCA_LABELS,
  ECOPONTO_FUNCIONAMENTO_LABELS,
  PEV_ABERTURAS_INTERNAS_LABELS,
  PEV_ABERTURA_EXTERNA_LABELS,
  PEV_CONDICAO_BAGS_LABELS,
  PEV_TIPOS_RESIDUOS_LABELS,
  PEV_RETIRADA_BAGS_LABELS,
} from '../components/ecopontos/checklistLabels'

// Mapa de nomes de campos para seus labels correspondentes
const FIELD_LABELS = {
  operacao: 'OPERAÇÃO',
  infraestrutura: 'INFRAESTRUTURA',
  segregacao: 'SEGREGAÇÃO DOS RESÍDUOS',
  condicionamento: 'CONDICIONAMENTO',
  coleta: 'COLETA E DESTINAÇÃO',
  irregularidades: 'IRREGULARIDADES',
  seguranca: 'SEGURANÇA E IMPACTO',
  funcionamento: 'FUNCIONAMENTO / EQUIPAMENTO',
  aperturaInterna: 'ABERTURAS INTERNAS',
  aperturaExterna: 'ABERTURA EXTERNA',
  condicaoBags: 'CONDIÇÃO DOS BAGS',
  tiposResiduos: 'TIPOS DE RESÍDUOS',
  retiradaBags: 'RETIRADA DOS BAGS',
}

// Mapa de campos para seus rótulos de itens
const ITEM_LABELS_MAP = {
  operacao: ECOPONTO_OPERACAO_LABELS,
  infraestrutura: ECOPONTO_INFRAESTRUTURA_LABELS,
  segregacao: ECOPONTO_SEGREGACAO_LABELS,
  condicionamento: ECOPONTO_CONDICIONAMENTO_LABELS,
  coleta: ECOPONTO_COLETA_LABELS,
  irregularidades: ECOPONTO_IRREGULARIDADES_LABELS,
  seguranca: ECOPONTO_SEGURANCA_LABELS,
  funcionamento: ECOPONTO_FUNCIONAMENTO_LABELS,
  aperturaInterna: PEV_ABERTURAS_INTERNAS_LABELS,
  aperturaExterna: PEV_ABERTURA_EXTERNA_LABELS,
  condicaoBags: PEV_CONDICAO_BAGS_LABELS,
  tiposResiduos: PEV_TIPOS_RESIDUOS_LABELS,
  retiradaBags: PEV_RETIRADA_BAGS_LABELS,
}

export function exportarLaudoPDF(vistoria, ecoponto) {
  const doc = new jsPDF()
  const margin = 14
  const pageW = 210
  let y = 15

  const checkPage = (need = 12) => {
    if (y + need > 285) {
      doc.addPage()
      y = 15
    }
  }

  const line = (text, size = 9, bold = false) => {
    checkPage()
    doc.setFontSize(size)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    const lines = doc.splitTextToSize(String(text), pageW - margin * 2)
    doc.text(lines, margin, y)
    y += lines.length * (size * 0.42) + 3
  }

  const tableRow = (cols, bold = false) => {
    checkPage(8)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(8)
    const colW = [(pageW - margin * 2) * 0.35, (pageW - margin * 2) * 0.25, (pageW - margin * 2) * 0.4]
    let x = margin
    cols.forEach((text, i) => {
      const t = doc.splitTextToSize(String(text || '—'), colW[i] - 2)
      doc.text(t, x, y)
      x += colW[i]
    })
    y += 6
  }

// Cabeçalho
doc.setFillColor(29, 158, 117)
doc.rect(0, 0, pageW, 40, 'F')

// Fundo branco atrás do logo
doc.setFillColor(255, 255, 255)
doc.roundedRect(margin - 2, 4, 44, 32, 3, 3, 'F')

// Logo
try {
  doc.addImage(LOGO_BASE64, 'PNG', margin, 6, 40, 28)
// eslint-disable-next-line no-unused-vars
} catch (e) {
  // fallback sem logo
}

// Textos do cabeçalho
doc.setTextColor(255, 255, 255)
doc.setFontSize(11)
doc.setFont('helvetica', 'bold')
doc.text('Prefeitura do Município de Osasco', 62, 14)
doc.setFontSize(9)
doc.setFont('helvetica', 'normal')
doc.text('Secretaria de Serviços e Obras', 62, 22)
doc.text('Laudo de Vistoria — Ecoponto / PEV / Cooperativa', 62, 30)
doc.setTextColor(0, 0, 0)
y = 48

  // Informações gerais
  line(`Ecoponto: ${ecoponto?.nome || vistoria.ecopontoNome || '—'}`, 11, true)
  line(`Tipo: ${ecoponto?.tipo || vistoria.tipo || '—'} | Endereço: ${ecoponto?.endereco || '—'}, ${ecoponto?.bairro || ''}`)
  line(`Fiscal / Funcionário: ${vistoria.fiscal || '—'}`)
  line(`Data da visita: ${formatDate(vistoria.dataVisita)} | Horário: ${vistoria.horario || '—'}`)
  line(`Contato: ${vistoria.contato || ecoponto?.contato || '—'}`)
  if (vistoria.inaugurado !== undefined) line(`Inauguração: ${boolLabel(vistoria.inaugurado)} | EPI: ${boolLabel(vistoria.epi)}`)
  if (vistoria.obs) line(`OBS: ${vistoria.obs}`)
  line(`Conformidade: ${vistoria.conformidade ?? 0}%`, 11, true)
  y += 4

  // Renderizar seções dinamicamente
  const fieldOrder = ['operacao', 'infraestrutura', 'segregacao', 'condicionamento', 'coleta', 'irregularidades', 'seguranca', 'funcionamento', 'aperturaInterna', 'aperturaExterna', 'condicaoBags', 'tiposResiduos', 'retiradaBags']
  
  fieldOrder.forEach((fieldName) => {
    const section = vistoria[fieldName]
    if (!section || typeof section !== 'object' || Array.isArray(section)) return

    const sectionLabel = FIELD_LABELS[fieldName]
    if (!sectionLabel) return

    line(sectionLabel, 10, true)
    tableRow(['Item', 'Condição', 'Observações'], true)

    const itemLabels = ITEM_LABELS_MAP[fieldName] || {}
    Object.entries(itemLabels).forEach(([key, label]) => {
  const v = section?.[key]
  if (!v) return
  const condicao = v?.condicao || ''
  const obs = v?.obs || ''
  // Pular itens completamente vazios
  if (!condicao && !obs) return
  tableRow([label, condicao || '—', obs || '—'])
})

    y += 2
  })

  // Informações adicionais
  y += 2
  if (vistoria.horarioFuncionamento) {
    line(`Horário de funcionamento: ${vistoria.horarioFuncionamento}`)
  }
  if (vistoria.problemaMaisFrequente) {
    line(`Problema mais frequente: ${vistoria.problemaMaisFrequente}`)
  }

  // Fotos
  const fotos = vistoria.fotos || []
  if (fotos.length) {
    line('Registro fotográfico', 10, true)
    fotos.slice(0, 4).forEach((foto, i) => {
      checkPage(70)
      try {
        doc.addImage(foto, 'JPEG', margin, y, 85, 60)
        y += 65
      } catch {
        line(`[Foto ${i + 1}]`, 8)
      }
    })
  }

  // Rodapé
  checkPage(15)
  y = Math.max(y, 270)
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text(
    `Documento gerado em ${new Date().toLocaleString('pt-BR')} — Osasco Urbana - Diretoria de Limpeaza Urbana`,
    margin,
    290,
  )

  const nomeArq = (ecoponto?.nome || vistoria.ecopontoNome || 'ecoponto').replace(/[^\w\s-]/g, '').slice(0, 30)
  doc.save(`laudo-${nomeArq}-${formatDate(vistoria.dataVisita)}.pdf`)
}
