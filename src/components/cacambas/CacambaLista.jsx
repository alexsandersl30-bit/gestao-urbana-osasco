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
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs text-gray-500 block mb-1">Buscar endereço</label>
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Digite o endereço..."
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Bairro</label>
          <select value={filtroBairro} onChange={(e) => setFiltroBairro(e.target.value)} className="border rounded-lg px-3 py-2 text-sm min-w-[140px]">
            <option value="">Todos</option>
            {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Status</label>
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="border rounded-lg px-3 py-2 text-sm min-w-[130px]">
            <option value="">Todos</option>
            {STATUS_CACAMBA.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={onNovo}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm font-medium whitespace-nowrap"
          >
            + Nova caçamba
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="p-3 font-medium">Endereço</th>
              <th className="p-3 font-medium">Bairro</th>
              <th className="p-3 font-medium">Frequência</th>
              <th className="p-3 font-medium">Empresa</th>
              <th className="p-3 font-medium">Última coleta</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {cacambas.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">Nenhuma caçamba encontrada</td>
              </tr>
            ) : (
              cacambas.map((item) => {
                const status = calcStatusCacamba(item)
                const inativa = item.ativa === false
                return (
                  <tr key={item.id} className={`border-t hover:bg-gray-50/80 ${inativa ? 'opacity-60' : ''}`}>
                    <td className="p-3 font-medium text-gray-800">
                      {item.endereco}
                      {inativa && <span className="ml-2 text-xs text-gray-400">(inativa)</span>}
                    </td>
                    <td className="p-3">{item.bairro}</td>
                    <td className="p-3">{item.frequencia}</td>
                    <td className="p-3">{item.empresa}</td>
                    <td className="p-3">{formatDate(item.ultimaColeta)}</td>
                    <td className="p-3"><BadgeStatusCacamba status={status} /></td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => onDetalhes(item.id)}
                        className="text-primary text-sm font-medium hover:underline"
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
      <p className="text-xs text-gray-400">{cacambas.length} registro(s) exibido(s)</p>
    </div>
  )
}
