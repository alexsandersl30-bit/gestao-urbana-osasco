import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db, firebaseConfig } from './config'

export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  return cred.user
}

export async function logout() {
  await signOut(auth)
}

export async function createUserAccount({ email, password, nome, perfil }) {
  const secondaryApp = initializeApp(firebaseConfig, 'Secondary')
  const secondaryAuth = getAuth(secondaryApp)

  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password)
    await setDoc(doc(db, 'usuarios', cred.user.uid), {
      email,
      nome,
      perfil,
      criadoEm: new Date().toISOString(),
    })
    return cred.user.uid
  } finally {
    await deleteApp(secondaryApp)
  }
}
