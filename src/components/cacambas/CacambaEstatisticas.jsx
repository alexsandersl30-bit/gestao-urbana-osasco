import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts'
import StatCard from '../StatCard'
import { formatDate } from '../../utils/dates'
import BadgeStatusCacamba from './BadgeStatus'
import { statsCacambas, menorConformidade, getConformidadeBadgeClass, CRITERIOS_VISTORIA } from '../../utils/vistoriaCacambas'
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

const CONDITION_COLORS = {
  Boa: '#22c55e',
  Regular: '#eab308',
  Ruim: '#ef4444',
}

export default function CacambaEstatisticas({ cacambas, vistorias = [] }) {
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

      {vistorias.length > 0 && (
        <>
          <hr className="my-8" />
          <h2 className="text-xl font-bold text-gray-800 mt-8">Vistorias de Caçambas</h2>
          
          <VistoriaStatistics cacambas={cacambas} vistorias={vistorias} />
        </>
      )}
    </div>
  )
}

function VistoriaStatistics({ cacambas, vistorias }) {
  const stats = statsCacambas(cacambas, vistorias)
  const menores = menorConformidade(vistorias, cacambas)
  
  // Gráfico de evolução (últimos 6 meses)
  const chartEvolucao = stats.evolucao || []
  
  // Gráfico de distribuição por bairro
  const chartBairro = stats.chartPorBairro || []
  
  // Gráfico de distribuição de condições (Boa/Regular/Ruim)
  const condicoesCount = {
    Boa: 0,
    Regular: 0,
    Ruim: 0,
  }
  vistorias.forEach((v) => {
    CRITERIOS_VISTORIA.forEach((crit) => {
      const val = v[crit.id]
      if (val?.condicao === 'Boa') condicoesCount.Boa += 1
      else if (val?.condicao === 'Regular') condicoesCount.Regular += 1
      else if (val?.condicao === 'Ruim') condicoesCount.Ruim += 1
    })
  })
  const chartCondicoes = Object.entries(condicoesCount).map(([name, value]) => ({ name, value }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total de vistorias" value={stats.total} />
        <StatCard title="Conformidade média" value={`${Math.round(stats.averageConformidade)}%`} subtitle="Geral" />
        <StatCard title="Abaixo de 60%" value={stats.below60} alert={stats.below60 > 0} />
        <StatCard title="Vistorias este mês" value={stats.thisMonth} subtitle="Registradas" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4">Conformidade média por bairro</h3>
          {chartBairro.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartBairro} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="bairro" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 11 }} height={70} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="conformidade" fill="#1D9E75" name="Conformidade %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-400 text-sm py-12">Sem dados de vistoria</p>
          )}
        </div>

        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4">Distribuição de condições</h3>
          {chartCondicoes.some((c) => c.value > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={chartCondicoes} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80}>
                  {chartCondicoes.map((entry) => (
                    <Cell key={entry.name} fill={CONDITION_COLORS[entry.name] || '#999'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-400 text-sm py-12">Sem dados de condição</p>
          )}
        </div>
      </div>

      {chartEvolucao.length > 0 && (
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4">Vistorias por mês (últimos 6 meses)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartEvolucao}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#1D9E75" name="Vistorias" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {menores.length > 0 && (
        <div className="bg-white rounded-xl border overflow-x-auto shadow-sm">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-amber-700">Caçambas com menor conformidade</h3>
            <p className="text-xs text-gray-500 mt-1">Últimas {menores.length > 10 ? 10 : menores.length} vistorias com menores índices</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-amber-50 text-left">
              <tr>
                <th className="p-3">Endereço</th>
                <th className="p-3">Bairro</th>
                <th className="p-3">Última vistoria</th>
                <th className="p-3">Conformidade</th>
              </tr>
            </thead>
            <tbody>
              {menores.slice(0, 10).map((item, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{item.endereco}</td>
                  <td className="p-3">{item.bairro}</td>
                  <td className="p-3 text-sm">{formatDate(item.dataVisita)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold border ${getConformidadeBadgeClass(item.conformidade)}`}>
                      {item.conformidade}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
