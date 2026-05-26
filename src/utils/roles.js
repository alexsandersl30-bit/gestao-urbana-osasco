export const PERFIS = {
  GESTOR: 'Gestor',
  FISCAL: 'Fiscal',
  OPERADOR: 'Operador',
}

export function canEdit(perfil) {
  return perfil === PERFIS.GESTOR || perfil === PERFIS.FISCAL
}

export function canDeletePontosViciados(perfil) {
  return perfil === PERFIS.GESTOR
}

export function canManagePontosViciados(perfil) {
  return perfil === PERFIS.GESTOR || perfil === PERFIS.FISCAL
}

export function canDeleteCacambas(perfil) {
  return perfil === PERFIS.GESTOR
}

export function canManageCacambas(perfil) {
  return perfil === PERFIS.GESTOR || perfil === PERFIS.FISCAL
}

export function canDeleteVarricao(perfil) {
  return perfil === PERFIS.GESTOR
}

export function canManageVarricao(perfil) {
  return perfil === PERFIS.GESTOR || perfil === PERFIS.FISCAL
}

export function canDeleteEcopontos(perfil) {
  return perfil === PERFIS.GESTOR
}

export function canManageEcopontos(perfil) {
  return perfil === PERFIS.GESTOR || perfil === PERFIS.FISCAL
}

export function canManageUsers(perfil) {
  return perfil === PERFIS.GESTOR
}

export function canDeleteProtocolos(perfil) {
  return perfil === PERFIS.GESTOR
}

export function canManageProtocolos(perfil) {
  return perfil === PERFIS.GESTOR || perfil === PERFIS.FISCAL
}

export function canImportProtocolosExcel(perfil) {
  return perfil === PERFIS.GESTOR
}

export function canAccessRoute(perfil, route) {
  if (route === '/usuarios') return canManageUsers(perfil)
  return true
}
