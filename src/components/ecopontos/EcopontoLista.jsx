import { formatDate } from '../../utils/dates'
import { boolLabel } from '../../utils/ecopontos'
import BadgeConformidade from './BadgeConformidade'
import { TIPOS } from '../../utils/ecopontos'

export default function EcopontoLista({
  ecopontos,
  ultimaPorEcoponto,
  filtroTipo,
  setFiltroTipo,
  filtroBairro,
  setFiltroBairro,
  bairros,
  onNovo,
  onDetalhes,
  canCreate,
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Tipo</label>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="border rounded-lg px-3 py-2 text-sm min-w-[140px]">
            <option value="">Todos</option>
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Bairro</label>
          <select value={filtroBairro} onChange={(e) => setFiltroBairro(e.target.value)} className="border rounded-lg px-3 py-2 text-sm min-w-[140px]">
            <option value="">Todos</option>
            {bairros.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        {canCreate && (
          <button type="button" onClick={onNovo} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm font-medium">
            + Novo ecoponto
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="p-3 font-medium">Nome</th>
              <th className="p-3 font-medium">Tipo</th>
              <th className="p-3 font-medium">Bairro</th>
              <th className="p-3 font-medium">Inaugurado</th>
              <th className="p-3 font-medium">EPI</th>
              <th className="p-3 font-medium">Última vistoria</th>
              <th className="p-3 font-medium">Conformidade</th>
              <th className="p-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {ecopontos.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-gray-400">Nenhum ecoponto cadastrado</td></tr>
            ) : (
              ecopontos.map((eco) => {
                const ult = ultimaPorEcoponto[eco.id]
                return (
                  <tr key={eco.id} className={`border-t hover:bg-gray-50/80 ${eco.ativo === false ? 'opacity-60' : ''}`}>
                    <td className="p-3 font-medium">{eco.nome}</td>
                    <td className="p-3"><span className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded">{eco.tipo}</span></td>
                    <td className="p-3">{eco.bairro}</td>
                    <td className="p-3">{boolLabel(eco.inaugurado)}</td>
                    <td className="p-3">{boolLabel(eco.epi)}</td>
                    <td className="p-3">{ult ? formatDate(ult.dataVisita) : '—'}</td>
                    <td className="p-3"><BadgeConformidade value={ult?.conformidade} /></td>
                    <td className="p-3">
                      <button type="button" onClick={() => onDetalhes(eco.id)} className="text-primary text-sm font-medium hover:underline">
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
