import * as XLSX from 'xlsx'
import { TIPOS, STATUS_STORED } from './protocolos156'

const COL_MAP = {
  numero: ['número', 'numero', 'protocolo', 'nº', 'no', 'n°', '№', '#', 'protocolo 156'],
  tipo: ['tipo', 'natureza da denúncia', 'natureza', 'tipo de denúncia'],
  endereco: ['endereço', 'endereco', 'endereço completo', 'address', 'rua', 'local'],
  bairro: ['bairro', 'bairro/zona', 'zona', 'district'],
  dataabertura: ['data abertura', 'data de abertura', 'abertura', 'dataabertura', 'data do protocolo', 'data', 'data de criação'],
  prazo: ['prazo', 'prazo de atendimento', 'prazo atendimento', 'vencimento', 'data vencimento', 'data prazo'],
  status: ['status', 'situação', 'situacao', 'estado', 'state', 'andamento'],
  descricao: ['descrição', 'descricao', 'obs', 'observação', 'observation', 'details', 'detalhes', 'reclamação', 'reclamacao'],
  responsavel: ['responsável', 'responsavel', 'atribuído a', 'atribuido', 'assigned', 'responsavel pela vistoria'],
  telefone: ['telefone', 'phone', 'celular', 'tel'],
  email: ['email', 'e-mail', 'mail'],
}

function normHeader(h) {
  return String(h || '').trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
}

function findColKey(header) {
  const n = normHeader(header)
  for (const [key, aliases] of Object.entries(COL_MAP)) {
    if (aliases.some((a) => {
      const an = normHeader(a)
      return n === an || n.includes(an) || an.includes(n)
    })) return key
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
        if (!wb.SheetNames.length) {
          reject(new Error('Arquivo Excel vazio'))
          return
        }
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
          reject(new Error(`Coluna "Número" não encontrada. Colunas encontradas: ${headerRow.join(', ')}`))
          return
        }
        
        const items = []
        for (let r = 1; r < rows.length; r++) {
          const row = rows[r]
          if (!row?.length || row.every((v) => !v)) continue
          
          const get = (key) => {
            const idx = colIndex[key]
            return idx !== undefined ? row[idx] : ''
          }
          
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
            telefone: String(get('telefone')).trim() || '',
            email: String(get('email')).trim() || '',
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
