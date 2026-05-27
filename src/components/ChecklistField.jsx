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
