import { jsPDF } from 'jspdf'
import { formatDate } from './dates'
import { boolLabel } from './ecopontos'
import {
  ESTRUTURA_LABELS,
  RESIDUOS_LABELS,
  COMUNICACAO_LABELS,
} from '../components/ChecklistField'

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

  doc.setFillColor(29, 158, 117)
  doc.rect(0, 0, pageW, 32, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Prefeitura do Município de Osasco', margin, 12)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Secretaria de Serviços e Obras', margin, 20)
  doc.text('Laudo de Vistoria — Ecoponto / PEV / Cooperativa', margin, 27)
  doc.setTextColor(0, 0, 0)
  y = 40

  line(`Ecoponto: ${ecoponto?.nome || vistoria.ecopontoNome || '—'}`, 11, true)
  line(`Tipo: ${ecoponto?.tipo || '—'} | Endereço: ${ecoponto?.endereco || '—'}, ${ecoponto?.bairro || ''}`)
  line(`Fiscal / Funcionário: ${vistoria.fiscal || '—'}`)
  line(`Data da visita: ${formatDate(vistoria.dataVisita)} | Horário: ${vistoria.horario || '—'}`)
  line(`Contato: ${vistoria.contato || ecoponto?.contato || '—'}`)
  line(`Inauguração: ${boolLabel(vistoria.inaugurado)} | EPI: ${boolLabel(vistoria.epi)}`)
  if (vistoria.obs) line(`OBS: ${vistoria.obs}`)
  line(`Conformidade: ${vistoria.conformidade ?? 0}%`, 11, true)
  y += 4

  line('EQUIPAMENTOS', 10, true)
  tableRow(['Item', 'Condição', 'Observações'], true)
  tableRow([
    'Equipamentos gerais',
    vistoria.equipamentos?.condicao,
    vistoria.equipamentos?.obs,
  ])

  line('ESTRUTURA', 10, true)
  tableRow(['Item', 'Condição', 'Observações'], true)
  Object.entries(ESTRUTURA_LABELS).forEach(([key, label]) => {
    const v = vistoria.estrutura?.[key]
    tableRow([label, v?.condicao, v?.obs])
  })

  line('TIPOS DE RESÍDUOS', 10, true)
  tableRow(['Item', 'Condição', 'Observações'], true)
  Object.entries(RESIDUOS_LABELS).forEach(([key, label]) => {
    const v = vistoria.residuos?.[key]
    tableRow([label, v?.condicao, v?.obs])
  })

  line('COMUNICAÇÃO VISUAL', 10, true)
  tableRow(['Item', 'Condição', 'Observações'], true)
  Object.entries(COMUNICACAO_LABELS).forEach(([key, label]) => {
    const v = vistoria.comunicacaoVisual?.[key]
    tableRow([label, v?.condicao, v?.obs])
  })

  y += 2
  line(`Horário de funcionamento: ${vistoria.horarioFuncionamento || '—'}`)
  line(`Problema mais frequente: ${vistoria.problemaMaisFrequente || '—'}`)

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

  checkPage(15)
  y = Math.max(y, 270)
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text(
    `Documento gerado em ${new Date().toLocaleString('pt-BR')} — Gestão Urbana Osasco`,
    margin,
    290,
  )

  const nomeArq = (ecoponto?.nome || 'ecoponto').replace(/[^\w\s-]/g, '').slice(0, 30)
  doc.save(`laudo-${nomeArq}-${formatDate(vistoria.dataVisita)}.pdf`)
}
