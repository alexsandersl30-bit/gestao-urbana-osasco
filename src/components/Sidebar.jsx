import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCollection } from '../hooks/useCollection'
import { canManageUsers } from '../utils/roles'
import { COLLECTIONS } from '../firebase/db'
import { hasPontosAlert } from '../utils/pontosViciados'
import { hasCacambasAlert } from '../utils/cacambas'
import { hasVarricaoAlert, countPlanosSidebar, PLANO_STYLES } from '../utils/varricao'

const links = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/pontos-viciados', label: 'Pontos Viciados', icon: '📍', alertKey: 'pontos' },
  { to: '/cacambas', label: 'Caçambas', icon: '🚧', alertKey: 'cacambas' },
  { to: '/varricao', label: 'Varrição', icon: '🧹', planBadges: true },
  { to: '/ecopontos', label: 'Pontos de Entrega', icon: '♻️' },
  { to: '/protocolos-156', label: 'Protocolos 156', icon: '📋' },
]

export default function Sidebar({ open, onClose }) {
  const { user, perfil, logout } = useAuth()
  const { data: pontos } = useCollection(COLLECTIONS.PONTOS)
  const { data: cacambas } = useCollection(COLLECTIONS.CACAMBAS)
  const { data: varricao } = useCollection(COLLECTIONS.VARRICAO)
  const pontosAlert = hasPontosAlert(pontos)
  const cacambasAlert = hasCacambasAlert(cacambas)
  const varricaoAlert = hasVarricaoAlert(varricao)
  const planoCounts = countPlanosSidebar(varricao)

  const accountName = user?.displayName || user?.email || 'Gestão Urbana'
  const initials = accountName
    .replace(/@.*$/, '')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-r-full text-sm font-medium transition relative ${
      isActive
        ? 'bg-[#F0FDF4] text-[#15803d] border-l-4 border-[#16a34a] shadow-sm'
        : 'text-[#374151] hover:bg-[#F9FAFB]'
    }`

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#E5E7EB] flex flex-col transform transition-transform lg:translate-x-0 shadow-lg ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-[#E5E7EB] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#DCFCE7] text-[#15803d] flex items-center justify-center text-xl">
              🌿
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#111827]">Gestão Urbana</h1>
              <p className="text-xs text-[#6B7280]">Prefeitura de Osasco</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={navClass} onClick={onClose}>
              <span className="text-lg">{l.icon}</span>
              <span className="flex-1">{l.label}</span>
              {l.alertKey === 'pontos' && pontosAlert && (
                <span
                  className="w-2.5 h-2.5 rounded-full bg-[#DC2626] shrink-0 ring-2 ring-white"
                  title="Pontos críticos ou sem atendimento"
                  aria-hidden
                />
              )}
              {l.alertKey === 'cacambas' && cacambasAlert && (
                <span
                  className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shrink-0 ring-2 ring-white"
                  title="Caçambas com coleta atrasada ou em atenção"
                  aria-hidden
                />
              )}
              {l.planBadges && (
                <span className="flex gap-0.5 shrink-0" title="Ruas por plano">
                  {['Verde', 'Azul', 'Laranja'].map((p) => (
                    <span
                      key={p}
                      className="w-2 h-2 rounded-full ring-1 ring-white"
                      style={{ backgroundColor: PLANO_STYLES[p]?.hex }}
                      title={`${p}: ${planoCounts[p] || 0}`}
                    />
                  ))}
                </span>
              )}
              {l.planBadges && varricaoAlert && (
                <span
                  className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0 ring-2 ring-white -ml-1"
                  title="Varrição atrasada ou em atenção"
                  aria-hidden
                />
              )}
            </NavLink>
          ))}
          {canManageUsers(perfil) && (
            <NavLink to="/usuarios" className={navClass} onClick={onClose}>
              <span>👤</span>
              Usuários
            </NavLink>
          )}
        </nav>

        <div className="p-4 border-t border-[#E5E7EB] bg-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-full bg-[#DCFCE7] text-[#15803d] font-semibold flex items-center justify-center text-base">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#111827] truncate">{user?.displayName || user?.email}</p>
              <p className="text-xs text-[#6B7280] truncate">{perfil}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="w-full py-2 text-sm text-[#991B1B] bg-[#FEE2E2] border border-[#FECACA] rounded-lg hover:bg-[#FECACA] transition"
          >
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
