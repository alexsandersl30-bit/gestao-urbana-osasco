import { formatDate } from '../../utils/dates'
import {
  calcStatusExibicao, diasEmAberto, rowHighlightClass, TIPOS, STATUS_LIST,
} from '../../utils/protocolos156'
import BadgeStatus from './BadgeStatus'

export default function ProtocoloLista({
  protocolos,
  filtroTipo,
  setFiltroTipo,
  filtroStatus,
  setFiltroStatus,
  filtroBairro,
  setFiltroBairro,
  busca,
  setBusca,
  bairros,
  onNovo,
  onDetalhes,
  onImportar,
  canCreate,
  canImport,
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs text-gray-500 block mb-1">Buscar</label>
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Número ou endereço..."
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Tipo</label>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="border rounded-lg px-3 py-2 text-sm min-w-[150px]">
            <option value="">Todos</option>
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Status</label>
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="border rounded-lg px-3 py-2 text-sm min-w-[140px]">
            <option value="">Todos</option>
            {STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Bairro</label>
          <select value={filtroBairro} onChange={(e) => setFiltroBairro(e.target.value)} className="border rounded-lg px-3 py-2 text-sm min-w-[130px]">
            <option value="">Todos</option>
            {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        {canImport && (
          <button type="button" onClick={onImportar} className="px-4 py-2 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary-light whitespace-nowrap">
            Importar Excel
          </button>
        )}
        {canCreate && (
          <button type="button" onClick={onNovo} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium whitespace-nowrap">
            + Novo protocolo
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="p-3 font-medium">Protocolo</th>
              <th className="p-3 font-medium">Tipo</th>
              <th className="p-3 font-medium">Endereço</th>
              <th className="p-3 font-medium">Bairro</th>
              <th className="p-3 font-medium">Abertura</th>
              <th className="p-3 font-medium">Prazo</th>
              <th className="p-3 font-medium">Dias em aberto</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {protocolos.length === 0 ? (
              <tr><td colSpan={9} className="p-8 text-center text-gray-400">Nenhum protocolo encontrado</td></tr>
            ) : (
              protocolos.map((p) => {
                const status = calcStatusExibicao(p)
                return (
                  <tr key={p.id} className={`border-t hover:bg-gray-50/80 ${rowHighlightClass(p)}`}>
                    <td className="p-3 font-medium">{p.numero}</td>
                    <td className="p-3">{p.tipo}</td>
                    <td className="p-3">{p.endereco}</td>
                    <td className="p-3">{p.bairro}</td>
                    <td className="p-3">{formatDate(p.dataAbertura)}</td>
                    <td className="p-3">{formatDate(p.prazo)}</td>
                    <td className="p-3 text-center">{diasEmAberto(p)}</td>
                    <td className="p-3"><BadgeStatus status={status} /></td>
                    <td className="p-3">
                      <button type="button" onClick={() => onDetalhes(p.id)} className="text-primary text-sm font-medium hover:underline">
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
    </div>
  )
}
