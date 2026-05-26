export function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('pt-BR')
}

export function daysSince(iso) {
  if (!iso) return Infinity
  const d = new Date(iso)
  const now = new Date()
  return Math.floor((now - d) / (1000 * 60 * 60 * 24))
}

export function isOverdue(prazoIso) {
  if (!prazoIso) return false
  return new Date(prazoIso) < new Date()
}
