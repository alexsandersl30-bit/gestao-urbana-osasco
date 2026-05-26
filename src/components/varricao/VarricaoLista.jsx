import { BadgePlano, BadgeStatus } from './BadgePlano'
import { formatDate } from '../../utils/dates'
import { calcStatusVarricao, FREQUENCIAS, PLANOS, formatKm } from '../../utils/varricao'

export default function VarricaoLista({
  ruas,
  totalRuas,
  totalKm,
  filtroBairro,
  setFiltroBairro,
  filtroPlano,
  setFiltroPlano,
  filtroFrequencia,
  setFiltroFrequencia,
  busca,
  setBusca,
  bairros,
  onNovo,
  onDetalhes,
  canCreate,
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs text-gray-500 block mb-1">Buscar rua</label>
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Nome da rua ou trecho..."
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Bairro</label>
          <select value={filtroBairro} onChange={(e) => setFiltroBairro(e.target.value)} className="border rounded-lg px-3 py-2 text-sm min-w-[130px]">
            <option value="">Todos</option>
            {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Plano</label>
          <select value={filtroPlano} onChange={(e) => setFiltroPlano(e.target.value)} className="border rounded-lg px-3 py-2 text-sm min-w-[120px]">
            <option value="">Todos</option>
            {PLANOS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Frequência</label>
          <select value={filtroFrequencia} onChange={(e) => setFiltroFrequencia(e.target.value)} className="border rounded-lg px-3 py-2 text-sm min-w-[130px]">
            <option value="">Todas</option>
            {FREQUENCIAS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        {canCreate && (
          <button type="button" onClick={onNovo} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm font-medium whitespace-nowrap">
            + Nova rua
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="p-3 font-medium">Rua</th>
              <th className="p-3 font-medium">Bairro</th>
              <th className="p-3 font-medium">Plano</th>
              <th className="p-3 font-medium">Frequência</th>
              <th className="p-3 font-medium">Km</th>
              <th className="p-3 font-medium">Equipe</th>
              <th className="p-3 font-medium">Última varrição</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {ruas.length === 0 ? (
              <tr><td colSpan={9} className="p-8 text-center text-gray-400">Nenhuma rua encontrada</td></tr>
            ) : (
              ruas.map((item) => {
                const status = calcStatusVarricao(item)
                const inativa = item.ativa === false
                return (
                  <tr key={item.id} className={`border-t hover:bg-gray-50/80 ${inativa ? 'opacity-60' : ''}`}>
                    <td className="p-3 font-medium text-gray-800">
                      {item.rua}
                      {inativa && <span className="ml-2 text-xs text-gray-400">(inativa)</span>}
                    </td>
                    <td className="p-3">{item.bairro}</td>
                    <td className="p-3"><BadgePlano plano={item.plano} /></td>
                    <td className="p-3">{item.frequencia}</td>
                    <td className="p-3">{formatKm(item.quilometragem)}</td>
                    <td className="p-3">{item.equipe}</td>
                    <td className="p-3">{formatDate(item.ultimaVarricao)}</td>
                    <td className="p-3"><BadgeStatus status={status} /></td>
                    <td className="p-3">
                      <button type="button" onClick={() => onDetalhes(item.id)} className="text-primary text-sm font-medium hover:underline">
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
          <tfoot className="bg-gray-50 border-t">
            <tr>
              <td colSpan={9} className="p-3 text-sm text-gray-600">
                <strong>{totalRuas}</strong> rua(s) exibida(s) · <strong>{totalKm.toFixed(1)}</strong> km cadastrados no total
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
