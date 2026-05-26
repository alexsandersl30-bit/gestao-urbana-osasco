import { badgeConformidadeClass } from '../../utils/ecopontos'

export default function BadgeConformidade({ value }) {
  const pct = value ?? 0
  const cls = badgeConformidadeClass(pct)
  const label = pct > 0 ? `${pct}%` : '—'
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {label}
    </span>
  )
}
