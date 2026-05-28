import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore'
import { db } from './config'
import { filtrarDocumentosValidos } from '../utils/firestoreValidate'

export const COLLECTIONS = {
  PONTOS: 'pontos_viciados',
  CACAMBAS: 'cacambas',
  VARRICAO: 'varricao',
  ECOPONTOS: 'ecopontos',
  VISTORIAS: 'vistorias',
  VISTORIAS_CACAMBAS: 'vistorias_cacambas',
  PROTOCOLOS: 'protocolos_156',
  USUARIOS: 'usuarios',
}

function mapAndFilter(collectionName, snap) {
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return filtrarDocumentosValidos(collectionName, items)
}

export async function getAll(collectionName) {
  const q = query(collection(db, collectionName), orderBy('dataCadastro', 'desc'))
  try {
    const snap = await getDocs(q)
    return mapAndFilter(collectionName, snap)
  } catch {
    const snap = await getDocs(collection(db, collectionName))
    return mapAndFilter(collectionName, snap)
  }
}

export async function getById(collectionName, id) {
  const snap = await getDoc(doc(db, collectionName, id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export async function create(collectionName, data) {
  const ref = await addDoc(collection(db, collectionName), {
    ...data,
    dataCadastro: data.dataCadastro || new Date().toISOString(),
  })
  return ref.id
}

const BATCH_SIZE = 450

export async function createBatch(collectionName, items) {
  const ids = []
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const chunk = items.slice(i, i + BATCH_SIZE)
    const batch = writeBatch(db)
    chunk.forEach((item) => {
      const ref = doc(collection(db, collectionName))
      ids.push(ref.id)
      batch.set(ref, {
        ...item,
        dataCadastro: item.dataCadastro || new Date().toISOString(),
      })
    })
    await batch.commit()
  }
  return ids
}

export async function update(collectionName, id, data) {
  await updateDoc(doc(db, collectionName, id), data)
}

export async function remove(collectionName, id) {
  await deleteDoc(doc(db, collectionName, id))
}

export function subscribe(collectionName, callback) {
  const q = query(collection(db, collectionName))
  return onSnapshot(q, (snap) => {
    callback(mapAndFilter(collectionName, snap))
  })
}

export function historicoVarricaoRef(varricaoId) {
  return collection(db, COLLECTIONS.VARRICAO, varricaoId, 'historico')
}

export async function getHistoricoVarricao(varricaoId) {
  try {
    const q = query(historicoVarricaoRef(varricaoId), orderBy('data', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch {
    const snap = await getDocs(historicoVarricaoRef(varricaoId))
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  }
}

export function subscribeHistoricoVarricao(varricaoId, callback) {
  const q = query(historicoVarricaoRef(varricaoId))
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    items.sort((a, b) => new Date(b.data) - new Date(a.data))
    callback(items)
  })
}

export async function addHistoricoVarricao(varricaoId, data) {
  const ref = await addDoc(historicoVarricaoRef(varricaoId), {
    ...data,
    data: data.data || new Date().toISOString(),
  })
  return ref.id
}

export async function fetchAllHistoricoVarricao(varricaoIds) {
  const results = await Promise.all(
    varricaoIds.map(async (id) => {
      const items = await getHistoricoVarricao(id)
      return items.map((item) => ({ ...item, varricaoId: id }))
    }),
  )
  return results.flat()
}

export async function removeVarricaoComHistorico(varricaoId) {
  const snap = await getDocs(historicoVarricaoRef(varricaoId))
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
  await deleteDoc(doc(db, COLLECTIONS.VARRICAO, varricaoId))
}
