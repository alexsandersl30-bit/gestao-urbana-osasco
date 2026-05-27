import { useState } from 'react'
import BadgeStatusCacamba from './BadgeStatus'
import { formatDate } from '../../utils/dates'
import { calcStatusCacamba } from '../../utils/cacambas'
import { canDeleteCacambas, canManageCacambas } from '../../utils/roles'

export default function CacambaDetalhes({
  cacamba,
  perfil,
  onBack,
  onEdit,
  onColeta,
  onDesativar,
  onExcluir,
  loadingAction,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmDesativar, setConfirmDesativar] = useState(false)
  const canManage = canManageCacambas(perfil)
  const canDelete = canDeleteCacambas(perfil)
  const status = calcStatusCacamba(cacamba)
  const historico = [...(cacamba.historicoColetas || [])].sort(
    (a, b) => new Date(b.data || b) - new Date(a.data || a),
  )

  return (
    <div className="space-y-6">
      <button type="button" onClick={onBack} className="text-sm text-green-600 hover:underline">
        ← Voltar para lista
      </button>

      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <div className="flex flex-wrap justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{cacamba.endereco}</h2>
            <p className="text-gray-500">{cacamba.bairro}</p>
          </div>
          <div className="flex gap-2 items-center">
            <BadgeStatusCacamba status={status} />
            {cacamba.ativa === false && (
              <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-600">Inativa</span>
            )}
          </div>
        </div>

        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
          <div><dt className="text-gray-500">Frequência</dt><dd className="font-medium">{cacamba.frequencia}</dd></div>
          <div><dt className="text-gray-500">Empresa</dt><dd className="font-medium">{cacamba.empresa}</dd></div>
          <div><dt className="text-gray-500">Capacidade</dt><dd className="font-medium">{cacamba.capacidade} m³</dd></div>
          <div><dt className="text-gray-500">Última coleta</dt><dd className="font-medium">{formatDate(cacamba.ultimaColeta)}</dd></div>
          <div><dt className="text-gray-500">Cadastrado em</dt><dd className="font-medium">{formatDate(cacamba.dataCadastro)}</dd></div>
        </dl>

        {cacamba.fotos?.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Galeria de fotos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {cacamba.fotos.map((src, i) => (
                <a key={i} href={src} target="_blank" rel="noreferrer" className="block rounded-lg overflow-hidden border aspect-video">
                  <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Histórico de coletas</h3>
          {historico.length === 0 ? (
            <p className="text-sm text-gray-400">Nenhuma coleta registrada</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {historico.map((h, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-600 border-b border-gray-50 pb-2">
                  <span className="w-2 h-2 rounded-full bg-green-600 shrink-0" />
                  <span className="font-medium">{formatDate(h.data || h)}</span>
                  {h.responsavel && <span className="text-gray-400">— {h.responsavel}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>

        {canManage && (
          <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t">
            <button
              type="button"
              disabled={loadingAction || cacamba.ativa === false}
              onClick={onColeta}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              Registrar coleta
            </button>
            <button
              type="button"
              onClick={onEdit}
              className="bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm border border-gray-200 transition-colors"
            >
              Editar
            </button>
            {cacamba.ativa !== false && (
              confirmDesativar ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-amber-700">Desativar esta caçamba?</span>
                  <button type="button" onClick={onDesativar} className="bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium px-3 py-1.5 rounded-lg text-sm border border-amber-200 transition-colors">Sim</button>
                  <button type="button" onClick={() => setConfirmDesativar(false)} className="bg-white hover:bg-gray-50 text-gray-700 font-medium px-3 py-1.5 rounded-lg text-sm border border-gray-200 transition-colors">Não</button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDesativar(true)}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium px-4 py-2 rounded-lg text-sm border border-amber-200 transition-colors"
                >
                  Desativar
                </button>
              )
            )}
            {canDelete && (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-600">Confirmar exclusão?</span>
                  <button type="button" onClick={onExcluir} className="bg-red-50 hover:bg-red-100 text-red-700 font-medium px-3 py-1.5 rounded-lg text-sm border border-red-200 transition-colors">Sim, excluir</button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="bg-white hover:bg-gray-50 text-gray-700 font-medium px-3 py-1.5 rounded-lg text-sm border border-gray-200 transition-colors">Não</button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="bg-red-50 hover:bg-red-100 text-red-700 font-medium px-4 py-2 rounded-lg text-sm border border-red-200 transition-colors"
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
