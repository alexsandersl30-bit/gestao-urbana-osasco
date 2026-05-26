import { useState } from 'react'
import { BadgeCriticidade, BadgeStatus } from './BadgeCriticidade'
import { formatDate } from '../../utils/dates'
import { diasSemanaToString } from '../../utils/pontosViciados'
import { canDeletePontosViciados, canManagePontosViciados } from '../../utils/roles'

export default function PontoDetalhes({
  ponto,
  perfil,
  onBack,
  onEdit,
  onAtendimento,
  onDenuncia,
  onResolver,
  onExcluir,
  loadingAction,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const canManage = canManagePontosViciados(perfil)
  const canDelete = canDeletePontosViciados(perfil)
  const historico = [...(ponto.historicoAtendimentos || [])].sort(
    (a, b) => new Date(b) - new Date(a),
  )

  return (
    <div className="space-y-6">
      <button type="button" onClick={onBack} className="text-sm text-primary hover:underline flex items-center gap-1">
        ← Voltar para lista
      </button>

      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <div className="flex flex-wrap justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{ponto.endereco}</h2>
            <p className="text-gray-500">{ponto.bairro}</p>
          </div>
          <div className="flex gap-2">
            <BadgeCriticidade criticidade={ponto.criticidade} />
            <BadgeStatus status={ponto.status} />
          </div>
        </div>

        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
          <div><dt className="text-gray-500">Frequência</dt><dd className="font-medium">{ponto.frequencia}</dd></div>
          <div><dt className="text-gray-500">Dias da semana</dt><dd className="font-medium">{diasSemanaToString(ponto.diasSemana) || '—'}</dd></div>
          <div><dt className="text-gray-500">Responsável</dt><dd className="font-medium">{ponto.responsavel}</dd></div>
          <div><dt className="text-gray-500">Denúncias</dt><dd className="font-medium">{ponto.denuncias ?? 0}</dd></div>
          <div><dt className="text-gray-500">Último atendimento</dt><dd className="font-medium">{formatDate(ponto.ultimoAtendimento)}</dd></div>
          <div><dt className="text-gray-500">Cadastrado em</dt><dd className="font-medium">{formatDate(ponto.dataCadastro)}</dd></div>
          <div className="sm:col-span-2"><dt className="text-gray-500">Descrição</dt><dd className="font-medium mt-1">{ponto.descricao || '—'}</dd></div>
        </dl>

        {ponto.fotos?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Galeria de fotos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {ponto.fotos.map((src, i) => (
                <a key={i} href={src} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border aspect-video">
                  <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Histórico de atendimentos</h3>
          {historico.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhum atendimento registrado</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {historico.map((h, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  {formatDate(h)}
                </li>
              ))}
            </ul>
          )}
        </div>

        {canManage && (
          <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t">
            <button
              type="button"
              disabled={loadingAction || ponto.status === 'Resolvido'}
              onClick={onAtendimento}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50"
            >
              Registrar atendimento
            </button>
            <button
              type="button"
              disabled={loadingAction}
              onClick={onDenuncia}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50"
            >
              Registrar denúncia
            </button>
            {ponto.status !== 'Resolvido' && (
              <button
                type="button"
                disabled={loadingAction}
                onClick={onResolver}
                className="px-4 py-2 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary-light disabled:opacity-50"
              >
                Marcar como resolvido
              </button>
            )}
            <button
              type="button"
              onClick={onEdit}
              className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Editar
            </button>
            {canDelete && (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-600">Confirmar exclusão?</span>
                  <button type="button" onClick={onExcluir} className="px-3 py-1.5 bg-red-600 text-white rounded text-sm">Sim, excluir</button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 border rounded text-sm">Não</button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="px-4 py-2 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50"
                >
                  Excluir
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}
