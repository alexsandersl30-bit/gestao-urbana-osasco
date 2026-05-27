import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import StatCard from '../StatCard'
import { formatDate } from '../../utils/dates'
import BadgeConformidade from './BadgeConformidade'
import { statsEcopontos } from '../../utils/ecopontos'

const BAR_COLORS = ['#1D9E75', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function EcopontoEstatisticas({ ecopontos, vistorias }) {
  const stats = statsEcopontos(ecopontos, vistorias)
  const historico = [...vistorias].sort((a, b) => new Date(b.dataVisita) - new Date(a.dataVisita))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total de ecopontos" value={stats.total} />
        <StatCard title="Vistorias no mês" value={stats.vistoriasMes} />
        <StatCard title="Conformidade média" value={`${stats.media}%`} />
        <StatCard title="Abaixo de 80%" value={stats.abaixo80} alert={stats.abaixo80 > 0} />
      </div>

      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <h3 className="font-semibold text-gray-700 mb-4">Conformidade por ecoponto (última vistoria)</h3>
        {stats.chartPorEcoponto.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.chartPorEcoponto} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 10 }} height={80} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="conformidade" name="Conformidade %" radius={[4, 4, 0, 0]}>
                {stats.chartPorEcoponto.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-400 text-sm py-12">Sem vistorias para exibir</p>
        )}
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-700">Histórico de vistorias</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Data</th>
              <th className="p-3">Ecoponto</th>
              <th className="p-3">Fiscal</th>
              <th className="p-3">Conformidade</th>
            </tr>
          </thead>
          <tbody>
            {historico.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-gray-400">Nenhuma vistoria</td></tr>
            ) : (
              historico.map((v) => (
                <tr key={v.id} className="border-t">
                  <td className="p-3">{formatDate(v.dataVisita)}</td>
                  <td className="p-3">{v.ecopontoNome || '—'}</td>
                  <td className="p-3">{v.fiscal}</td>
                  <td className="p-3"><BadgeConformidade value={v.conformidade} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
