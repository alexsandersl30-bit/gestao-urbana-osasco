import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import StatCard from '../StatCard'
import { formatDate } from '../../utils/dates'
import BadgeStatusCacamba from './BadgeStatus'
import {
  calcStatusCacamba,
  calcTaxaAtendimentoCacambas,
  countColetasMes,
  chartColetasPorBairro,
  chartStatusPorBairro,
  cacambasAtrasadasLista,
  isAtiva,
} from '../../utils/cacambas'

const STACK_COLORS = {
  'Em dia': '#22c55e',
  Atenção: '#eab308',
  Atrasada: '#ef4444',
}

export default function CacambaEstatisticas({ cacambas }) {
  const ativas = cacambas.filter(isAtiva)
  const coletasMes = countColetasMes(cacambas)
  const atrasadas = cacambasAtrasadasLista(cacambas).length
  const taxa = calcTaxaAtendimentoCacambas(cacambas)
  const chartBairro = chartColetasPorBairro(cacambas)
  const chartStatus = chartStatusPorBairro(cacambas)
  const listaAtrasadas = cacambasAtrasadasLista(cacambas)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Caçambas ativas" value={ativas.length} />
        <StatCard title="Coletas no mês" value={coletasMes} subtitle="Registradas este mês" />
        <StatCard title="Coletas atrasadas" value={atrasadas} alert={atrasadas > 0} />
        <StatCard title="Taxa de atendimento" value={`${taxa}%`} subtitle="Coletas em dia" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4">Coletas por bairro (mês atual)</h3>
          {chartBairro.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartBairro} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="bairro" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 11 }} height={70} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="coletas" fill="#1D9E75" name="Coletas" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-400 text-sm py-12">Sem coletas no mês</p>
          )}
        </div>

        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4">Status por bairro (ativas)</h3>
          {chartStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartStatus} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="bairro" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 11 }} height={70} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Em dia" stackId="s" fill={STACK_COLORS['Em dia']} />
                <Bar dataKey="Atenção" stackId="s" fill={STACK_COLORS.Atenção} />
                <Bar dataKey="Atrasada" stackId="s" fill={STACK_COLORS.Atrasada} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-400 text-sm py-12">Sem dados</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-red-700">Caçambas com coleta atrasada</h3>
          <p className="text-xs text-gray-500 mt-1">{listaAtrasadas.length} caçamba(s)</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-red-50 text-left">
            <tr>
              <th className="p-3">Endereço</th>
              <th className="p-3">Bairro</th>
              <th className="p-3">Empresa</th>
              <th className="p-3">Última coleta</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {listaAtrasadas.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-gray-400">Nenhuma caçamba atrasada</td></tr>
            ) : (
              listaAtrasadas.map((c) => (
                <tr key={c.id} className="border-t bg-red-50/50">
                  <td className="p-3 font-medium text-red-900">{c.endereco}</td>
                  <td className="p-3">{c.bairro}</td>
                  <td className="p-3">{c.empresa}</td>
                  <td className="p-3 text-red-700">{formatDate(c.ultimaColeta) || 'Nunca'}</td>
                  <td className="p-3"><BadgeStatusCacamba status={calcStatusCacamba(c)} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
