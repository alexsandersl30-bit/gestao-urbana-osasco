import { useState } from 'react'
import { formatDate } from '../../utils/dates'
import { boolLabel } from '../../utils/ecopontos'
import BadgeConformidade from './BadgeConformidade'
import { exportarLaudoPDF } from '../../utils/pdfLaudo'
import { canDeleteEcopontos, canManageEcopontos } from '../../utils/roles'

export default function EcopontoDetalhes({
  ecoponto,
  vistorias,
  perfil,
  onBack,
  onEdit,
  onNovaVistoria,
  onExcluir,
  onExcluirVistoria,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmDeleteVistoria, setConfirmDeleteVistoria] = useState(null)
  const canManage = canManageEcopontos(perfil)
  const canDelete = canDeleteEcopontos(perfil)
  const historico = [...vistorias].sort((a, b) => new Date(b.dataVisita) - new Date(a.dataVisita))

  return (
    <div className="space-y-6">
      <button type="button" onClick={onBack} className="text-sm text-primary hover:underline">← Voltar</button>

      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <div className="flex flex-wrap justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{ecoponto.nome}</h2>
            <span className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded">{ecoponto.tipo}</span>
            <p className="text-gray-500 text-sm mt-2">{ecoponto.endereco}, {ecoponto.bairro}</p>
          </div>
        </div>

        <dl className="grid sm:grid-cols-2 gap-4 text-sm mb-6">
          <div><dt className="text-gray-500">Inaugurado</dt><dd className="font-medium">{boolLabel(ecoponto.inaugurado)}</dd></div>
          <div><dt className="text-gray-500">EPI</dt><dd className="font-medium">{boolLabel(ecoponto.epi)}</dd></div>
          <div><dt className="text-gray-500">Horário</dt><dd className="font-medium">{ecoponto.horario}</dd></div>
          <div><dt className="text-gray-500">Contato</dt><dd className="font-medium">{ecoponto.contato}</dd></div>
          <div><dt className="text-gray-500">Coordenadas</dt><dd className="font-medium">{ecoponto.coordenadas || '—'}</dd></div>
          <div><dt className="text-gray-500">Cadastrado em</dt><dd className="font-medium">{formatDate(ecoponto.dataCadastro)}</dd></div>
        </dl>

        {ecoponto.fotos?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Galeria</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ecoponto.fotos.map((src, i) => (
                <a key={i} href={src} target="_blank" rel="noreferrer" className="rounded-lg overflow-hidden border aspect-video">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Histórico de vistorias</h3>
          {historico.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhuma vistoria</p>
          ) : (
            <ul className="space-y-2">
              {historico.map((v) => (
                <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 border rounded-lg p-3 text-sm">
                  <div>
                    <span className="font-medium">{formatDate(v.dataVisita)}</span>
                    <span className="text-gray-500 ml-2">— {v.fiscal}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BadgeConformidade value={v.conformidade} />
                    <button type="button" onClick={() => exportarLaudoPDF(v, ecoponto)} className="text-xs text-primary hover:underline">PDF</button>
                    {canManage && (
                      confirmDeleteVistoria === v.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onExcluirVistoria(v.id)}
                            className="text-xs text-red-600 hover:underline font-medium"
                          >
                            Confirmar
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteVistoria(null)}
                            className="text-xs text-gray-500 hover:underline"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteVistoria(v.id)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Deletar
                        </button>
                      )
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {canManage && (
          <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t">
            <button type="button" onClick={onNovaVistoria} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark">
              Nova vistoria
            </button>
            <button type="button" onClick={onEdit} className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50">Editar</button>
            {canDelete && (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-600">Confirmar exclusão do ecoponto e vistorias?</span>
                  <button type="button" onClick={onExcluir} className="px-3 py-1.5 bg-red-600 text-white rounded text-sm">Sim</button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 border rounded text-sm">Não</button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmDelete(true)} className="px-4 py-2 text-red-600 border border-red-200 rounded-lg text-sm hover:bg-red-50">Excluir</button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}
