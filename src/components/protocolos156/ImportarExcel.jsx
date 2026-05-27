import { useState } from 'react'
import Modal from '../Modal'
import { parseExcelProtocolos } from '../../utils/importarExcelProtocolos'
import { formatDate } from '../../utils/dates'

export default function ImportarExcel({ open, onClose, onConfirm }) {
  const [preview, setPreview] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setLoading(true)
    try {
      const rows = await parseExcelProtocolos(file)
      setPreview(rows)
      if (!rows.length) setError('Nenhuma linha válida encontrada na planilha.')
    } catch (err) {
      setError(err.message || 'Erro ao processar planilha')
      setPreview([])
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  const handleConfirm = async () => {
    setImporting(true)
    try {
      await onConfirm(preview)
      setPreview([])
      onClose()
    } catch (err) {
      setError(err.message || 'Erro na importação')
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    setPreview([])
    setError('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Importar protocolos (Excel)" wide>
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-900 font-medium">Colunas esperadas na planilha:</p>
          <p className="text-xs text-blue-800 mt-1">
            Número • Tipo • Endereço • Bairro • Data abertura • Prazo • Status • Descrição • (opcional: Responsável, Telefone, Email)
          </p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Selecione o arquivo Excel</label>
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="text-sm block w-full" />
        </div>
        
        {loading && (
          <div className="flex items-center gap-2 text-primary">
            <div className="animate-spin">⌛</div>
            <p className="text-sm">Processando arquivo...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800 font-medium">Erro:</p>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        )}

        {preview.length > 0 && (
          <>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm font-medium text-green-900">✓ {preview.length} registro(s) para importar</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Preview dos dados:</p>
              <div className="max-h-80 overflow-auto border rounded-lg bg-gray-50">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-gray-200 sticky top-0">
                    <tr>
                      <th className="border p-2 text-left">Protocolo</th>
                      <th className="border p-2 text-left">Tipo</th>
                      <th className="border p-2 text-left">Endereço</th>
                      <th className="border p-2 text-left">Bairro</th>
                      <th className="border p-2 text-left">Data Abertura</th>
                      <th className="border p-2 text-left">Prazo</th>
                      <th className="border p-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 20).map((row, i) => (
                      <tr key={i} className="hover:bg-gray-100">
                        <td className="border p-2">{row.numero}</td>
                        <td className="border p-2">{row.tipo}</td>
                        <td className="border p-2 truncate max-w-xs">{row.endereco}</td>
                        <td className="border p-2">{row.bairro}</td>
                        <td className="border p-2">{formatDate(row.dataAbertura)}</td>
                        <td className="border p-2">{formatDate(row.prazo)}</td>
                        <td className="border p-2"><span className="px-2 py-0.5 rounded text-xs bg-gray-200">{row.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {preview.length > 20 && (
                <p className="text-xs text-gray-500 mt-1">… mostrando 20 de {preview.length} registros</p>
              )}
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-900">
                ⚠️ Revise os dados acima antes de confirmar. Não será possível desfazer a importação de uma vez.
              </p>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={importing}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {importing ? '⌛ Importando...' : `✓ Confirmar importação (${preview.length} registros)`}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={importing}
                className="px-6 py-3 border rounded-lg font-medium text-sm hover:bg-gray-50 disabled:opacity-60 transition"
              >
                Cancelar
              </button>
            </div>
          </>
        )}
        
        {!preview.length && !loading && !error && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Nenhum arquivo selecionado</p>
            <p className="text-xs mt-1">Clique em "Selecione o arquivo Excel" para começar</p>
          </div>
        )}
      </div>
    </Modal>
  )
}
