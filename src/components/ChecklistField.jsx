const CONDICOES = ['Bom', 'Regular', 'Insatisfatório']
const PRESENCA = ['Presente', 'Ausente']

export function ItemCheck({ label, value = {}, onChange, tipo = 'condicao', disabled }) {
  const opcoes = tipo === 'presenca' ? PRESENCA : CONDICOES
  return (
    <div className="border rounded-lg p-3 bg-gray-50">
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      <select
        value={value.condicao || ''}
        onChange={(e) => onChange({ ...value, condicao: e.target.value })}
        disabled={disabled}
        className="w-full border rounded px-2 py-1 text-sm mb-2"
      >
        <option value="">—</option>
        {opcoes.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <input
        placeholder="Observações"
        value={value.obs || ''}
        onChange={(e) => onChange({ ...value, obs: e.target.value })}
        disabled={disabled}
        className="w-full border rounded px-2 py-1 text-sm"
      />
    </div>
  )
}

export const ESTRUTURA_LABELS = {
  rampa: 'Rampa',
  baia05: 'Baia 05',
  adm: 'ADM',
  banheiro: 'Banheiro',
  portaoPrincipal: 'Portão Principal',
  gradil: 'Gradil',
  pintura: 'Pintura',
  iluminacao: 'Iluminação',
  telefone: 'Telefone',
  pavimentacao: 'Pavimentação',
}

export const RESIDUOS_LABELS = {
  entulhoRCC: 'Entulho (RCC)',
  podasArvores: 'Podas de árvores',
  moveis: 'Móveis',
  madeira: 'Madeira',
  reciclaveis: 'Recicláveis',
  eletroeletronicos: 'Eletroeletrônicos',
  gesso: 'Gesso',
}

export const COMUNICACAO_LABELS = {
  placas: 'Placas',
  adesivos07: 'Adesivos: 07',
  informes: 'Informes',
}
