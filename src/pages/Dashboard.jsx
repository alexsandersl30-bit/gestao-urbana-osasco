import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
} from 'recharts'
import { useCollection } from '../hooks/useCollection'
import { COLLECTIONS } from '../firebase/db'
import StatCard from '../components/StatCard'
import Loading from '../components/Loading'
import { calcStatusCacamba } from '../utils/cacambas'
import { kmValue } from '../utils/varricao'
import { semAtendimento7Dias } from '../utils/pontosViciados'
import { formatDate } from '../utils/dates'
import { calcStatusExibicao, isConcluido } from '../utils/protocolos156'

const COLORS = ['#1D9E75', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Dashboard() {
  const { data: pontos, loading: l1 } = useCollection(COLLECTIONS.PONTOS)
  const { data: cacambas, loading: l2 } = useCollection(COLLECTIONS.CACAMBAS)
  const { data: varricao, loading: l3 } = useCollection(COLLECTIONS.VARRICAO)
  const { data: protocolos, loading: l4 } = useCollection(COLLECTIONS.PROTOCOLOS)

  const loading = l1 || l2 || l3 || l4

  const metrics = useMemo(() => {
    const cacambasAtrasadas = cacambas.filter(
      (c) => c.ativa !== false && calcStatusCacamba(c) === 'Atrasada',
    ).length
    const kmMes = varricao.reduce((s, v) => s + kmValue(v.quilometragem), 0)
    const protocolosAbertos = protocolos.filter((p) => !isConcluido(p)).length
    const criticos = pontos.filter(
      (p) => (p.criticidade === 'Crítico' || semAtendimento7Dias(p)) && (p.status || 'Ativo') === 'Ativo',
    )
    const vencidos = protocolos.filter((p) => calcStatusExibicao(p) === 'Vencido')

    const porTipo = protocolos.reduce((acc, p) => {
      acc[p.tipo] = (acc[p.tipo] || 0) + 1
      return acc
    }, {})
    const chartTipo = Object.entries(porTipo).map(([name, value]) => ({ name, value }))

    return { cacambasAtrasadas, kmMes, protocolosAbertos, criticos, vencidos, chartTipo }
  }, [pontos, cacambas, varricao, protocolos])

  if (loading) return <Loading />

  const ultimos = [
    { label: 'Pontos Viciados', items: pontos.slice(0, 3), link: '/pontos-viciados', field: 'endereco' },
    { label: 'Caçambas', items: cacambas.slice(0, 3), link: '/cacambas', field: 'endereco' },
    { label: 'Varrição', items: varricao.slice(0, 3), link: '/varricao', field: 'rua' },
    { label: 'Protocolos', items: protocolos.slice(0, 3), link: '/protocolos-156', field: 'numero' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm">Visão geral da gestão urbana</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pontos Viciados" value={pontos.length} />
        <StatCard title="Caçambas Atrasadas" value={metrics.cacambasAtrasadas} alert={metrics.cacambasAtrasadas > 0} />
        <StatCard title="Km Varrição (total)" value={metrics.kmMes.toFixed(1)} subtitle="Soma cadastrada" />
        <StatCard title="Protocolos Abertos" value={metrics.protocolosAbertos} />
      </div>

      {(metrics.criticos.length > 0 || metrics.vencidos.length > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h2 className="font-semibold text-red-800 mb-2">⚠️ Alertas</h2>
          <ul className="text-sm text-red-700 space-y-1">
            {metrics.criticos.map((p) => (
              <li key={p.id}>Ponto crítico: {p.endereco} — {p.bairro}</li>
            ))}
            {metrics.vencidos.map((p) => (
              <li key={p.id}>Protocolo vencido: #{p.numero} — prazo {formatDate(p.prazo)}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold text-gray-700 mb-4">Protocolos por Tipo</h3>
          {metrics.chartTipo.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={metrics.chartTipo} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {metrics.chartTipo.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">Nenhum protocolo cadastrado</p>
          )}
        </div>

        <div className="space-y-4">
          {ultimos.map((sec) => (
            <div key={sec.label} className="bg-white rounded-xl border p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-700 text-sm">{sec.label}</h3>
                <Link to={sec.link} className="text-xs text-primary hover:underline">Ver todos</Link>
              </div>
              {sec.items.length === 0 ? (
                <p className="text-xs text-gray-400">Nenhum registro</p>
              ) : (
                <ul className="text-sm space-y-1">
                  {sec.items.map((item) => (
                    <li key={item.id} className="text-gray-600 truncate">
                      {item[sec.field] || item.endereco || item.nome || '—'}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
