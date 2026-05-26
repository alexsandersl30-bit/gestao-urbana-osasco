import * as XLSX from 'xlsx'
import { TIPOS, STATUS_STORED } from './protocolos156'

const COL_MAP = {
  numero: ['número', 'numero', 'protocolo', 'nº', 'no'],
  tipo: ['tipo'],
  endereco: ['endereço', 'endereco', 'endereço completo'],
  bairro: ['bairro'],
  dataabertura: ['data abertura', 'data de abertura', 'abertura', 'dataabertura'],
  prazo: ['prazo', 'prazo de atendimento', 'prazo atendimento', 'vencimento'],
  status: ['status', 'situação', 'situacao'],
  descricao: ['descrição', 'descricao', 'obs', 'observação'],
  responsavel: ['responsável', 'responsavel'],
}

function normHeader(h) {
  return String(h || '').trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
}

function findColKey(header) {
  const n = normHeader(header)
  for (const [key, aliases] of Object.entries(COL_MAP)) {
    if (aliases.some((a) => n === a || n.includes(a))) return key
  }
  return null
}

function excelDateToIso(value) {
  if (!value) return ''
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'number') {
    const d = XLSX.SSF.parse_date_code(value)
    if (d) return new Date(d.y, d.m - 1, d.d).toISOString()
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString()
}

function normalizeTipo(t) {
  const s = String(t || '').trim()
  const found = TIPOS.find((x) => x.toLowerCase() === s.toLowerCase())
  return found || (s ? 'Outro' : '')
}

function normalizeStatus(s) {
  const v = String(s || '').trim()
  if (/conclu/i.test(v)) return 'Concluído'
  if (/atend/i.test(v)) return 'Em atendimento'
  if (/agend/i.test(v)) return 'Agendado'
  if (/venc/i.test(v)) return 'Aberto'
  return STATUS_STORED.includes(v) ? v : 'Aberto'
}

export function parseExcelProtocolos(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array', cellDates: true })
        const sheet = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
        if (rows.length < 2) {
          resolve([])
          return
        }
        const headerRow = rows[0]
        const colIndex = {}
        headerRow.forEach((h, i) => {
          const key = findColKey(h)
          if (key) colIndex[key] = i
        })
        if (colIndex.numero === undefined) {
          reject(new Error('Coluna "Número" não encontrada na planilha.'))
          return
        }
        const items = []
        for (let r = 1; r < rows.length; r++) {
          const row = rows[r]
          if (!row?.length) continue
          const get = (key) => row[colIndex[key]] ?? ''
          const numero = String(get('numero')).trim()
          if (!numero) continue
          const status = normalizeStatus(get('status'))
          items.push({
            numero,
            tipo: normalizeTipo(get('tipo')),
            endereco: String(get('endereco')).trim(),
            bairro: String(get('bairro')).trim(),
            dataAbertura: excelDateToIso(get('dataabertura')) || new Date().toISOString(),
            prazo: excelDateToIso(get('prazo')),
            status,
            descricao: String(get('descricao')).trim(),
            responsavel: String(get('responsavel')).trim() || 'Importação',
            dataConclusao: status === 'Concluído' ? new Date().toISOString() : null,
            fotos: [],
            historicoStatus: [{
              data: new Date().toISOString(),
              status,
              responsavel: 'Importação Excel',
              observacao: 'Registro importado da planilha',
            }],
          })
        }
        resolve(items)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
    reader.readAsArrayBuffer(file)
  })
}
