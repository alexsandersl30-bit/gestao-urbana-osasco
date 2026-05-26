import { normalizePlano, PLANO_STYLES } from '../../utils/varricao'
import BadgeStatusVarricao from './BadgeStatus'

export function BadgePlano({ plano }) {
  const p = normalizePlano(plano)
  const cls = PLANO_STYLES[p]?.badge || 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {p}
    </span>
  )
}

export { BadgeStatusVarricao as BadgeStatus }
