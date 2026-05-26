import { useMemo } from 'react'
import {
  BarChart, Bar, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import StatCard from '../StatCard'
import { formatDate } from '../../utils/dates'
import { BadgePlano, BadgeStatus } from './BadgePlano'
import {
  calcMetaGlobalAtingida,
  calcStatusVarricao,
  chartKmVsMetaBairro,
  chartKmPorPlano,
  chartEvolucao6Meses,
  resumoPorBairro,
  ruasAtrasadas,
  isAtiva,
  PLANO_STYLES,
  kmValue,
  formatKm,
} from '../../utils/varricao'
import Loading from '../Loading'

export default function VarricaoEstatisticas({ ruas, historicoFlat, loadingHistorico }) {
  const ativas = useMemo(() => ruas.filter(isAtiva), [ruas])
  const totalKm = useMemo(() => ativas.reduce((s, r) => s + kmValue(r.quilometragem), 0), [ativas])
  const kmMes = useMemo(() => historicoFlat.reduce((s, h) => {
    const now = new Date()
    const d = h.data?.toDate ? h.data.toDate() : new Date(h.data)
    if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
      return s + (Number(h.kmExecutado) || 0)
    }
    return s
  }, 0), [historicoFlat])

  const pctMeta = useMemo(() => calcMetaGlobalAtingida(ruas, historicoFlat), [ruas, historicoFlat])
  const chartBairro = useMemo(() => chartKmVsMetaBairro(ruas, historicoFlat), [ruas, historicoFlat])
  const chartPlano = useMemo(() => chartKmPorPlano(ruas, historicoFlat), [ruas, historicoFlat])
  const chartLinha = useMemo(() => chartEvolucao6Meses(historicoFlat), [historicoFlat])
  const resumo = useMemo(() => resumoPorBairro(ruas, historicoFlat), [ruas, historicoFlat])
  const atrasadas = useMemo(() => ruasAtrasadas(ruas), [ruas])

  if (loadingHistorico) return <Loading text="Carregando estatísticas..." />

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Ruas cadastradas" value={ruas.length} subtitle={`${ativas.length} ativas`} />
        <StatCard title="Km total cadastrado" value={formatKm(totalKm)} subtitle="Soma dos trechos" />
        <StatCard title="Km varrido no mês" value={kmMes.toFixed(1)} subtitle="Mês atual" />
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500 font-medium">Meta mensal atingida</p>
          <p className="text-3xl font-bold text-primary mt-1">{pctMeta}%</p>
          <div className="mt-3 h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pctMeta}%` }} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4">Km varrido vs meta por bairro (mês)</h3>
          {chartBairro.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartBairro} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="bairro" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 11 }} height={70} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="kmVarrido" fill="#1D9E75" name="Km varrido" radius={[4, 4, 0, 0]} />
                <Bar dataKey="meta" fill="#e5e7eb" name="Meta (km)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-400 text-sm py-12">Sem dados no mês</p>
          )}
        </div>

        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4">Km varrido por plano (mês)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartPlano}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="plano" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="km" name="Km" radius={[4, 4, 0, 0]}>
                {chartPlano.map((entry) => (
                  <Cell key={entry.plano} fill={PLANO_STYLES[entry.plano]?.hex || '#1D9E75'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <h3 className="font-semibold text-gray-700 mb-4">Evolução do km varrido (últimos 6 meses)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartLinha}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="km" stroke="#1D9E75" strokeWidth={2} name="Km varrido" dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-700">Resumo por bairro</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Bairro</th>
              <th className="p-3">Ruas</th>
              <th className="p-3">Km total</th>
              <th className="p-3">Km no mês</th>
              <th className="p-3">% meta</th>
            </tr>
          </thead>
          <tbody>
            {resumo.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-gray-400">Sem dados</td></tr>
            ) : (
              resumo.map((row) => (
                <tr key={row.bairro} className="border-t">
                  <td className="p-3 font-medium">{row.bairro}</td>
                  <td className="p-3">{row.ruas}</td>
                  <td className="p-3">{row.kmTotal.toFixed(1)}</td>
                  <td className="p-3">{row.kmMes.toFixed(1)}</td>
                  <td className="p-3">
                    <span className={row.pctMeta >= 100 ? 'text-green-600 font-medium' : row.pctMeta >= 50 ? 'text-yellow-600' : 'text-red-600'}>
                      {row.pctMeta}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-red-700">Ruas com varrição atrasada</h3>
          <p className="text-xs text-gray-500 mt-1">{atrasadas.length} rua(s)</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-red-50 text-left">
            <tr>
              <th className="p-3">Rua</th>
              <th className="p-3">Bairro</th>
              <th className="p-3">Plano</th>
              <th className="p-3">Última varrição</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {atrasadas.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-gray-400">Nenhuma rua atrasada</td></tr>
            ) : (
              atrasadas.map((r) => (
                <tr key={r.id} className="border-t bg-red-50/50">
                  <td className="p-3 font-medium text-red-900">{r.rua}</td>
                  <td className="p-3">{r.bairro}</td>
                  <td className="p-3"><BadgePlano plano={r.plano} /></td>
                  <td className="p-3 text-red-700">{formatDate(r.ultimaVarricao) || 'Nunca'}</td>
                  <td className="p-3"><BadgeStatus status={calcStatusVarricao(r)} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
