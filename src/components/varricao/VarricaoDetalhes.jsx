import { useState } from 'react'
import { BadgePlano, BadgeStatus } from './BadgePlano'
import { formatDate } from '../../utils/dates'
import { calcStatusVarricao, normalizePlano, formatKm } from '../../utils/varricao'
import { canDeleteVarricao, canManageVarricao } from '../../utils/roles'

export default function VarricaoDetalhes({
  rua,
  historico,
  historicoLoading,
  perfil,
  onBack,
  onEdit,
  onRegistrar,
  onDesativar,
  onExcluir,
  loadingAction,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmDesativar, setConfirmDesativar] = useState(false)
  const canManage = canManageVarricao(perfil)
  const canDelete = canDeleteVarricao(perfil)
  const status = calcStatusVarricao(rua)

  return (
    <div className="space-y-6">
      <button type="button" onClick={onBack} className="text-sm text-primary hover:underline">← Voltar para lista</button>

      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <div className="flex flex-wrap justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{rua.rua}</h2>
            <p className="text-gray-500">{rua.bairro}</p>
          </div>
          <div className="flex gap-2 items-center">
            <BadgePlano plano={rua.plano} />
            <BadgeStatus status={status} />
            {rua.ativa === false && <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-600">Inativa</span>}
          </div>
        </div>

        <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div><dt className="text-gray-500">Frequência</dt><dd className="font-medium">{rua.frequencia}</dd></div>
          <div><dt className="text-gray-500">Plano</dt><dd className="font-medium">{normalizePlano(rua.plano)}</dd></div>
          <div><dt className="text-gray-500">Quilometragem</dt><dd className="font-medium">{formatKm(rua.quilometragem)} km</dd></div>
          <div><dt className="text-gray-500">Meta mensal</dt><dd className="font-medium">{Number(rua.metaMensal || 0).toFixed(1)} km</dd></div>
          <div><dt className="text-gray-500">Equipe</dt><dd className="font-medium">{rua.equipe}</dd></div>
          <div><dt className="text-gray-500">Horário</dt><dd className="font-medium">{rua.horario}</dd></div>
          <div><dt className="text-gray-500">Última varrição</dt><dd className="font-medium">{formatDate(rua.ultimaVarricao)}</dd></div>
          <div><dt className="text-gray-500">Cadastrado em</dt><dd className="font-medium">{formatDate(rua.dataCadastro)}</dd></div>
        </dl>

        {rua.fotos?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Galeria do trecho</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {rua.fotos.map((src, i) => (
                <a key={i} href={src} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border aspect-video">
                  <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Histórico de varrições</h3>
          {historicoLoading ? (
            <p className="text-sm text-gray-400">Carregando histórico...</p>
          ) : historico.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhuma varrição registrada</p>
          ) : (
            <ul className="space-y-3">
              {historico.map((h) => (
                <li key={h.id} className="border rounded-lg p-3 text-sm bg-gray-50/50">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="font-medium text-gray-800">{formatDate(h.data)}</span>
                    <span className="text-primary font-semibold">{Number(h.kmExecutado).toFixed(1)} km</span>
                  </div>
                  <p className="text-gray-600 mt-1">{h.equipe} — {h.responsavel}</p>
                  {h.observacao && <p className="text-gray-500 mt-1">{h.observacao}</p>}
                  {h.fotos?.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {h.fotos.slice(0, 4).map((src, i) => (
                        <img key={i} src={src} alt="" className="w-16 h-12 object-cover rounded border" />
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {canManage && (
          <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t">
            <button type="button" disabled={loadingAction || rua.ativa === false} onClick={onRegistrar} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark disabled:opacity-50">
              Registrar varrição
            </button>
            <button type="button" onClick={onEdit} className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Editar</button>
            {rua.ativa !== false && (
              confirmDesativar ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-amber-700">Desativar esta rua?</span>
                  <button type="button" onClick={onDesativar} className="px-3 py-1.5 bg-amber-500 text-white rounded text-sm">Sim</button>
                  <button type="button" onClick={() => setConfirmDesativar(false)} className="px-3 py-1.5 border rounded text-sm">Não</button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmDesativar(true)} className="px-4 py-2 border border-amber-300 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-50">Desativar</button>
              )
            )}
            {canDelete && (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-600">Confirmar exclusão?</span>
                  <button type="button" onClick={onExcluir} className="px-3 py-1.5 bg-red-600 text-white rounded text-sm">Sim, excluir</button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 border rounded text-sm">Não</button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmDelete(true)} className="px-4 py-2 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50">Excluir</button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}
