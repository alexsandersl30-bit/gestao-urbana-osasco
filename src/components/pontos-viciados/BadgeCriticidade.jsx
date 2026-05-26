import { CRITICIDADE_BADGE, STATUS_BADGE } from '../../utils/pontosViciados'

export function BadgeCriticidade({ criticidade }) {
  const cls = CRITICIDADE_BADGE[criticidade] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {criticidade || '—'}
    </span>
  )
}

export function BadgeStatus({ status }) {
  const s = status || 'Ativo'
  const cls = STATUS_BADGE[s] || STATUS_BADGE.Ativo
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {s}
    </span>
  )
}
