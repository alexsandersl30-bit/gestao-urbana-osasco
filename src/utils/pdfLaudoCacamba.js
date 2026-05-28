import { jsPDF } from 'jspdf'
import { formatDate } from './dates'
import { CRITERIOS_VISTORIA } from './vistoriaCacambas'

export function exportarLaudoPDFCacamba(vistoria, cacamba) {
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
    const colW = [(pageW - margin * 2) * 0.3, (pageW - margin * 2) * 0.25, (pageW - margin * 2) * 0.45]
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
  doc.rect(0, 0, pageW, 32, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Prefeitura do Município de Osasco', margin, 12)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Secretaria de Serviços e Obras', margin, 20)
  doc.text('Laudo de Vistoria — Caçamba', margin, 27)
  doc.setTextColor(0, 0, 0)
  y = 40

  // Informações gerais
  line(`Caçamba: ${cacamba?.endereco || vistoria.cacambaEndereco || '—'}`, 11, true)
  line(`Bairro: ${cacamba?.bairro || vistoria.cacambaBairro || '—'} | Empresa: ${cacamba?.empresa || '—'}`)
  line(`Fiscal / Funcionário: ${vistoria.fiscal || '—'}`)
  line(`Data da visita: ${formatDate(vistoria.dataVisita)} | Horário: ${vistoria.horario || '—'}`)
  line(`Conformidade: ${vistoria.conformidade ?? 0}%`, 11, true)
  y += 4

  // Critérios de avaliação
  line('CRITÉRIOS DE AVALIAÇÃO', 10, true)
  tableRow(['Critério', 'Condição', 'Observações'], true)

  CRITERIOS_VISTORIA.forEach((criterio) => {
    const v = vistoria[criterio.id]
    tableRow([criterio.label, v?.condicao || '—', v?.obs || '—'])
  })

  y += 2

  // Problema mais frequente
  if (vistoria.problemaMaisFrequente) {
    line('Problema mais frequente', 10, true)
    line(vistoria.problemaMaisFrequente, 9)
    y += 2
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
    `Documento gerado em ${new Date().toLocaleString('pt-BR')} — Gestão Urbana Osasco`,
    margin,
    290,
  )

  const nomeArq = (cacamba?.endereco || 'cacamba').replace(/[^\w\s-]/g, '').slice(0, 30)
  doc.save(`laudo-cacamba-${nomeArq}-${formatDate(vistoria.dataVisita)}.pdf`)
}

export default null
