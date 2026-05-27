import { useState } from 'react'
import { formatDate } from '../../utils/dates'
import {
  calcStatusExibicao, diasEmAberto, isConcluido, STATUS_STORED,
} from '../../utils/protocolos156'
import BadgeStatus from './BadgeStatus'
import { canDeleteProtocolos, canManageProtocolos } from '../../utils/roles'

export default function ProtocoloDetalhes({
  protocolo,
  perfil,
  userEmail,
  onBack,
  onEdit,
  onAtualizarStatus,
  onConcluir,
  onExcluir,
  loadingAction,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showStatusForm, setShowStatusForm] = useState(false)
  const [novoStatus, setNovoStatus] = useState(protocolo.status || 'Aberto')
  const [obsStatus, setObsStatus] = useState('')

  const canManage = canManageProtocolos(perfil)
  const canDelete = canDeleteProtocolos(perfil)
  const statusExib = calcStatusExibicao(protocolo)
  const historico = [...(protocolo.historicoStatus || [])].sort(
    (a, b) => new Date(b.data) - new Date(a.data),
  )

  const handleStatusUpdate = () => {
    onAtualizarStatus(novoStatus, obsStatus, userEmail)
    setShowStatusForm(false)
    setObsStatus('')
  }

  return (
    <div className="space-y-6">
      <button type="button" onClick={onBack} className="text-sm text-green-600 hover:underline">← Voltar</button>

      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <div className="flex flex-wrap justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold">Protocolo {protocolo.numero}</h2>
            <p className="text-gray-500 text-sm">{protocolo.tipo}</p>
          </div>
          <BadgeStatus status={statusExib} />
        </div>

        <dl className="grid sm:grid-cols-2 gap-4 text-sm mb-6">
          <div><dt className="text-gray-500">Endereço</dt><dd className="font-medium">{protocolo.endereco}</dd></div>
          <div><dt className="text-gray-500">Bairro</dt><dd className="font-medium">{protocolo.bairro}</dd></div>
          <div><dt className="text-gray-500">Abertura</dt><dd className="font-medium">{formatDate(protocolo.dataAbertura)}</dd></div>
          <div><dt className="text-gray-500">Prazo</dt><dd className="font-medium">{formatDate(protocolo.prazo)}</dd></div>
          <div><dt className="text-gray-500">Dias em aberto</dt><dd className="font-medium">{diasEmAberto(protocolo)}</dd></div>
          <div><dt className="text-gray-500">Responsável</dt><dd className="font-medium">{protocolo.responsavel}</dd></div>
          {protocolo.dataConclusao && (
            <div><dt className="text-gray-500">Conclusão</dt><dd className="font-medium">{formatDate(protocolo.dataConclusao)}</dd></div>
          )}
          <div className="sm:col-span-2"><dt className="text-gray-500">Descrição</dt><dd className="font-medium mt-1">{protocolo.descricao || '—'}</dd></div>
        </dl>

        {protocolo.fotos?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Fotos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {protocolo.fotos.map((src, i) => (
                <a key={i} href={src} target="_blank" rel="noreferrer" className="rounded-lg overflow-hidden border aspect-video">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Histórico de status</h3>
          {historico.length === 0 ? (
            <p className="text-sm text-gray-400">Sem atualizações registradas</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {historico.map((h, i) => (
                <li key={i} className="border rounded-lg p-3 bg-gray-50/50">
                  <div className="flex justify-between gap-2">
                    <BadgeStatus status={h.status} />
                    <span className="text-gray-500">{formatDate(h.data)}</span>
                  </div>
                  <p className="text-gray-600 mt-1">{h.responsavel}</p>
                  {h.observacao && <p className="text-gray-500 mt-1">{h.observacao}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>

        {canManage && (
          <div className="space-y-4 pt-4 border-t">
            {!isConcluido(protocolo) && (
              <>
                {!showStatusForm ? (
                  <button type="button" onClick={() => setShowStatusForm(true)} className="bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm border border-gray-200 transition-colors">
                    Atualizar status
                  </button>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3 max-w-md">
                    <select value={novoStatus} onChange={(e) => setNovoStatus(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
                      {STATUS_STORED.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <textarea value={obsStatus} onChange={(e) => setObsStatus(e.target.value)} placeholder="Observação" rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" />
                    <div className="flex gap-2">
                      <button type="button" onClick={handleStatusUpdate} disabled={loadingAction} className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">Salvar</button>
                      <button type="button" onClick={() => setShowStatusForm(false)} className="bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm border border-gray-200 transition-colors">Cancelar</button>
                    </div>
                  </div>
                )}
                <button type="button" onClick={onConcluir} disabled={loadingAction} className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">
                  Marcar como concluído
                </button>
              </>
            )}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={onEdit} className="bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm border border-gray-200 transition-colors">Editar</button>
              {canDelete && (
                confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-red-600">Confirmar exclusão?</span>
                    <button type="button" onClick={onExcluir} className="bg-red-50 hover:bg-red-100 text-red-700 font-medium px-3 py-1.5 rounded-lg text-sm border border-red-200 transition-colors">Sim</button>
                    <button type="button" onClick={() => setConfirmDelete(false)} className="bg-white hover:bg-gray-50 text-gray-700 font-medium px-3 py-1.5 rounded-lg text-sm border border-gray-200 transition-colors">Não</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setConfirmDelete(true)} className="bg-red-50 hover:bg-red-100 text-red-700 font-medium px-4 py-2 rounded-lg text-sm border border-red-200 transition-colors">Excluir</button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
