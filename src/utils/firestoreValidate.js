/** Campo preenchido: string não vazia após trim (ignora null/undefined). */
export function campoPreenchido(value) {
  if (value === undefined || value === null) return false
  return String(value).trim().length > 0
}

/**
 * Valida documento conforme campos obrigatórios de cada coleção de listagem.
 * Ignora registros incompletos ou corrompidos no Firestore.
 */
export function isDocumentoValido(collectionName, doc) {
  if (!doc?.id) return false

  switch (collectionName) {
    case 'pontos_viciados':
    case 'cacambas':
      return campoPreenchido(doc.endereco)
    case 'varricao':
      return campoPreenchido(doc.rua)
    case 'ecopontos':
      return campoPreenchido(doc.nome)
    case 'vistorias':
      return campoPreenchido(doc.ecopontoId)
    case 'protocolos_156':
      return campoPreenchido(doc.numero) && campoPreenchido(doc.endereco)
    default:
      return true
  }
}

export function filtrarDocumentosValidos(collectionName, items) {
  if (!Array.isArray(items)) return []
  return items.filter((doc) => isDocumentoValido(collectionName, doc))
}
