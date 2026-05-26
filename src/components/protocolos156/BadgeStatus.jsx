import { statusBadgeClass } from '../../utils/protocolos156'

export default function BadgeStatus({ status }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadgeClass(status)}`}>
      {status}
    </span>
  )
}
