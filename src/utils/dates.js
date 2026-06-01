export function formatDate(date) {
  if (!date) return '—'
  const d = date instanceof Date ? date : (date?.toDate ? date.toDate() : new Date(date))
  if (Number.isNaN(d.getTime())) return date
  return d.toLocaleDateString('pt-BR')
}

export function daysSince(iso) {
  if (!iso) return Infinity
  const d = iso instanceof Date ? iso : (iso?.toDate ? iso.toDate() : new Date(iso))
  const now = new Date()
  return Math.floor((now - d) / (1000 * 60 * 60 * 24))
}

export function isOverdue(prazoIso) {
  if (!prazoIso) return false
  const d = prazoIso instanceof Date ? prazoIso : (prazoIso?.toDate ? prazoIso.toDate() : new Date(prazoIso))
  return d < new Date()
}

// Converte string 'YYYY-MM-DD' para Date no horário local (sem perder dia)
export function parseDateLocal(dateStr) {
  if (!dateStr) return null
  if (dateStr instanceof Date) return dateStr
  const [year, month, day] = String(dateStr).slice(0, 10).split('-').map(Number)
  return new Date(year, month - 1, day, 12, 0, 0)
}

// Formata Date para 'YYYY-MM-DD' no horário local
export function toLocalDateString(date) {
  if (!date) return ''
  const d = date instanceof Date
    ? date
    : (date?.toDate
      ? date.toDate()
      : (typeof date === 'string' && date.length === 10
        ? parseDateLocal(date)
        : new Date(date)))
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Converte para timestamp Firestore sem perder o dia
export function toFirestoreDate(dateStr) {
  if (!dateStr) return null
  if (dateStr instanceof Date) return dateStr
  return parseDateLocal(dateStr)
}
