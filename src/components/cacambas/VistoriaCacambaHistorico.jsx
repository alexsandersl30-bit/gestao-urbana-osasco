import { useMemo, useState } from 'react'
import Modal from '../Modal'
import { getConformidadeBadgeClass, CRITERIOS_VISTORIA } from '../../utils/vistoriaCacambas'
import { exportarLaudoPDFCacamba } from '../../utils/pdfLaudoCacamba'

export default function VistoriaCacambaHistorico({
  vistorias,
  cacambas,
}) {
  const [selectedVistoria, setSelectedVistoria] = useState(null)
  const [filtroCacamba, setFiltroCacamba] = useState('')
  const [filtroBairro, setFiltroBairro] = useState('')

  const bairros = useMemo(
    () => [...new Set(cacambas.map((c) => c.bairro).filter(Boolean))].sort(),
    [cacambas],
  )

  const cacambasList = useMemo(
    () =>
      cacambas
        .map((c) => ({
          ...c,
          ultimaVistoria: vistorias.find((v) => v.cacambaId === c.id),
        }))
        .filter((c) => c.ativa !== false),
    [cacambas, vistorias],
  )

  const filtered = useMemo(() => {
    return cacambasList
      .filter((c) => {
        if (filtroCacamba && c.id !== filtroCacamba) return false
        if (filtroBairro && c.bairro !== filtroBairro) return false
        return true
      })
      .map((c) => ({
        ...c,
        vistoriasItem: vistorias.filter((v) => v.cacambaId === c.id).sort((a, b) => {
          const dataA = new Date(a.dataVisita)
          const dataB = new Date(b.dataVisita)
          return dataB - dataA
        }),
      }))
  }, [cacambasList, vistorias, filtroCacamba, filtroBairro])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Filtrar por caçamba</label>
          <select
            value={filtroCacamba}
            onChange={(e) => setFiltroCacamba(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Todas as caçambas</option>
            {cacambasList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.endereco} — {c.bairro}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Filtrar por bairro</label>
          <select
            value={filtroBairro}
            onChange={(e) => setFiltroBairro(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Todos os bairros</option>
            {bairros.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Endereço</th>
              <th className="p-3">Bairro</th>
              <th className="p-3">Fiscal</th>
              <th className="p-3">Data</th>
              <th className="p-3">Conformidade</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  Nenhuma vistoria encontrada
                </td>
              </tr>
            ) : (
              filtered.map((cacamba) =>
                cacamba.vistoriasItem.length > 0 ? (
                  cacamba.vistoriasItem.map((vistoria, idx) => (
                    <tr key={`${cacamba.id}-${idx}`} className={idx > 0 ? 'bg-gray-25' : 'border-t'}>
                      {idx === 0 && (
                        <td rowSpan={cacamba.vistoriasItem.length} className="p-3 font-medium">
                          {cacamba.endereco}
                        </td>
                      )}
                      {idx === 0 && (
                        <td rowSpan={cacamba.vistoriasItem.length} className="p-3">
                          {cacamba.bairro}
                        </td>
                      )}
                      <td className="p-3">{vistoria.fiscal || '—'}</td>
                      <td className="p-3">
                        {new Date(vistoria.dataVisita).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${getConformidadeBadgeClass(vistoria.conformidade || 0)}`}>
                          {vistoria.conformidade ?? 0}%
                        </span>
                      </td>
                      <td className="p-3 space-x-2">
                        <button
                          type="button"
                          onClick={() => setSelectedVistoria(vistoria)}
                          className="text-blue-600 hover:underline text-xs font-medium"
                        >
                          Ver detalhes
                        </button>
                        <button
                          type="button"
                          onClick={() => exportarLaudoPDFCacamba(vistoria, cacamba)}
                          className="text-green-600 hover:underline text-xs font-medium"
                        >
                          Exportar PDF
                        </button>
                      </td>
                    </tr>
                  ))
                ) : null,
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalhes */}
      {selectedVistoria && (
        <Modal open={!!selectedVistoria} onClose={() => setSelectedVistoria(null)} title="Detalhes da Vistoria">
          <div className="space-y-6 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 uppercase">Caçamba</p>
                <p className="font-medium text-gray-800">{selectedVistoria.cacambaEndereco}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase">Bairro</p>
                <p className="font-medium text-gray-800">{selectedVistoria.cacambaBairro}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase">Fiscal</p>
                <p className="font-medium text-gray-800">{selectedVistoria.fiscal || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase">Data</p>
                <p className="font-medium text-gray-800">
                  {new Date(selectedVistoria.dataVisita).toLocaleDateString('pt-BR')} {selectedVistoria.horario}
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-gray-600 uppercase mb-1">Conformidade</p>
              <p className={`text-2xl font-bold ${selectedVistoria.conformidade >= 80 ? 'text-green-700' : selectedVistoria.conformidade >= 60 ? 'text-amber-700' : 'text-red-700'}`}>
                {selectedVistoria.conformidade ?? 0}%
              </p>
            </div>

            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="p-2 text-left">Critério</th>
                  <th className="p-2 text-left">Condição</th>
                  <th className="p-2 text-left">Obs</th>
                </tr>
              </thead>
              <tbody>
                {CRITERIOS_VISTORIA.map((criterio) => {
                  const value = selectedVistoria[criterio.id]
                  return (
                    <tr key={criterio.id} className="border-b">
                      <td className="p-2">{criterio.label}</td>
                      <td className="p-2 font-medium">{value?.condicao || '—'}</td>
                      <td className="p-2 text-gray-600">{value?.obs || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {selectedVistoria.problemaMaisFrequente && (
              <div>
                <p className="text-xs text-gray-600 uppercase mb-2">Problema mais frequente</p>
                <p className="text-sm text-gray-800 bg-yellow-50 p-2 rounded border border-yellow-200">
                  {selectedVistoria.problemaMaisFrequente}
                </p>
              </div>
            )}

            {selectedVistoria.fotos && selectedVistoria.fotos.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 uppercase mb-2">Fotos ({selectedVistoria.fotos.length})</p>
                <div className="grid grid-cols-3 gap-2">
                  {selectedVistoria.fotos.map((foto, idx) => (
                    <img key={idx} src={foto} alt={`Foto ${idx + 1}`} className="w-full h-24 object-cover rounded border" />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-4 border-t pt-4">
            <button
              type="button"
              onClick={() => exportarLaudoPDFCacamba(selectedVistoria, cacambas.find((c) => c.id === selectedVistoria.cacambaId))}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Exportar PDF
            </button>
            <button
              type="button"
              onClick={() => setSelectedVistoria(null)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Fechar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
