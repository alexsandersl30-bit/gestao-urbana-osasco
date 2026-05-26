import { STATUS_BADGE } from '../../utils/cacambas'

export default function BadgeStatusCacamba({ status }) {
  const cls = STATUS_BADGE[status] || 'bg-gray-100 text-gray-600 border-gray-200'
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {status || '—'}
    </span>
  )
}
