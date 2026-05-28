import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { useCollection } from '../hooks/useCollection'
import { COLLECTIONS } from '../firebase/db'
import Loading from '../components/Loading'
import { calcStatusCacamba } from '../utils/cacambas'
import { kmValue } from '../utils/varricao'
import { semAtendimento7Dias } from '../utils/pontosViciados'
import { calcStatusExibicao, isConcluido } from '../utils/protocolos156'

const COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

function StatCard({ title, value, subtitle, alert, link, icon }) {
  const content = (
    <div className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow ${alert ? 'border-[#FECACA]' : 'border-[#E5E7EB]'}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-1">{title}</p>
          <p className={`text-3xl font-bold ${alert ? 'text-[#DC2626]' : 'text-[#111827]'}`}>{value}</p>
          {subtitle && <p className="text-xs text-[#9CA3AF] mt-1">{subtitle}</p>}
        </div>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
    </div>
  )
  if (link) return <Link to={link}>{content}</Link>
  return content
}

export default function Dashboard() {
  const { data: pontos, loading: l1 } = useCollection(COLLECTIONS.PONTOS)
  const { data: cacambas, loading: l2 } = useCollection(COLLECTIONS.CACAMBAS)
  const { data: varricao, loading: l3 } = useCollection(COLLECTIONS.VARRICAO)
  const { data: protocolos, loading: l4 } = useCollection(COLLECTIONS.PROTOCOLOS)
  const { data: ecopontos, loading: l5 } = useCollection(COLLECTIONS.ECOPONTOS)
  const { data: vistorias, loading: l6 } = useCollection(COLLECTIONS.VISTORIAS)

  const loading = l1 || l2 || l3 || l4 || l5 || l6

  const metrics = useMemo(() => {
    // Pontos viciados
    const pontosAtivos = pontos.filter(p => (p.status || 'Ativo') === 'Ativo').length
    const pontosCriticos = pontos.filter(p =>
      (p.criticidade === 'Crítico' || semAtendimento7Dias(p)) && (p.status || 'Ativo') === 'Ativo'
    ).length
    const totalDenuncias = pontos.reduce((s, p) => s + (Number(p.denuncias) || 0), 0)

    // Caçambas
    const cacambasAtivas = cacambas.filter(c => c.ativa !== false).length
    const cacambasAtrasadas = cacambas.filter(c =>
      c.ativa !== false && calcStatusCacamba(c) === 'Atrasada'
    ).length

    // Varrição
    const kmTotal = varricao.reduce((s, v) => s + kmValue(v.quilometragem), 0)
    const ruasAtivas = varricao.filter(v => v.ativa !== false).length

    // Protocolos
    const protocolosAbertos = protocolos.filter(p => !isConcluido(p)).length
    const protocolosVencidos = protocolos.filter(p => calcStatusExibicao(p) === 'Vencido').length
    const protocolosConcluidos = protocolos.filter(p => isConcluido(p)).length
    const taxaResolucao = protocolos.length > 0
      ? Math.round((protocolosConcluidos / protocolos.length) * 100)
      : 0

    // Ecopontos
    const totalEcopontos = ecopontos.length
    const conformidadeMedia = vistorias.length > 0
      ? Math.round(vistorias.reduce((s, v) => s + (Number(v.conformidade) || 0), 0) / vistorias.length)
      : 0

    // Total alertas (número único)
    const totalAlertas = pontosCriticos + cacambasAtrasadas + protocolosVencidos

    // Gráfico protocolos por tipo
    const porTipo = protocolos.reduce((acc, p) => {
      acc[p.tipo] = (acc[p.tipo] || 0) + 1
      return acc
    }, {})
    const chartTipo = Object.entries(porTipo).map(([name, value]) => ({ name, value }))

    // Gráfico varrição por frequência
    const chartVarricao = [
      { name: 'Diária', value: varricao.filter(v => v.frequencia === 'Diária').length, fill: '#16a34a' },
      { name: 'Seg/Qua/Sex', value: varricao.filter(v => v.frequencia === '3x/semana').length, fill: '#3b82f6' },
      { name: 'Ter/Qui/Sáb', value: varricao.filter(v => v.frequencia === '2x/semana').length, fill: '#f59e0b' },
    ]

    // Gráfico caçambas por status
    const chartCacambas = [
      { name: 'Em dia', value: cacambas.filter(c => c.ativa !== false && calcStatusCacamba(c) === 'Em dia').length, fill: '#16a34a' },
      { name: 'Atenção', value: cacambas.filter(c => c.ativa !== false && calcStatusCacamba(c) === 'Atenção').length, fill: '#f59e0b' },
      { name: 'Atrasada', value: cacambasAtrasadas, fill: '#ef4444' },
    ]

    return {
      pontosAtivos, pontosCriticos, totalDenuncias,
      cacambasAtivas, cacambasAtrasadas,
      kmTotal, ruasAtivas,
      protocolosAbertos, protocolosVencidos, taxaResolucao,
      totalEcopontos, conformidadeMedia,
      totalAlertas, chartTipo, chartVarricao, chartCacambas,
    }
  }, [pontos, cacambas, varricao, protocolos, ecopontos, vistorias])

  if (loading) return <Loading />

  return (
    <div className="space-y-6">

      {/* Cabeçalho */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Osasco Urbana" className="h-14 w-auto object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">Osasco Urbana</h1>
            <p className="text-[#6B7280] text-sm mt-0.5">Gestão Inteligente da Cidade — Diretoria de Limpeza Urbana</p>
          </div>
        </div>
      </div>

      {/* Alerta consolidado */}
      {metrics.totalAlertas > 0 && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-[#FEE2E2] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <p className="font-semibold text-[#991B1B] text-lg">
              {metrics.totalAlertas} {metrics.totalAlertas === 1 ? 'alerta ativo' : 'alertas ativos'} no sistema
            </p>
            <p className="text-sm text-[#B91C1C] mt-0.5">
              {metrics.pontosCriticos > 0 && `${metrics.pontosCriticos} ponto(s) crítico(s)`}
              {metrics.pontosCriticos > 0 && metrics.cacambasAtrasadas > 0 && ' · '}
              {metrics.cacambasAtrasadas > 0 && `${metrics.cacambasAtrasadas} caçamba(s) atrasada(s)`}
              {metrics.protocolosVencidos > 0 && (metrics.pontosCriticos > 0 || metrics.cacambasAtrasadas > 0) && ' · '}
              {metrics.protocolosVencidos > 0 && `${metrics.protocolosVencidos} protocolo(s) vencido(s)`}
            </p>
          </div>
          <Link to="/pontos-viciados" className="ml-auto text-sm text-[#991B1B] hover:underline font-medium whitespace-nowrap">
            Ver detalhes →
          </Link>
        </div>
      )}

      {/* Cards principais */}
      <div>
        <h2 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Pontos Viciados</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total ativo" value={metrics.pontosAtivos} icon="📍" link="/pontos-viciados" />
          <StatCard title="Críticos" value={metrics.pontosCriticos} alert={metrics.pontosCriticos > 0} icon="🔴" link="/pontos-viciados" />
          <StatCard title="Denúncias totais" value={metrics.totalDenuncias} icon="📣" link="/pontos-viciados" />
          <StatCard title="Ecopontos / PEVs" value={metrics.totalEcopontos} icon="♻️" link="/ecopontos" />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Caçambas & Varrição</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Caçambas ativas" value={metrics.cacambasAtivas} icon="🚧" link="/cacambas" />
          <StatCard title="Coletas atrasadas" value={metrics.cacambasAtrasadas} alert={metrics.cacambasAtrasadas > 0} icon="⏰" link="/cacambas" />
          <StatCard title="Km varrição" value={`${metrics.kmTotal.toFixed(1)} km`} subtitle="Total cadastrado" icon="🧹" link="/varricao" />
          <StatCard title="Ruas cadastradas" value={metrics.ruasAtivas} icon="🛣️" link="/varricao" />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wide mb-3">Protocolos 156 & Ecopontos</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Protocolos abertos" value={metrics.protocolosAbertos} alert={metrics.protocolosAbertos > 0} icon="📋" link="/protocolos-156" />
          <StatCard title="Vencidos" value={metrics.protocolosVencidos} alert={metrics.protocolosVencidos > 0} icon="❌" link="/protocolos-156" />
          <StatCard title="Taxa de resolução" value={`${metrics.taxaResolucao}%`} subtitle="Protocolos concluídos" icon="✅" link="/protocolos-156" />
          <StatCard title="Conformidade média" value={`${metrics.conformidadeMedia}%`} subtitle="Vistorias ecopontos" icon="📊" link="/ecopontos" />
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid lg:grid-cols-3 gap-6">

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-semibold text-[#111827] mb-4">Protocolos por tipo</h3>
          {metrics.chartTipo.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={metrics.chartTipo} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {metrics.chartTipo.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-[#6B7280] text-sm text-center py-8">Nenhum protocolo</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-semibold text-[#111827] mb-4">Varrição por frequência</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={metrics.chartVarricao} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" name="Ruas" radius={[4, 4, 0, 0]}>
                {metrics.chartVarricao.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm">
          <h3 className="font-semibold text-[#111827] mb-4">Status das caçambas</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={metrics.chartCacambas} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" name="Caçambas" radius={[4, 4, 0, 0]}>
                {metrics.chartCacambas.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  )
}