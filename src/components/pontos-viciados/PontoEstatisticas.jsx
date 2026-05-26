import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import StatCard from '../StatCard'
import { formatDate } from '../../utils/dates'
import { BadgeCriticidade } from './BadgeCriticidade'
import {
  calcTaxaAtendimento,
  countDenunciasMes,
  chartAtendimentosPorBairro,
  chartPorCriticidade,
  semAtendimento7Dias,
} from '../../utils/pontosViciados'

export default function PontoEstatisticas({ pontos }) {
  const ativos = pontos.filter((p) => (p.status || 'Ativo') === 'Ativo')
  const criticos = ativos.filter((p) => p.criticidade === 'Crítico').length
  const denunciasMes = countDenunciasMes(pontos)
  const taxa = calcTaxaAtendimento(pontos)
  const chartBairro = chartAtendimentosPorBairro(pontos)
  const chartCrit = chartPorCriticidade(pontos)
  const semAtendimento = pontos.filter(semAtendimento7Dias)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Pontos ativos" value={ativos.length} />
        <StatCard title="Pontos críticos" value={criticos} alert={criticos > 0} />
        <StatCard title="Denúncias no mês" value={denunciasMes} subtitle="Registradas este mês" />
        <StatCard title="Taxa de atendimento" value={`${taxa}%`} subtitle="Atendidos nos últimos 7 dias" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4">Atendimentos por bairro (mês atual)</h3>
          {chartBairro.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartBairro} margin={{ bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="bairro" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 11 }} height={70} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="atendimentos" fill="#1D9E75" name="Atendimentos" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-400 text-sm py-12">Sem atendimentos no mês</p>
          )}
        </div>

        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4">Pontos ativos por criticidade</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartCrit}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="criticidade" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="total" fill="#3b82f6" name="Pontos" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-red-700">Pontos sem atendimento há mais de 7 dias</h3>
          <p className="text-xs text-gray-500 mt-1">{semAtendimento.length} ponto(s)</p>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-red-50 text-left">
            <tr>
              <th className="p-3">Endereço</th>
              <th className="p-3">Bairro</th>
              <th className="p-3">Último atendimento</th>
              <th className="p-3">Criticidade</th>
            </tr>
          </thead>
          <tbody>
            {semAtendimento.length === 0 ? (
              <tr><td colSpan={4} className="p-6 text-center text-gray-400">Nenhum ponto nesta situação</td></tr>
            ) : (
              semAtendimento.map((p) => (
                <tr key={p.id} className="border-t bg-red-50/50">
                  <td className="p-3 font-medium text-red-900">{p.endereco}</td>
                  <td className="p-3">{p.bairro}</td>
                  <td className="p-3 text-red-700">{formatDate(p.ultimoAtendimento) || 'Nunca'}</td>
                  <td className="p-3"><BadgeCriticidade criticidade={p.criticidade} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
