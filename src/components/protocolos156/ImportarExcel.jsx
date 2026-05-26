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
        <p className="text-sm text-gray-600">
          Colunas esperadas: Número, Tipo, Endereço, Bairro, Data abertura, Prazo, Status, Descrição (opcional: Responsável)
        </p>
        <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="text-sm" />
        {loading && <p className="text-sm text-primary">Processando arquivo...</p>}
        {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

        {preview.length > 0 && (
          <>
            <p className="text-sm font-medium text-gray-700">{preview.length} registro(s) para importar — preview:</p>
            <div className="max-h-64 overflow-auto border rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Nº</th>
                    <th className="p-2 text-left">Tipo</th>
                    <th className="p-2 text-left">Endereço</th>
                    <th className="p-2 text-left">Bairro</th>
                    <th className="p-2 text-left">Prazo</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 50).map((row, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{row.numero}</td>
                      <td className="p-2">{row.tipo}</td>
                      <td className="p-2">{row.endereco}</td>
                      <td className="p-2">{row.bairro}</td>
                      <td className="p-2">{formatDate(row.prazo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 50 && <p className="text-xs text-gray-400 p-2">… e mais {preview.length - 50} linhas</p>}
            </div>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={importing}
              className="w-full py-2.5 bg-primary text-white rounded-lg font-medium disabled:opacity-60"
            >
              {importing ? 'Importando...' : `Confirmar importação (${preview.length})`}
            </button>
          </>
        )}
      </div>
    </Modal>
  )
}
