import { useMemo } from 'react'
import PhotoUpload from '../PhotoUpload'
import { ItemCheck } from '../ChecklistField'
import { exportarLaudoPDF } from '../../utils/pdfLaudo'

// Labels específicos para PEV
export const PEV_OPERACAO_LABELS = {
  dataColeta: 'Data da coleta',
  frequencia: 'Frequência',
  coletaConforme: 'Coleta ocorreu conforme previsto',
}

export const PEV_INFRAESTRUTURA_LABELS = {
  estruturaIntegra: 'Estrutura íntegra (paredes/telhado)',
  limpezaGeral: 'Limpeza geral do PEV',
  presenciaVandalismo: 'Presença de vandalismo',
  portasPrincipais: 'Portas (Regular / Precária / Iluminada / Adequada / Irregular / Precária)',
}

export const PEV_ABERTURAS_INTERNAS_LABELS = {
  quantidadeJanelas: 'Quantidade de janelas funcionando',
  suportesMetalicos: 'Suportes metálicos íntegros',
  aberturaAcessivel: 'Abertura acessível',
}

export const PEV_ABERTURA_EXTERNA_LABELS = {
  funcionamentoAdequado: 'Funcionamento adequado',
  presenciaResiduos: 'Presença de resíduos fora da abertura',
}

export const PEV_CONDICAO_BAGS_LABELS = {
  quantidadeBags: 'Quantidade de bags instalados',
  nivelOcupacao: 'Nível de ocupação (Baixo / Médio / Alto / Transbordando)',
  bagsDanificados: 'Bags danificados ou com ruptura',
}

export const PEV_TIPOS_RESIDUOS_LABELS = {
  predominante: 'Resíduo predominante',
  residuosNaoReciclaveis: 'Presença de resíduos não recicláveis',
}

export const PEV_RETIRADA_BAGS_LABELS = {
  portaAcessoInterna: 'Porta de acesso (interna) íntegra',
  acessoRestrito: 'Acesso restrito mantido',
  retiradaRegular: 'Retirada ocorre regularmente',
}

export const PEV_IRREGULARIDADES_LABELS = {
  descarteIrregular: 'Descarte irregular no entorno',
  mauCheiro: 'Mau cheiro',
  presencaVetores: 'Presença de vetores',
}

export const PEV_FUNCIONAMENTO_LABELS = {
  equipamentoObjetivo: 'Equipamento atende ao objetivo',
  ajusteOperacional: 'Necessidade de ajuste operacional',
}

function initSection(labels) {
  return Object.keys(labels).reduce((acc, k) => {
    acc[k] = { condicao: '', obs: '' }
    return acc
  }, {})
}

export function createEmptyVistoriaPEV(fiscal = '', ecopontoId = '') {
  return {
    ecopontoId,
    ecopontoNome: '',
    tipo: 'pev',
    fiscal,
    dataVisita: new Date().toISOString().slice(0, 10),
    horario: '',
    contato: '',
    obs: '',
    operacao: initSection(PEV_OPERACAO_LABELS),
    infraestrutura: initSection(PEV_INFRAESTRUTURA_LABELS),
    aperturaInterna: initSection(PEV_ABERTURAS_INTERNAS_LABELS),
    aperturaExterna: initSection(PEV_ABERTURA_EXTERNA_LABELS),
    condicaoBags: initSection(PEV_CONDICAO_BAGS_LABELS),
    tiposResiduos: initSection(PEV_TIPOS_RESIDUOS_LABELS),
    retiradaBags: initSection(PEV_RETIRADA_BAGS_LABELS),
    irregularidades: initSection(PEV_IRREGULARIDADES_LABELS),
    funcionamento: initSection(PEV_FUNCIONAMENTO_LABELS),
    classificacaoFinal: '',
    fotos: [],
    conformidade: 0,
  }
}

export default function VistoriaPEVChecklist({
  form,
  setForm,
  ecopontos,
  disabled,
  onSave,
  saving,
  savedVistoria,
  ecopontoForPdf,
}) {
  const conformidade = useMemo(() => {
    // Calcula conformidade baseado nos itens "Bom" ou "Sim"
    let itens = 0
    let bom = 0
    const sections = [
      form.operacao,
      form.infraestrutura,
      form.aperturaInterna,
      form.aperturaExterna,
      form.condicaoBags,
      form.tiposResiduos,
      form.retiradaBags,
      form.irregularidades,
      form.funcionamento,
    ]
    sections.forEach((section) => {
      Object.values(section).forEach((item) => {
        if (item.condicao) {
          itens++
          if (item.condicao === 'Bom' || item.condicao === 'Sim') bom++
        }
      })
    })
    return itens > 0 ? Math.round((bom / itens) * 100) : 0
  }, [form])

  const onEcopontoChange = (id) => {
    const eco = ecopontos.find((e) => e.id === id)
    setForm({
      ...form,
      ecopontoId: id,
      ecopontoNome: eco?.nome || '',
      contato: eco?.contato || form.contato,
    })
  }

  const handleExport = () => {
    const v = { ...form, conformidade }
    const eco = ecopontoForPdf || ecopontos.find((e) => e.id === form.ecopontoId)
    exportarLaudoPDF(v, eco)
  }

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="bg-primary/10 border-b px-6 py-4">
        <h2 className="text-lg font-bold text-gray-800">Checklist de Vistoria - PEV</h2>
        <p className="text-sm text-gray-500">Prefeitura de Osasco — Pontos de Entrega Voluntária</p>
      </div>

      <div className="p-6 space-y-6 max-w-4xl">
        {/* Cabeçalho */}
        <section className="border rounded-xl p-4 bg-gray-50/50">
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">Identificação da Vistoria</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">PEV *</label>
              <select
                value={form.ecopontoId}
                onChange={(e) => onEcopontoChange(e.target.value)}
                disabled={disabled}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
              >
                <option value="">Selecione o PEV</option>
                {ecopontos
                  .filter((e) => e.ativo !== false && e.tipo === 'PEV')
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nome}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Data da visita *</label>
              <input
                type="date"
                value={form.dataVisita?.slice?.(0, 10) || form.dataVisita}
                onChange={(e) => setForm({ ...form, dataVisita: e.target.value })}
                disabled={disabled}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Hora da visita</label>
              <input
                type="time"
                value={form.horario}
                onChange={(e) => setForm({ ...form, horario: e.target.value })}
                disabled={disabled}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Fiscal responsável *</label>
              <input
                value={form.fiscal}
                onChange={(e) => setForm({ ...form, fiscal: e.target.value })}
                disabled={disabled}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Contato</label>
              <input
                value={form.contato}
                onChange={(e) => setForm({ ...form, contato: e.target.value })}
                disabled={disabled}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">OBS</label>
              <textarea
                value={form.obs || ''}
                onChange={(e) => setForm({ ...form, obs: e.target.value })}
                disabled={disabled}
                rows={2}
                className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
              />
            </div>
          </div>
        </section>

        {/* Operação de Coleta */}
        <section>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide border-b pb-2">Operação de Coleta (Planejado x Real)</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(PEV_OPERACAO_LABELS).map(([key, label]) => (
              <ItemCheck
                key={key}
                label={label}
                value={form.operacao?.[key]}
                onChange={(v) => setForm({ ...form, operacao: { ...form.operacao, [key]: v } })}
                tipo={key === 'coletaConforme' ? 'condicao' : 'presenca'}
                disabled={disabled}
              />
            ))}
          </div>
        </section>

        {/* Infraestrutura Geral */}
        <section>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide border-b pb-2">Infraestrutura Geral</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(PEV_INFRAESTRUTURA_LABELS).map(([key, label]) => (
              <ItemCheck
                key={key}
                label={label}
                value={form.infraestrutura?.[key]}
                onChange={(v) => setForm({ ...form, infraestrutura: { ...form.infraestrutura, [key]: v } })}
                disabled={disabled}
              />
            ))}
          </div>
        </section>

        {/* Aberturas Internas */}
        <section>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide border-b pb-2">Aberturas Internas (Parque - 4 Janelas)</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(PEV_ABERTURAS_INTERNAS_LABELS).map(([key, label]) => (
              <ItemCheck
                key={key}
                label={label}
                value={form.aperturaInterna?.[key]}
                onChange={(v) => setForm({ ...form, aperturaInterna: { ...form.aperturaInterna, [key]: v } })}
                disabled={disabled}
              />
            ))}
          </div>
        </section>

        {/* Abertura Externa */}
        <section>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide border-b pb-2">Abertura Externa (Rua)</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(PEV_ABERTURA_EXTERNA_LABELS).map(([key, label]) => (
              <ItemCheck
                key={key}
                label={label}
                value={form.aperturaExterna?.[key]}
                onChange={(v) => setForm({ ...form, aperturaExterna: { ...form.aperturaExterna, [key]: v } })}
                disabled={disabled}
              />
            ))}
          </div>
        </section>

        {/* Condição dos Bags */}
        <section>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide border-b pb-2">Condição dos Bags</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(PEV_CONDICAO_BAGS_LABELS).map(([key, label]) => (
              <ItemCheck
                key={key}
                label={label}
                value={form.condicaoBags?.[key]}
                onChange={(v) => setForm({ ...form, condicaoBags: { ...form.condicaoBags, [key]: v } })}
                disabled={disabled}
              />
            ))}
          </div>
        </section>

        {/* Tipos de Resíduos */}
        <section>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide border-b pb-2">Tipo de Resíduos</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(PEV_TIPOS_RESIDUOS_LABELS).map(([key, label]) => (
              <ItemCheck
                key={key}
                label={label}
                value={form.tiposResiduos?.[key]}
                onChange={(v) => setForm({ ...form, tiposResiduos: { ...form.tiposResiduos, [key]: v } })}
                disabled={disabled}
              />
            ))}
          </div>
        </section>

        {/* Retirada dos Bags */}
        <section>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide border-b pb-2">Retirada dos Bags</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(PEV_RETIRADA_BAGS_LABELS).map(([key, label]) => (
              <ItemCheck
                key={key}
                label={label}
                value={form.retiradaBags?.[key]}
                onChange={(v) => setForm({ ...form, retiradaBags: { ...form.retiradaBags, [key]: v } })}
                disabled={disabled}
              />
            ))}
          </div>
        </section>

        {/* Irregularidades */}
        <section>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide border-b pb-2">Irregularidades (Parque - 4 Janelas)</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(PEV_IRREGULARIDADES_LABELS).map(([key, label]) => (
              <ItemCheck
                key={key}
                label={label}
                value={form.irregularidades?.[key]}
                onChange={(v) => setForm({ ...form, irregularidades: { ...form.irregularidades, [key]: v } })}
                disabled={disabled}
              />
            ))}
          </div>
        </section>

        {/* Funcionamento / Equipamento */}
        <section>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide border-b pb-2">Funcionamento / Equipamento</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(PEV_FUNCIONAMENTO_LABELS).map(([key, label]) => (
              <ItemCheck
                key={key}
                label={label}
                value={form.funcionamento?.[key]}
                onChange={(v) => setForm({ ...form, funcionamento: { ...form.funcionamento, [key]: v } })}
                disabled={disabled}
              />
            ))}
          </div>
        </section>

        {/* Classificação Final */}
        <section className="border-t pt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Classificação final *</label>
            <select
              value={form.classificacaoFinal || ''}
              onChange={(e) => setForm({ ...form, classificacaoFinal: e.target.value })}
              disabled={disabled}
              className="w-full border rounded-lg px-3 py-2 text-sm mt-1"
            >
              <option value="">Selecione</option>
              <option value="Adequado">Adequado</option>
              <option value="Atenção">Atenção</option>
              <option value="Crítico">Crítico</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2">Fotos (máximo 5)</label>
            <PhotoUpload fotos={form.fotos} onChange={(fotos) => setForm({ ...form, fotos })} disabled={disabled} maxPhotos={5} />
          </div>

          <div className="rounded-xl bg-primary-light/40 border border-primary/20 p-4 text-center">
            <p className="text-sm text-gray-600">Percentual de conformidade</p>
            <p className="text-4xl font-bold text-primary mt-1">{conformidade}%</p>
            <p className="text-xs text-gray-500 mt-1">Baseado em itens &quot;Bom&quot; e &quot;Sim&quot;</p>
          </div>

          {!disabled && (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onSave(conformidade)}
                disabled={saving || !form.ecopontoId}
                className="flex-1 min-w-[200px] py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar vistoria'}
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={!savedVistoria && !form.ecopontoId}
                className="px-6 py-3 border border-primary text-primary rounded-lg font-medium hover:bg-primary-light disabled:opacity-50"
                title={savedVistoria ? 'Exportar última vistoria salva' : 'Salve antes ou preencha o formulário'}
              >
                Exportar laudo PDF
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
