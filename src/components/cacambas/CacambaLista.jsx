import BadgeStatusCacamba from './BadgeStatus'
import { formatDate } from '../../utils/dates'
import { calcStatusCacamba, STATUS_CACAMBA } from '../../utils/cacambas'

export default function CacambaLista({
  cacambas,
  filtroBairro,
  setFiltroBairro,
  filtroStatus,
  setFiltroStatus,
  busca,
  setBusca,
  bairros,
  onNovo,
  onDetalhes,
  canCreate,
}) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-md">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-gray-600 font-medium block mb-1">Buscar endereço</label>
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Digite o endereço..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 font-medium block mb-1">Bairro</label>
            <select value={filtroBairro} onChange={(e) => setFiltroBairro(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[140px] focus:ring-2 focus:ring-primary focus:border-primary outline-none">
              <option value="">Todos</option>
              {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-600 font-medium block mb-1">Status</label>
            <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[130px] focus:ring-2 focus:ring-primary focus:border-primary outline-none">
              <option value="">Todos</option>
              {STATUS_CACAMBA.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {canCreate && (
            <button
              type="button"
              onClick={onNovo}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap"
            >
              + Nova caçamba
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto shadow-md">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 text-left text-gray-700">
            <tr>
              <th className="p-3 font-semibold">Endereço</th>
              <th className="p-3 font-semibold">Bairro</th>
              <th className="p-3 font-semibold">Frequência</th>
              <th className="p-3 font-semibold">Empresa</th>
              <th className="p-3 font-semibold">Última coleta</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {cacambas.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">Nenhuma caçamba encontrada</td>
              </tr>
            ) : (
              cacambas.map((item) => {
                const status = calcStatusCacamba(item)
                const inativa = item.ativa === false
                return (
                  <tr key={item.id} className={`border-t border-gray-100 hover:bg-primary-light/50 transition-colors ${inativa ? 'opacity-60' : ''}`}>
                    <td className="p-3 font-medium text-gray-800">
                      {item.endereco}
                      {inativa && <span className="ml-2 text-xs text-gray-400">(inativa)</span>}
                    </td>
                    <td className="p-3 text-gray-700">{item.bairro}</td>
                    <td className="p-3 text-gray-700">{item.frequencia}</td>
                    <td className="p-3 text-gray-700">{item.empresa}</td>
                    <td className="p-3 text-gray-700">{formatDate(item.ultimaColeta)}</td>
                    <td className="p-3"><BadgeStatusCacamba status={status} /></td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => onDetalhes(item.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-xs transition-colors"
                      >
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 font-medium">{cacambas.length} registro(s) exibido(s)</p>
    </div>
  )
}
