import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import StatCard from '../StatCard'
import { formatDate } from '../../utils/dates'
import { statsDashboard, calcStatusExibicao, rowHighlightClass } from '../../utils/protocolos156'
import BadgeStatus from './BadgeStatus'

export default function ProtocoloDashboard({ protocolos }) {
  const stats = statsDashboard(protocolos)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total no mês" value={stats.totalMes} />
        <StatCard title="Concluídos" value={stats.concluidos} />
        <StatCard title="Vencidos" value={stats.vencidos} alert={stats.vencidos > 0} />
        <StatCard title="Taxa de resolução" value={`${stats.taxa}%`} />
        <StatCard title="Tempo médio (dias)" value={stats.tempoMedio} subtitle="Até conclusão" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4">Protocolos por tipo</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.chartTipo}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tipo" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" height={70} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#1D9E75" name="Quantidade" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4">Protocolos por bairro</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.chartBairro} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bairro" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" height={70} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#3b82f6" name="Quantidade" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <h3 className="font-semibold text-gray-700 mb-4">Evolução mensal (últimos 6 meses)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={stats.evolucao}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total" stroke="#1D9E75" strokeWidth={2} name="Protocolos abertos" dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border overflow-x-auto shadow-sm">
          <div className="p-4 border-b bg-red-50">
            <h3 className="font-semibold text-red-800">Protocolos vencidos</h3>
            <p className="text-xs text-gray-500">{stats.vencidosLista.length} registro(s)</p>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left bg-red-50/50">
              <tr>
                <th className="p-3">Protocolo</th>
                <th className="p-3">Prazo</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.vencidosLista.length === 0 ? (
                <tr><td colSpan={3} className="p-4 text-center text-gray-400">Nenhum</td></tr>
              ) : (
                stats.vencidosLista.map((p) => (
                  <tr key={p.id} className="border-t bg-red-50/30">
                    <td className="p-3 font-medium">{p.numero}</td>
                    <td className="p-3">{formatDate(p.prazo)}</td>
                    <td className="p-3"><BadgeStatus status={calcStatusExibicao(p)} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border overflow-x-auto shadow-sm">
          <div className="p-4 border-b bg-yellow-50">
            <h3 className="font-semibold text-yellow-800">Vencem hoje ou amanhã</h3>
            <p className="text-xs text-gray-500">{stats.proximosVenc.length} registro(s)</p>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left bg-yellow-50/50">
              <tr>
                <th className="p-3">Protocolo</th>
                <th className="p-3">Prazo</th>
                <th className="p-3">Bairro</th>
              </tr>
            </thead>
            <tbody>
              {stats.proximosVenc.length === 0 ? (
                <tr><td colSpan={3} className="p-4 text-center text-gray-400">Nenhum</td></tr>
              ) : (
                stats.proximosVenc.map((p) => (
                  <tr key={p.id} className={`border-t ${rowHighlightClass(p)}`}>
                    <td className="p-3 font-medium">{p.numero}</td>
                    <td className="p-3">{formatDate(p.prazo)}</td>
                    <td className="p-3">{p.bairro}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
